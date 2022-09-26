// import {
//   Arg,
//   Authorized,
//   Ctx,
//   FieldResolver,
//   Mutation,
//   Resolver,
//   Root,
// } from "type-graphql";
// import { Service } from "typedi";
// import { Billing } from "../entitites/Billing";
// import { User } from "../entitites/User";
// import { CRUDservice } from "../services/CRUDservice";
// import { Context } from "../util/auth";

// @Service()
// @Resolver(() => User)
// export class UserResolver {
//   constructor(private readonly userService = new CRUDservice(User)) {}

//   @Authorized()
//   @FieldResolver()
//   async billings(@Root() {}: User): Promise<Billing[] | undefined> {
//     const user = await this.userService.findOne({ _id: ctx.user?.id });
//     if (!user) {
//       return [];
//     }

//     return user.billings;
//   }
// }
