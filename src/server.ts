import dotenv from "dotenv";
import Fastify from "fastify";
import cors from "@fastify/cors";

import { getUserRoute, createProfileRoute } from "./modules/users/routes";
import { withAuthorizer } from "./libs/middleware/withAuthorizer";

dotenv.config({
  path: process.env.ENVIRONMENT === "prod" ? ".env" : ".env.dev",
});

export const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: (origin, callback) => {
    const hostname = new URL(origin!).hostname;

    if (hostname === "localhost") {
      //  Request from localhost will pass
      callback(null, true);
      return;
    }
    // Generate an error on other origins, disabling access
    callback(new Error("Not allowed"), false);
  },
});

fastify.post("/v1/users", createProfileRoute);
fastify.get("/v1/users", { preHandler: withAuthorizer }, getUserRoute);

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
