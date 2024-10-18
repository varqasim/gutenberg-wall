import { Axios } from "axios";
import Book from "../Book";

export default class GutenbergService {
  constructor(
    private readonly apiClient: Axios
  ) {
    this.apiClient.defaults.baseURL = process.env.GUTENBERG_BASE_PATH ?? 'https://gutenberg.org';
  }

  async getBook(bookId: string): Promise<Book> {
    return new Book("id", "name", "");
  }
}