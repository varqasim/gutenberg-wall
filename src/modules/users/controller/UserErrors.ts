import { ExceptionBase } from "../../../libs/exceptions";


export namespace UserErrors {
  export class ValidationError extends ExceptionBase {
    code: string = "VALIdATION_ERROR";
  }

  export class UserNotFoundError extends ExceptionBase {
    code: string = "USER_NOT_FOUND";
    message = "User does not exists";
  }
  
}