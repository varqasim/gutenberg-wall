import { ExceptionBase } from "../../../libs/exceptions";


export namespace UserErrors {
  export class ValidationError extends ExceptionBase {
    code: string = "VALIdATION_ERROR";
  }
  
}