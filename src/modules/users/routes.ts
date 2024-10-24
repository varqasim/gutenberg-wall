import type { FastifyReply, FastifyRequest } from "fastify";

import { UserController } from "./controller";
import { CognitoService } from "./CognitoService";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { UserRepository } from "./database/UserRepository";
import { INTERNAL_SERVER_ERROR } from "../../libs/exceptions";
import { UserErrors } from "./controller/UserErrors";
import { CreateUserProfileReq } from "./controller/schema";

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});
const cognitoService = new CognitoService(
  new CognitoIdentityProviderClient(cognitoIdentityProviderClient)
);

const userRepository = new UserRepository();
const userController = new UserController(cognitoService, userRepository);

export const createProfileRoute = async (
  request: FastifyRequest<{ Body: CreateUserProfileReq }>,
  reply: FastifyReply
) => {
  const body = request.body;

  try {
    const response = await userController.createUserProfile({
      id: body?.id,
      name: body?.name,
      email: body?.email,
    });

    return reply.status(201).send({
      id: response.id,
      name: response.name,
      email: response.email,
    });
  } catch (error) {
    if (error instanceof UserErrors.ValidationError) {
      return reply.status(422).send({
        code: error.code,
        title: error.name,
        message: error.message,
      });
    }
    
    return reply.status(500).send({
      error: {
        code: INTERNAL_SERVER_ERROR,
        title: "Error",
        message: "Internal Server Error",
      },
    });
  }
};

export const getUserRoute = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const headers = request.headers;
  console.log({ headers });
  return reply.status(404).send("NOT FOUND");
};
