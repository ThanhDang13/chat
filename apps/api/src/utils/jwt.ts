import jwt from "jsonwebtoken";
import env from "@api/infra/config/env";

export const generateToken = (userId: string): string => {
  const token = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: "7d"
  });

  return token;
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as { userId: string };
};
