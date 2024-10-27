import { beforeAll, describe, it, expect } from "vitest";

import { faker } from "@faker-js/faker";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

import { UserController } from "../../controller/UserController";
import { CognitoService } from "../../CognitoService";
import { UserRepository } from "../../database/UserRepository";
import { CreateUserProfileReq } from "../../controller/schema";
import { User } from "../../User";
import { randomUUID } from "crypto";
import { UserErrors } from "../../controller/UserErrors";

describe("UserController", () => {
  let cognitoIdentityProviderClient: CognitoIdentityProviderClient;

  let cognitoService: CognitoService;
  let userRepository: UserRepository;
  let userController: UserController;

  beforeAll(() => {
    cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || "us-east-1",
    });
    cognitoService = new CognitoService(cognitoIdentityProviderClient);
    userRepository = new UserRepository();

    userController = new UserController(cognitoService, userRepository);
  });

  describe("Sign Up", () => {
    it("should throw ValidationError when the request argument is invalid", async () => {
      const req = { /*id: randomUUID(),*/ name: faker.person.firstName(), email: faker.internet.email() };

      await expect(
        userController.createUserProfile(req as CreateUserProfileReq)
      ).rejects.toThrow(UserErrors.ValidationError);
    });

    it("should throw an error if a non existing cognito exists for the user", async () => {
      const userInfo = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
      };

      await expect(
        userController.createUserProfile({
          id: randomUUID(),
          name: userInfo.name,
          email: userInfo.email,
        })
      ).rejects.toThrow(UserErrors.UserNotFoundError);
    });

    it("should get the user if it already exists on sign up", async () => {
      // Arrange
      const userInfo = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
      };
      const existingCognitoUser = await cognitoService.createUser(
        userInfo.name,
        userInfo.email
      );

      // Act
      const response = await userController.createUserProfile({
        id: existingCognitoUser.id,
        name: userInfo.name,
        email: userInfo.email,
      });

      // Assert
      expect(response).toMatchObject({
        id: existingCognitoUser.id,
        name: existingCognitoUser.name,
        email: existingCognitoUser.email,
      });
    });

    it("should create a user profile and store it in the database", async () => {
      // Arrange
      const cognitoUser = await cognitoService.createUser(faker.person.firstName(), faker.internet.email());
      const req: CreateUserProfileReq = {
        id: cognitoUser.id,
        name: cognitoUser.name,
        email: cognitoUser.email,
      };

      // Act
      const response = await userController.createUserProfile(req);

      // Assert
      expect(response).toMatchObject({
        id: cognitoUser.id,
        name: req.name,
        email: req.email,
      });
    });
  });

  describe("Get User", () => {
    it("should return undefined if the user does not exists", async () => {
      const response = await userController.getUserProfile(randomUUID());
      expect(response).toBeUndefined();
    });

    it("should return the user if it exists", async () => {
      const user = new User(
        randomUUID(),
        faker.person.firstName(),
        faker.internet.email()
      );
      await userRepository.create(user);

      const response = await userController.getUserProfile(user.id);

      expect(response).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    });
  });
});
