import dotenv from "dotenv";
import Fastify from "fastify";
import cors from "@fastify/cors";

import { getUserRoute, createProfileRoute } from "./modules/users/routes";
import { withAuthorizer } from "./libs/middleware/withAuthorizer";
import { getBookByIdRoute } from "./modules/books/routes";

dotenv.config({
  path: process.env.ENVIRONMENT === "prod" ? ".env" : ".env.dev",
});

export const fastify = Fastify({
  logger: false,
});

fastify.register(cors, {
  origin: (origin, callback) => {
    callback(null, true)
  },
});

fastify.post("/v1/users", createProfileRoute);
fastify.get("/v1/users", { preHandler: withAuthorizer }, getUserRoute);
// fastify.get("/v1/books", { preHandler: withAuthorizer }, getUserRoute);
fastify.get("/v1/books/:bookId", getBookByIdRoute);
// fastify.post("/v1/books", { preHandler: withAuthorizer }, getUserRoute);

(async () => {
  try {
    await fastify.listen({
      port: (process.env.PORT as unknown as number) ?? 8080,
    });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
})();
