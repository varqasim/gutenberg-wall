import type { FastifyReply, FastifyRequest } from "fastify";

import { UserController } from "./controller";
import { CognitoService } from "./CognitoService";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { UserRepository } from "./database/UserRepository";
import { INTERNAL_SERVER_ERROR } from "../../libs/exceptions";
import { UserErrors } from "./controller/UserErrors";
import { SignUpReq } from "./controller/schema";

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
  endpoint:
    process.env.ENVIRONMENT === "dev" ? "http://localhost:4566" : undefined,
  region: process.env.AWS_REGION || "us-east-1",
});
const cognitoService = new CognitoService(
  new CognitoIdentityProviderClient(cognitoIdentityProviderClient)
);

const userRepository = new UserRepository();
const userController = new UserController(cognitoService, userRepository);

export const signUpRoute = async (
  request: FastifyRequest<{ Body: SignUpReq }>,
  reply: FastifyReply
) => {
  const body = request.body;

  try {
    const response = await userController.signUp({ name: body?.name, email: body?.email });
    reply
      .status(201)
      .send({
        id: response.id,
        name: response.name,
        email: response.email
      });
  } catch (error) {
    if (error instanceof UserErrors.ValidationError) {
      reply
        .status(422)
        .send({
          code: error.code,
          title: error.name,
          message: error.message
        });
    }
    reply
      .status(500)
      .send({
        error: {
          code: INTERNAL_SERVER_ERROR,
          title: "Error",
          message: "Internal Server Error",
        },
      });
  }
};

export const getUserRoute = async (request: FastifyRequest, reply: FastifyReply) => {
  const headers = request.headers;
  console.log({ headers });
  return reply.status(404).send("NOT FOUND");
};
