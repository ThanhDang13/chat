// import { FastifyInstance } from "fastify";
// import { User } from "@api/domain/models/User";
// import { ZodTypeProvider } from "fastify-type-provider-zod";
// import {
//   createUserSchema,
//   loginSchema,
//   signupSchema,
//   userConditionSchema,
//   userParamsSchema,
//   userQuerySchema
// } from "@api/domain/dtos/user";
// import { users } from "@api/infrastructure/databases/drizzle/migrations/schema";
// import { compare, hash } from "bcryptjs";
// import { generateToken } from "@api/utils/jwt";

// // export default async function userRoutes(fastify: FastifyInstance) {
// //   fastify.withTypeProvider<ZodTypeProvider>().get(
// //     "/users/:id",
// //     {
// //       schema: {
// //         tags: ["users"],
// //         params: userParamsSchema,
// //         querystring: userQuerySchema
// //       }
// //     },
// //     async (request, reply) => {
// //       const { userService } = request.diScope.cradle;
// //       const { id } = request.params;

// //       const user = await userService.getById(id);

// //       return reply.send(user);
// //     }
// //   );

// //   fastify
// //     .withTypeProvider<ZodTypeProvider>()
// //     .delete(
// //       "/users/:id",
// //       { schema: { tags: ["users"], params: userParamsSchema } },
// //       async (request, reply) => {
// //         const { userService } = request.diScope.cradle;
// //         const { id } = request.params;

// //         await userService.delete(id);

// //         return reply.code(204).send();
// //       }
// //     );

// //   fastify
// //     .withTypeProvider<ZodTypeProvider>()
// //     .post(
// //       "/users",
// //       { schema: { tags: ["users"], body: createUserSchema } },
// //       async (request, reply) => {
// //         const { userService } = request.diScope.cradle;
// //         const { email, password, fullname, role, status } = request.body;

// //         const user = await User.create({
// //           email,
// //           password,
// //           fullname,
// //           role,
// //           status
// //         });

// //         await userService.create(user);

// //         return reply.code(201).send({ message: "User saved successfully" });
// //       }
// //     );

// //   fastify.withTypeProvider<ZodTypeProvider>().get(
// //     "/users",
// //     {
// //       schema: { tags: ["users"], querystring: userConditionSchema.extend(pagingDTOSchema.shape) }
// //     },
// //     async (request, reply) => {
// //       const { userService } = request.diScope.cradle;
// //       const { page, limit, order, sort, email, fullname, role, status } = request.query;

// //       const paging = { page, limit, order, sort };
// //       const condition = { email, fullname, role, status };

// //       const result = await userService.list(condition, paging);

// //       return reply.send(result);
// //     }
// //   );
// // }

// export default async function userRoutes(fastify: FastifyInstance) {
//   fastify
//     .withTypeProvider<ZodTypeProvider>()
//     .post(
//       "/signup",
//       { schema: { tags: ["users"], body: signupSchema } },
//       async (request, reply) => {
//         const { db } = request.diScope.cradle;
//         const { email, password, fullname } = request.body;

//         const existingUser = await db.query.users.findFirst({
//           where: (users, { eq }) => eq(users.email, email)
//         });

//         if (existingUser) {
//           return reply.code(400).send({ message: "Email already in use" });
//         }

//         const hashedPassword = await hash(password, 10);

//         await db.insert(users).values({
//           email,
//           password: hashedPassword,
//           fullname
//         });

//         return reply.code(201).send({ message: "User saved successfully" });
//       }
//     );

//   fastify
//     .withTypeProvider<ZodTypeProvider>()
//     .post("/login", { schema: { tags: ["users"], body: loginSchema } }, async (request, reply) => {
//       const { db } = request.diScope.cradle;
//       const { email, password } = request.body;

//       const user = await db.query.users.findFirst({
//         where: (users, { eq }) => eq(users.email, email)
//       });

//       if (!user) {
//         return reply.code(401).send({ message: "Invalid email or password" });
//       }

//       const isMatch = await compare(password, user.password);

//       if (!isMatch) {
//         return reply.code(401).send({ message: "Invalid email or password" });
//       }

//       const token = generateToken(user.id);

//       return reply.send({
//         token,
//         user: {
//           id: user.id,
//           email: user.email,
//           fullname: user.fullname
//         }
//       });
//     });

//   // fastify.withTypeProvider<ZodTypeProvider>().get(
//   //   "/users",
//   //   {
//   //     schema: { tags: ["users"], querystring: userConditionSchema.extend(pagingDTOSchema.shape) }
//   //   },
//   //   async (request, reply) => {
//   //     const { userService } = request.diScope.cradle;
//   //     const { page, limit, order, sort, email, fullname, role, status } = request.query;

//   //     const paging = { page, limit, order, sort };
//   //     const condition = { email, fullname, role, status };

//   //     const result = await userService.list(condition, paging);

//   //     return reply.send(result);
//   //   }
//   // );
// }
