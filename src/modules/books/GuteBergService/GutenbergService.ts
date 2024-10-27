import { PassThrough, Stream } from "node:stream";
import { format } from "date-fns";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import type { AxiosInstance } from "axios";
import * as cheerio from "cheerio";


interface GutenBergBook {
  bookId: string;
  title: string;
  author: string;
  imageUrl: string;
  releaseDate: string;
  url: string;
}

type GetBookMetadataResponse = GutenBergBook;

export class GutenbergService {
  private FIVE_MB: number = 5 * 1024 * 1024;

  constructor(
    private readonly apiClient: AxiosInstance,
    private readonly s3Client: S3Client
  ) {
    if (!process.env.AWS_REGION) {
      throw new Error("AWS_REGION env variable is not set");
    }

    if (!process.env.S3_BUCKET_NAME) {
      throw new Error("S3_BUCKET_NAME env variable is not set");
    }

    apiClient.defaults.baseURL =
      process.env.GUTENBERG_BASE_PATH ?? "https://gutenberg.org/";
  }

  async getBook(bookId: string): Promise<GutenBergBook> {
    try {
      const { headers } = await this.apiClient.head(
        `files/${bookId}/${bookId}-0.txt`
      );

      let s3Key: string = this.createS3BookKey(bookId);
      let promises = [];
      if (Number(headers["Content-Length"] ?? 0) >= this.FIVE_MB) {
        const response = await this.apiClient.get(
          `files/${bookId}/${bookId}-0.txt`,
          { responseType: "stream" }
        );
        promises.push(this.uploadLargeBook(s3Key, response.data));
      } else {
        const response = await this.apiClient.get(
          `files/${bookId}/${bookId}-0.txt`
        );
        promises.push(this.uploadSmallBook(s3Key, response.data));
      }

      promises.push(this.getBookMetadata(bookId));

      const [uploadResponse, metadataResponse] = await Promise.all(promises);

      const { title, author, imageUrl, releaseDate } = metadataResponse as GetBookMetadataResponse;
      const formattedReleaseDate = format(new Date(releaseDate), "yyyy-MM-dd");

      return {
        bookId: bookId,
        title: title,
        author: author,
        imageUrl: imageUrl,
        releaseDate: formattedReleaseDate,
        url: uploadResponse as string,
        
      };
    } catch (error) {
      console.error(error);
      throw new Error("Error while getting book from Gutenberg");
    }
  }

  private async getBookMetadata(
    bookId: string
  ): Promise<GetBookMetadataResponse> {
    const abortController = new AbortController();

    const response = await this.apiClient.get(`ebooks/${bookId}`, {
      responseType: "stream",
      signal: abortController.signal,
      timeout: 5_000
    });

    let htmlBuffer = "";
    return new Promise((resolve, reject) => {
      let title = "";
      let author = "";
      let imageUrl = "";
      let releaseDate = "";

      response.data.on("data", (chunk: any) => {
        htmlBuffer += chunk.toString();

        if (htmlBuffer.includes("cover-social-wrapper")) {
          const $ = cheerio.load(htmlBuffer);
          imageUrl = $("img")[1].attribs.src;
        }

        if (htmlBuffer.includes("</table>") && htmlBuffer.includes("bibrec")) {
          abortController.abort();

          const $ = cheerio.load(htmlBuffer);

          $(".bibrec tr").each((_, elem) => {
            const label = $(elem).find("th").text().trim();
            const value = $(elem).find("td").text().trim();

            switch (label) {
              case "Title":
                title = value;
                break;
              case "Author":
                author = value;
                break;
              case "Release Date":
                releaseDate = value;
                break;
              default:
                break;
            }
          });
        }

        htmlBuffer = "";

        if (title && author && releaseDate && imageUrl)  {
          resolve({ bookId: bookId, title, author, imageUrl, releaseDate, url: "" });
        }
      });

      response.data.on("error", (error: any) => {
        if (error.name !== "CanceledError") {
          console.error(error)
          reject();
        }
      });
    });
  }

  private async uploadSmallBook(s3Key: string, bookText: string) {
    try {
      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: s3Key,
        Body: bookText,
        ContentType: "text/html",
      });

      await this.s3Client.send(putObjectCommand);
      return this.createS3Location(s3Key);
    } catch (error) {
      console.error(error);
    }
  }

  private async uploadLargeBook(s3Key: string, stream: Stream) {
    try {
      const passThrough = new PassThrough();
      stream.pipe(passThrough);

      const parallelUpload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: s3Key,
          Body: passThrough,
          ContentType: "text/html",
        },
        queueSize: 4,
        partSize: 5 * 1024 * 1024,
        leavePartsOnError: false,
      });

      parallelUpload.on("httpUploadProgress", (progress) => {
        console.log(
          `Progress: ${progress.loaded}/${progress.total} bytes`,
          `(${((progress.loaded! / progress.total!) * 100).toFixed(2)}%)`
        );
      });

      await parallelUpload.done();
      return this.createS3Location(s3Key);
    } catch (error) {
      console.error(error);
    }
  }

  private createS3BookKey(bookId: string) {
    return `books/${bookId}/book.txt`;
  }

  private createS3ImageKey(bookId: string) {
    return `books/${bookId}/image`;
  }

  private createS3Location(bookId: string) {
    const key = this.createS3BookKey(bookId);
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
}
