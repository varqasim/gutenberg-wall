import { S3Client } from "@aws-sdk/client-s3";

export default class BookRepository {

  constructor(
    private readonly s3Client: S3Client
  ) { }

  async getBookUrl(bookId: string) {

  }
}