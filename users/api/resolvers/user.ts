import { Arg, Args, Ctx, Query, Resolver, UseMiddleware } from "type-graphql";
import { ObjectId, ChangeStreamDocument } from "mongodb";
import { Service } from "typedi";
import { User } from "../entitites/User";
import { CRUDservice } from "../services/CRUDservice";
import { Mutation } from "type-graphql";
import {
  PasswordInput,
  RegisterInput,
  UserArgs,
  UserConnection,
  UserInput,
  UserMutationResponse,
} from "./types/user";
import { AuthenticationError } from "apollo-server-core";

import { Context, signJwt, verifyJwt } from "../util/auth";
import { compare } from "bcrypt";
import { Authorized } from "type-graphql";
import { ResetToken } from "../util/types";
import messageBroker from "../util/rmq";
import { RateLimit } from "../middlewares/ratelimit-middleware";
import { I18nService } from "../services/i18nService";
import { LoadResource } from "../util/decorators";
import { DocumentType } from "@typegoose/typegoose";

@Service()
@Resolver()
export class UserResolver {
  //using mongodb change streams to handle user integrity accross federated subgraphs
  constructor(
    private readonly userService = new CRUDservice(User),
    private readonly i18nService: I18nService
  ) {
    // userService.dataModel
    //   .watch([])
    //   .on("change", (data: ChangeStreamDocument<User>) => {
    //     switch (data.operationType) {
    //       case "insert":
    //         return messageBroker.produceMessage(
    //           JSON.stringify({
    //             id: data.documentKey?._id,
    //             email: data.fullDocument?.email,
    //             name: data.fullDocument?.name,
    //           }),
    //           "user.new"
    //         );
    //       case "update":
    //         return messageBroker.produceMessage(
    //           JSON.stringify({
    //             id: data.documentKey?._id,
    //             email: data.updateDescription?.updatedFields?.email,
    //             name: data.updateDescription?.updatedFields?.name,
    //           }),
    //           "user.update.personal"
    //         );
    //       case "delete":
    //         return messageBroker.produceMessage(
    //           JSON.stringify({
    //             id: data.documentKey?._id,
    //           }),
    //           "user.delete"
    //         );
    //       case "invalidate":
    //         console.log("invalidate");
    //         console.log(data);
    //       default:
    //         console.log("Unhandled operation type: ", data.operationType);
    //         return;
    //     }
    //   });
  }

  @Authorized(["ADMIN"])
  @Query(() => UserConnection)
  async users(@Args() { first, after }: UserArgs) {
    const users = await this.userService.dataModel.paginatedUsers(first, after);

    return users[0] as UserConnection;
  }

  @Authorized(["ADMIN"])
  @Query(() => User)
  async user(
    @Arg("id") _id: ObjectId,
    @LoadResource(User) user: DocumentType<User>
  ) {
    return user;
  }

  @Authorized(["ADMIN"])
  @Query(() => [User])
  async userTextSearch(
    @Arg("text") text: string,
    @Arg("domain", { nullable: true }) domain?: string
  ) {
    return await this.userService.aggregate([
      { $match: { $text: { $search: text } } },
      { $sort: { score: { $meta: "textScore" } } },
      {
        $match: {
          $expr: {
            $cond: [
              { $ne: [domain, null] },
              {
                $eq: [
                  { $arrayElemAt: [{ $split: ["$email", "@"] }, 1] },
                  domain,
                ],
              },
              { $ne: ["$_id", null] },
            ],
          },
        },
      },
      { $addFields: { id: "$_id" } },
    ]);
  }

  @Authorized()
  @UseMiddleware([RateLimit(50)])
  @Query(() => User)
  async me(@Ctx() { user }: Context) {
    const loggedInUser = await this.userService.findOne({ _id: user?.id });
    if (!loggedInUser)
      throw new AuthenticationError("User account has been deleted!");

    return loggedInUser;
  }

  @Mutation(() => String)
  @UseMiddleware([RateLimit(50)])
  async register(
    @Arg("data") registerInput: RegisterInput,
    @Ctx() { req, res, locale }: Context
  ) {
    const user = await this.userService.create(registerInput);

    res.cookie("accessToken", user.token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 7),
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production" ||
        process.env.NODE_ENV === "staging"
          ? "flaw.uniba.sk"
          : "localhost",
    });

    messageBroker.produceMessage(
      JSON.stringify({
        locale,
        clientUrl: req.headers.origin,
        name: user.name,
        email: user.email,
        token: signJwt({ id: user.id }, { expiresIn: 3600 }),
      }),
      "mail.registration"
    );

    return user.token;
  }

  @Authorized()
  @UseMiddleware([RateLimit(50)])
  @Mutation(() => String)
  async resendActivationLink(@Ctx() { req, locale, user }: Context) {
    messageBroker.produceMessage(
      JSON.stringify({
        locale,
        clientUrl: req.headers.origin,
        name: user?.name,
        email: user?.email,
        token: signJwt({ id: user?.id }, { expiresIn: 3600 }),
      }),
      "mail.registration"
    );

    return this.i18nService.translate("activation");
  }

  @Authorized()
  @Mutation(() => String)
  @UseMiddleware([RateLimit(50)])
  async activateUser(@Ctx() { req }: Context) {
    const user: Partial<User> | null = verifyJwt(
      req.headers.activation as string
    );
    if (!user) {
      throw new Error(this.i18nService.translate("invalidActivationToken"));
    }
    const { modifiedCount } = await this.userService.update(
      { _id: user.id, verified: false },
      { verified: true }
    );
    if (modifiedCount > 0) {
      return this.i18nService.translate("activated");
    } else {
      throw new Error(this.i18nService.translate("notFound"));
    }
  }

  @Mutation(() => String)
  @UseMiddleware([RateLimit(50)])
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: Context
  ) {
    const user = await this.userService.findOne({ email });
    if (!user)
      throw new AuthenticationError(this.i18nService.translate("credentials"));

    const match = await compare(password, user.password);
    if (!match)
      throw new AuthenticationError(this.i18nService.translate("credentials"));

    res.cookie("accessToken", user.token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 7),
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production" ||
        process.env.NODE_ENV === "staging"
          ? "flaw.uniba.sk"
          : "localhost",
    });

    return user.token;
  }

  @Authorized()
  @Mutation(() => Boolean)
  logout(@Ctx() { res }: Context) {
    res.clearCookie("accessToken", {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 7),
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production" ||
        process.env.NODE_ENV === "staging"
          ? "flaw.uniba.sk"
          : "localhost",
    });

    return true;
  }

  @Query(() => String)
  @UseMiddleware([RateLimit(50)])
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { locale, req }: Context
  ) {
    const user = await this.userService.findOne({ email });
    if (!user) throw new Error(this.i18nService.translate("notRegistered"));

    const token = signJwt({ id: user.id }, { expiresIn: "1h" });

    messageBroker.produceMessage(
      JSON.stringify({
        locale,
        clientUrl: req.headers.origin,
        email: user.email,
        name: user.name,
        token,
      }),
      "mail.reset"
    );

    return this.i18nService.translate("resetLinkSent");
  }

  @Mutation(() => String)
  @UseMiddleware([RateLimit(50)])
  async passwordReset(
    @Arg("data") { password }: PasswordInput,
    @Ctx() { req, res }: Context
  ) {
    const token = req.headers.resettoken;

    const userId: ResetToken = verifyJwt(token as string);
    if (!userId) throw new Error(this.i18nService.translate("invalidToken"));

    const user = await this.userService.findOne({ _id: userId.id });
    if (!user) throw new Error(this.i18nService.translate("notFound"));

    user.password = password;

    res.cookie("accessToken", user.token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 7),
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    await user.save();

    return user.token;
  }

  @Authorized(["ADMIN", "IS_OWN_USER"])
  @UseMiddleware([RateLimit(50)])
  @Mutation(() => UserMutationResponse)
  async updateUser(
    @Arg("id") _id: ObjectId,
    @Arg("data") userInput: UserInput,
    @LoadResource(User) user: DocumentType<User>
  ): Promise<UserMutationResponse> {
    for (const [key, value] of Object.entries(userInput)) {
      user[key as keyof UserInput] = value;
    }

    const data = await user.save();

    return {
      data,
      message: this.i18nService.translate("userUpdate", { name: data.name }),
    };
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Boolean)
  async deleteUser(@Arg("id") id: ObjectId): Promise<boolean> {
    const { deletedCount } = await this.userService.delete({ _id: id });
    return deletedCount > 0;
  }
}
