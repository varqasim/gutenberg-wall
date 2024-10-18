import { eq } from "drizzle-orm";

import { db } from "../../../libs/db";
import { BaseRepository } from "../../../libs/db/BaseRepository";
import { UserMapper } from "../Mapper";
import { User } from "../User";
import { UserModel, usersTable } from "./schema";

type UserInsertModel = typeof usersTable.$inferInsert;

export class UserRepository implements BaseRepository<User> {
  async create(user: User): Promise<void> {
    const userModel: UserInsertModel = {
      user_id: user.id,
      name: user.name,
      email: user.email,
    };

    await db.insert(usersTable).values(userModel);
  }

  async findOneById(id: string): Promise<User | undefined> {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.user_id, id));

    if (user.length === 0) {
      return undefined;
    }

    return UserMapper.toDomain(user[0] as unknown as UserModel);
  }
}
