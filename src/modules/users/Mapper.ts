import { User } from "./User";
import { UserModel } from "./database/schema";

export class UserMapper {
  static toDomain(userModel: UserModel): User {
    return new User(userModel.user_id, userModel.name, userModel.email);
  }

  static toResponse(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email
    }
  }
}
