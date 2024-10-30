import type { FastifyReply, FastifyRequest } from "fastify";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../../libs/exceptions";
import { BookController } from "./BookController";
import BookRepository from "./database/BookRepository";
import { GutenbergService } from "./GutenBergService";
import { httpClient } from "../../libs/api/HttpClient";
import { S3Client } from "@aws-sdk/client-s3";
import { LibraryService } from "./LibraryService";


const s3Client = new S3Client({ region: process.env.AWS_REGION });
const bookRepository = new BookRepository();
const gutenbergService = new GutenbergService(
  httpClient,
  s3Client
);
const libraryService = new LibraryService(s3Client);

const bookController = new BookController(
  bookRepository,
  gutenbergService,
  libraryService,
);


export const getBookByIdRoute = async(
  request: FastifyRequest<{ Params: { bookId: string }}>,
  reply: FastifyReply
) => {
  const { bookId } = request.params;

  try {
    const book = await bookController.getBook(bookId);

    if (!book) {
      return reply.code(404).send({
        error: {
          code: NOT_FOUND,
          title: "Error",
          message: "Not Found"
        }
      })
    }

    return reply.code(200)
      .send({
        id: book.id,
        title: book.title,
        author: book.author,
        summary: book.summary,
        publishedOn: book.publishedOn,
        imageUrl: book.imageUrl,
        url: book.url
      });
  } catch (error) {
    return reply.code(500).send({
      error: {
        code: INTERNAL_SERVER_ERROR,
        title: "Error",
        message: "Internal Server Error"
      }
    })
  }
}