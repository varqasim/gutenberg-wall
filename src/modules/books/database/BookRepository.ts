import { eq } from "drizzle-orm";

import { db } from "../../../libs/db";
import Book from "../Book";
import { BookModel, booksTable } from "./schema";
import { BookMapper } from "../Mapper";

type BookInsertModel = typeof booksTable.$inferInsert;

export default class BookRepository {
  async create(book: Book) {
    const bookModel: BookInsertModel = {
      gutenberg_id: book.id,
      title: book.title,
      author: book.author,
      image_url: book.imageUrl,
      published_on: book.publishedOn,
      summary: book.summary,
    }
    
    await db.insert(booksTable).values(bookModel);
  }

  async findOneById(bookId: string): Promise<Book | undefined> {
    const books = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.gutenberg_id, bookId))
      .limit(1);

    if (books.length === 0) {
      return undefined;
    }

    return BookMapper.toDomain(books[0] as unknown as BookModel);

  }
}