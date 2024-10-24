import { User } from "../User";
import { CognitoService } from "../CognitoService";
import { UserRepository } from "../database/UserRepository";
import { CreateUserProfileReq, CreateUserProfileSchema } from "./schema";
import { UserMapper } from "../Mapper";
import { UserErrors } from "./UserErrors";
import { ZodIssue } from "zod";

export class UserController {
  constructor(
    private readonly cognitoService: CognitoService,
    private readonly userRepository: UserRepository
  ) {}

  async createUserProfile(req: CreateUserProfileReq): Promise<User> {
    try {
      CreateUserProfileSchema.parse(req);
    } catch (error) {
      throw new UserErrors.ValidationError((error as unknown as ZodIssue).message, error as Error);
    }

    try {
      const cognitoUser = await this.cognitoService.getUserById(req.id);

      if (!cognitoUser) {
        throw new Error("User not found");
      }

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

  async getUserProfile(id: string): Promise<User | undefined> {
    const user = await this.userRepository.findOneById(id);

    if (!user) {
      return undefined;
    }

    return UserMapper.toResponse(user);
  }
}
