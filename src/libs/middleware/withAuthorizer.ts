import { FastifyReply, FastifyRequest } from "fastify";
import { CognitoJwtVerifier } from "aws-jwt-verify";

export const withAuthorizer = async (request: FastifyRequest, reply: FastifyReply) => {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID!,
    tokenUse: "access",
    clientId: process.env.COGNITO_USER_POOL_CLIENT_ID!
  });

  const { headers } = request;

  try {
    await verifier.verify(headers.authorization!);
  } catch (error) {
    reply.status(401).send("Unauthorized");
  }

}