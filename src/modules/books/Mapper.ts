import Book from "./Book";
import { BookModel } from "./database/schema";

export class BookMapper {
  static toDomain(bookModel: BookModel) {
    return new Book(
      bookModel.gutenberg_id,
      bookModel.title,
      bookModel.author,
      bookModel.image_url,
      bookModel.published_on,
      bookModel.summary
    );
  }
}
