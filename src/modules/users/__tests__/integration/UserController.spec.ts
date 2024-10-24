import { beforeAll, describe, it, expect } from "vitest";

import { faker } from "@faker-js/faker";
import {
  CognitoIdentityProviderClient,
  GetUserRequest,
} from "@aws-sdk/client-cognito-identity-provider";

import { UserController } from "../../controller/UserController";
import { CognitoService } from "../../CognitoService";
import { UserRepository } from "../../database/UserRepository";
import { SignUpReq } from "../../controller/schema";
import { User } from "../../User";
import { randomUUID } from "crypto";

describe("UserController", () => {
  let cognitoIdentityProviderClient: CognitoIdentityProviderClient;

  let cognitoService: CognitoService;
  let userRepository: UserRepository;
  let userController: UserController;

  beforeAll(() => {
    cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
      endpoint:
        process.env.ENVIRONMENT === "dev" ? "http://localhost:4566" : undefined,
      region: process.env.AWS_REGION || "us-east-1",
    });
    cognitoService = new CognitoService(cognitoIdentityProviderClient);
    userRepository = new UserRepository();

    userController = new UserController(cognitoService, userRepository);
  });

  describe("Sign Up", () => {
    it("should throw ValidationError when the request argument is invalid", async () => {
      const req = { name: faker.person.firstName() };

      await expect(userController.signUp(req as SignUpReq)).rejects.toThrow(
        "Validation Error"
      );
    });

    it("should get the user if it already exists on sign up", async () => {
      const userInfo = { name: faker.person.firstName(), email: faker.internet.email() };
      const existingCognitoUser = await cognitoService.createUser(userInfo.name, userInfo.email);

      const response = await userController.signUp({ name: userInfo.name, email: userInfo.email });
      
      expect(response).toMatchObject({
        id: existingCognitoUser.id,
        name: existingCognitoUser.name,
        email: existingCognitoUser.email
      });
    });

    it("should create a cognito user & store the user in the database", async () => {
      const req: SignUpReq = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
      };

      const response = await userController.signUp(req);

      const cognitoUser = await cognitoService.getUserByEmail(req.email);
      expect(cognitoUser).toEqual({
        id: expect.any(String),
        name: req.name,
        email: req.email,
      });

      expect(response).toMatchObject({
        id: cognitoUser?.id,
        name: req.name,
        email: req.email,
      });
    });
  });

  describe("Get User", () => {
    it("should return undefined if the user does not exists", async () => {
      const response = await userController.getUser(randomUUID());

      expect(response).toBeUndefined();
    });

    it("should return the user if it exists", async () => {
      const user = new User(
        randomUUID(),
        faker.person.firstName(),
        faker.internet.email()
      );
      await userRepository.create(user);

      const response = await userController.getUser(user.id);

      expect(response).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    });
  });
});
