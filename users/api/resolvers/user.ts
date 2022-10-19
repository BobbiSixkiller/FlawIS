import { Arg, Args, Ctx, Query, Resolver } from "type-graphql";
import { ObjectId } from "mongodb";
import { Service } from "typedi";
import { User, UserConnection } from "../entitites/User";
import { CRUDservice } from "../services/CRUDservice";
import { Mutation } from "type-graphql";
import {
  PasswordInput,
  RegisterInput,
  UserArgs,
  UserInput,
} from "./types/user";
import { AuthenticationError, UserInputError } from "apollo-server-core";

import { Context, signJwt, verifyJwt } from "../util/auth";
import { compare } from "bcrypt";
import { Authorized } from "type-graphql";
import { ResetToken } from "../util/types";
import messageBroker from "../services/messageBroker";

@Service()
@Resolver()
export class UserResolver {
  //using mongodb change steams to handle user integrity accross federated subgraphs
  constructor(private readonly userService = new CRUDservice(User)) {
    userService.dataModel
      .watch([])
      .on(
        "change",
        ({ documentKey, operationType, updateDescription, fullDocument }) => {
          switch (operationType) {
            case "insert":
              return messageBroker.produceMessage(
                JSON.stringify({
                  id: fullDocument._id,
                  email: fullDocument.email,
                  name: fullDocument.name,
                }),
                "user.new"
              );
            case "update":
              return messageBroker.produceMessage(
                JSON.stringify({
                  id: documentKey?._id,
                  email: updateDescription?.updatedFields.email,
                }),
                "user.update.email"
              );
            case "delete":
              console.log(documentKey, operationType);
              return messageBroker.produceMessage(
                JSON.stringify({
                  id: documentKey?._id,
                }),
                "user.delete"
              );

            default:
              console.log("Unhandled operation type: ", operationType);
              return;
          }
        }
      );
  }

  @Authorized(["ADMIN", "IS_OWN_USER"])
  @Query(() => User)
  async user(@Arg("id") id: ObjectId): Promise<User> {
    const user = await this.userService.findOne({ _id: id });
    if (!user) throw new Error("User not found!");

    return user;
  }

  @Authorized(["ADMIN"])
  @Query(() => UserConnection)
  async users(@Args() { first, after }: UserArgs): Promise<UserConnection> {
    const users = await this.userService.aggregate([
      {
        $facet: {
          data: [
            {
              $match: {
                $expr: {
                  $cond: [
                    { $eq: [after, null] },
                    { $ne: ["$_id", null] },
                    { $lt: ["$_id", after] },
                  ],
                },
              },
            },
            { $sort: { _id: -1 } },
            { $limit: first || 20 },
            {
              $addFields: {
                id: "$_id", //transform _id to id property as defined in GraphQL object types
              },
            },
          ],
          hasNextPage: [
            {
              $match: {
                $expr: {
                  $cond: [
                    { $eq: [after, null] },
                    { $ne: ["$_id", null] },
                    { $lt: ["$_id", after] },
                  ],
                },
              },
            },
            { $sort: { _id: -1 } },
            { $skip: first || 20 }, // skip paginated data
            { $limit: 1 }, // just to check if there's any element
            { $count: "totalNext" },
          ],
        },
      },
      {
        $unwind: { path: "$hasNextPage", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          edges: {
            $map: {
              input: "$data",
              as: "edge",
              in: { cursor: "$$edge._id", node: "$$edge" },
            },
          },
          pageInfo: {
            hasNextPage: { $gt: ["$hasNextPage.totalNext", 0] },
            endCursor: { $last: "$data.id" },
          },
        },
      },
    ]);

    return users[0] as unknown as UserConnection;
  }

  @Authorized()
  @Query(() => User)
  async me(@Ctx() { user, locale }: Context): Promise<User> {
    const loggedInUser = await this.userService.findOne({ _id: user?.id });
    if (!loggedInUser)
      throw new AuthenticationError("User account has been deleted!");

    messageBroker.produceMessage(
      JSON.stringify({
        locale,
        name: loggedInUser.name,
        email: loggedInUser.email,
        token: signJwt({ id: loggedInUser.id }, { expiresIn: "1d" }),
      }),
      "mail.registration"
    );

    return loggedInUser;
  }

  @Mutation(() => User)
  async register(
    @Arg("data") registerInput: RegisterInput,
    @Ctx() { res, locale }: Context //produceMessage for email service and define coresponding routing keys
  ) {
    console.log(locale);
    const user = await this.userService.create(registerInput);

    res.cookie("accessToken", user.token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 7),
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    messageBroker.produceMessage(
      JSON.stringify({
        locale,
        name: user.name,
        email: user.email,
        token: signJwt({ id: user.id }, { expiresIn: "1d" }),
      }),
      "mail.registration"
    );

    return user;
  }

  @Mutation(() => Boolean)
  async activateUser(@Arg("token") token: string): Promise<boolean> {
    const user: Partial<User> | null = verifyJwt(token);
    if (user) {
      const { modifiedCount } = await this.userService.update(
        { _id: user.id, verified: false },
        { verified: true }
      );

      if (modifiedCount > 0) {
        return true;
      } else throw new Error("User account already activated!");
    }

    return false;
  }

  @Mutation(() => User)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: Context
  ): Promise<User> {
    const user = await this.userService.findOne({ email });
    if (!user) throw new AuthenticationError("Invalid credentials!");

    const match = await compare(password, user.password);
    if (!match) throw new AuthenticationError("Invalid credentials!");

    res.cookie("accessToken", user.token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 7),
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return user;
  }

  @Authorized()
  @Mutation(() => Boolean)
  logout(@Ctx() { res }: Context) {
    res.clearCookie("accessToken");

    return true;
  }

  @Query(() => String)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { locale }: Context
  ): Promise<string> {
    const user = await this.userService.findOne({ email });
    if (!user)
      throw new UserInputError("No user with provided email address found!");

    const token = signJwt({ id: user.id }, { expiresIn: "1h" });

    messageBroker.produceMessage(
      JSON.stringify({ locale, email: user.email, name: user.name, token }),
      "mail.forgotPassword"
    );

    return "Password reset link has been sent to your email!";
  }

  @Mutation(() => User)
  async passwordReset(
    @Arg("data") { password }: PasswordInput,
    @Ctx() { req }: Context
  ): Promise<User> {
    const token = req.headers.resettoken;
    const userId: ResetToken = verifyJwt(token as string);
    if (!userId) throw new Error("Reset token expired!");

    const user = await this.userService.findOne({ _id: userId.id });
    if (!user) throw new Error("User not found!");

    user.password = password;

    return await user.save();
  }

  @Authorized(["ADMIN", "IS_OWN_USER"])
  @Mutation(() => User)
  async updateUser(
    @Arg("id") id: ObjectId,
    @Arg("data") userInput: UserInput
  ): Promise<User> {
    const user = await this.userService.findOne({ _id: id });
    if (!user) throw new UserInputError("User not found!");

    for (const [key, value] of Object.entries(userInput)) {
      user[key as keyof UserInput] = value;
    }

    return await user.save();
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Boolean)
  async deleteUser(@Arg("id") id: ObjectId): Promise<boolean> {
    const { deletedCount } = await this.userService.delete({ _id: id });
    return deletedCount > 0;
  }
}
