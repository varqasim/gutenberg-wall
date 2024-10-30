import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export class LibraryService {
  constructor(
    private readonly s3Client: S3Client
  ) { }

  async getBookUrl(bookId: string) {
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: LibraryService.getS3BookKey(bookId)
    });

    const preSignedUrl = await getSignedUrl(this.s3Client, getObjectCommand, { expiresIn: 3600 });
    return preSignedUrl;
  }


  static getS3BookKey(bookId: string) {
    return `books/${bookId}/book.txt`;
  }

  static createS3ImageKey(bookId: string) {
    return `books/${bookId}/image`;
  }

  static createS3Location(bookId: string) {
    const key = this.getS3BookKey(bookId);
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

}