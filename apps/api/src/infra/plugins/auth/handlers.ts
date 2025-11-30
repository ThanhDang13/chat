import { verifyToken } from "@api/utils/jwt";
import { FastifyRequest } from "fastify";
import { UnauthorizedError } from "@api/shared/errors/unauthorized.error";

export async function authenticate(request: FastifyRequest) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing token");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);
    request.user = { userId: payload.userId };
  } catch {
    throw new UnauthorizedError("Invalid token");
  }
}
