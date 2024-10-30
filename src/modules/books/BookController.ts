import Book from "./Book";
import BookRepository from "./database/BookRepository";
import { GutenbergService } from "./GutenBergService/GutenbergService";
import { GutenbergServiceErrors } from "./GutenBergService/GutenbergServiceErrors";
import { LibraryService } from "./LibraryService";

export class BookController {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly gutenbergService: GutenbergService,
    private readonly libraryService: LibraryService
  ) {}

  async getBook(
    bookId: string
  ): Promise<(Book & { url?: string }) | undefined> {
    let book = await this.bookRepository.findOneById(bookId);

    if (!book) {
      try {
        const gutenbergBook = await this.gutenbergService.getBook(bookId);
        
        if (!gutenbergBook) {
          return;
        }

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
    }

    const url = await this.libraryService.getBookUrl(book.id);

    return { ...book, url };
  }

  async summarizeBok(bookId: string) {
    
  }
}
