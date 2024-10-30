import { ExceptionBase } from "../../../libs/exceptions";

export namespace GutenbergServiceErrors {
  export class BookNotFound extends ExceptionBase {
    code: string = "BOOK_NOT_FOU?ND";
    message: string = "Book does not exists";
  }
}