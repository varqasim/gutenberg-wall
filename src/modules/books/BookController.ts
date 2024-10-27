import Book from "./Book";
import BookRepository from "./database/BookRepository";
import { GutenbergService } from "./GuteBergService/GutenbergService";
import { GutenbergServiceErrors } from "./GuteBergService/GutenbergServiceErrors";

export class BookController {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly gutenbergService: GutenbergService
  ) {}

  async getBook(
    bookId: string
  ): Promise<(Book & { url?: string }) | undefined> {
    // let book = await this.bookRepository.findOneById(bookId);
    let book: Book | undefined = undefined;

    try {
      const gutenbergBook = await this.gutenbergService.getBook(bookId);
      book = new Book(
        bookId,
        gutenbergBook.title,
        gutenbergBook.author,
        gutenbergBook.imageUrl,
        gutenbergBook.releaseDate,
        undefined
      );
      await this.bookRepository.create(book);
    } catch (error) {
      if (error instanceof GutenbergServiceErrors.BookNotFound) {
        return undefined;
      } else {
        console.error(error);
        throw new Error("Internal Server Error");
      }
    }

    return { ...book, url: "" };
  }
}
