import { User } from "../User";
import { CognitoService } from "../CognitoService";
import { UserRepository } from "../database/UserRepository";
import { SignUpReq, SignUpReqSchema } from "./schema";
import { UserMapper } from "../Mapper";
import { UserErrors } from "./UserErrors";
import { ZodError, ZodIssue } from "zod";

export class UserController {
  constructor(
    private readonly cognitoService: CognitoService,
    private readonly userRepository: UserRepository
  ) {}

  async signUp(req: SignUpReq): Promise<User> {
    try {
      SignUpReqSchema.parse(req);
    } catch (error) {
      throw new UserErrors.ValidationError((error as unknown as ZodIssue).message, error as Error);
    }

    try {
      const cognitoUser = await this.cognitoService.createUser(
        req.name,
        req.email
      );

      const user = new User(
        cognitoUser.id,
        cognitoUser.name,
        cognitoUser.email
      );

      await this.userRepository.create(user);

      return user;
    } catch (error) {
      console.error(error);
      throw new Error("Unexpected Error");
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await this.userRepository.findOneById(id);

    if (!user) {
      return undefined;
    }

    return UserMapper.toResponse(user);
  }
}
