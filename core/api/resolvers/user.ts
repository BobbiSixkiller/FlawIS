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

import { Context, signJwt, verifyJwt } from "../util/auth";
import { compare } from "bcrypt";
import { Authorized } from "type-graphql";
import { ResetToken } from "../util/types";
import messageBroker from "../util/rmq";
import { RateLimit } from "../middlewares/ratelimit-middleware";
import { I18nService } from "../services/i18nService";
import { LoadResource } from "../util/decorators";
import { DocumentType } from "@typegoose/typegoose";
import { OAuth2Client } from "google-auth-library";

@Service()
@Resolver()
export class UserResolver {
  constructor(
    private readonly userService = new CRUDservice(User),
    private readonly i18nService: I18nService,
    private readonly googleOAuthClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
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
  async textSearchUser(@Arg("text") text: string) {
    return await this.userService.aggregate([
      { $match: { $text: { $search: text } } },
      { $sort: { score: { $meta: "textScore" } } },
      { $addFields: { id: "$_id" } },
      { $limit: 10 },
    ]);
  }

  @Authorized()
  // @UseMiddleware([RateLimit(50)])
  @Query(() => User)
  async me(@Ctx() { user }: Context) {
    const loggedInUser = await this.userService.findOne({ _id: user?.id });
    if (!loggedInUser) throw new Error("User account has been deleted!");
    console.log(loggedInUser);

    return loggedInUser;
  }

  @Mutation(() => UserMutationResponse)
  // @UseMiddleware([RateLimit(50)])
  async register(
    @Arg("data") registerInput: RegisterInput,
    @Ctx() { req, locale, user: loggedInUser }: Context
  ): Promise<UserMutationResponse> {
    const user = await this.userService.create(registerInput);

    if (!loggedInUser) {
      messageBroker.produceMessage(
        JSON.stringify({
          locale,
          name: user.name,
          email: user.email,
          token: signJwt({ id: user.id }, { expiresIn: 3600 }),
        }),
        "mail.registration"
      );
    } else {
      user.verified = true;
      await user.save();
    }

    return {
      data: user,
      message: this.i18nService.translate("new", { name: user.name }),
    };
  }

  @Authorized()
  // @UseMiddleware([RateLimit(50)])
  @Mutation(() => String)
  async resendActivationLink(@Ctx() { req, locale, user }: Context) {
    messageBroker.produceMessage(
      JSON.stringify({
        locale,
        name: user?.name,
        email: user?.email,
        token: signJwt({ id: user?.id }, { expiresIn: 3600 }),
      }),
      "mail.registration"
    );

    return this.i18nService.translate("activation");
  }

  @Authorized()
  @Mutation(() => UserMutationResponse)
  // @UseMiddleware([RateLimit(50)])
  async activateUser(@Ctx() { req }: Context): Promise<UserMutationResponse> {
    const user: Partial<User> | null = verifyJwt(
      req.headers.activation as string
    );
    if (!user) {
      throw new Error(this.i18nService.translate("invalidActivationToken"));
    }

    const data = await this.userService.findOneAndUpdate(
      { _id: user.id, verified: false },
      { verified: true }
    );
    if (!data) {
      throw new Error(this.i18nService.translate("notFound"));
    }

    return { message: this.i18nService.translate("activated"), data };
  }

  @Mutation(() => UserMutationResponse)
  // @UseMiddleware([RateLimit(50)])
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<UserMutationResponse> {
    const user = await this.userService.findOne({ email });
    if (!user || !user?.password)
      throw new Error(this.i18nService.translate("credentials"));

    const match = await compare(password, user.password);
    if (!match) throw new Error(this.i18nService.translate("credentials"));

    return {
      data: user,
      message: this.i18nService.translate("welcome", {
        ns: "user",
        name: user.name,
      }),
    };
  }

  @Mutation(() => UserMutationResponse)
  // @UseMiddleware([RateLimit(50)])
  async googleSignIn(
    @Arg("authCode") authCode: string
  ): Promise<UserMutationResponse> {
    try {
      const { tokens } = await this.googleOAuthClient.getToken(authCode);
      this.googleOAuthClient.setCredentials(tokens);

      const ticket = await this.googleOAuthClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (payload) {
        // Here you can create a session or JWT for the user
        // For simplicity, we're returning the user payload directly
        let user = await this.userService.findOne({ email: payload.email });
        if (!user) {
          user = await this.userService.create({
            name: payload.name,
            email: payload.email,
            verified: payload.email_verified,
          });
        }

        return {
          data: user,
          message: this.i18nService.translate("welcome", {
            ns: "user",
            name: user.name,
          }),
        };
      } else throw new Error("Invalid token payload");
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Query(() => String)
  // @UseMiddleware([RateLimit(50)])
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
        email: user.email,
        name: user.name,
        token,
      }),
      "mail.reset"
    );

    return this.i18nService.translate("resetLinkSent");
  }

  @Mutation(() => UserMutationResponse)
  // @UseMiddleware([RateLimit(50)])
  async passwordReset(
    @Arg("data") { password }: PasswordInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    const token = req.headers.resettoken;

    const userId: ResetToken = verifyJwt(token as string);
    if (!userId) throw new Error(this.i18nService.translate("invalidToken"));

    const user = await this.userService.findOne({ _id: userId.id });
    if (!user) throw new Error(this.i18nService.translate("notFound"));

    user.password = password;

    await user.save();

    return {
      data: user,
      message: this.i18nService.translate("update", { name: user.name }),
    };
  }

  @Authorized(["ADMIN", "IS_OWN_USER"])
  // @UseMiddleware([RateLimit(50)])
  @Mutation(() => UserMutationResponse)
  async updateUser(
    @Arg("id") _id: ObjectId,
    @Arg("data") userInput: UserInput,
    @LoadResource(User) user: DocumentType<User>
  ): Promise<UserMutationResponse> {
    for (const [key, value] of Object.entries(userInput)) {
      (user as any)[key] = value;
    }

    const data = await user.save();

    return {
      data,
      message: this.i18nService.translate("update", { name: data.name }),
    };
  }

  @Authorized(["ADMIN"])
  @Mutation(() => UserMutationResponse)
  async toggleVerifiedUser(
    @Arg("id") _id: ObjectId,
    @LoadResource(User) user: DocumentType<User>
  ): Promise<UserMutationResponse> {
    user.verified = !user.verified;

    const data = await user.save();

    return {
      data,
      message: this.i18nService.translate("update", { name: data.name }),
    };
  }

  @Authorized(["ADMIN"])
  @Mutation(() => UserMutationResponse)
  async deleteUser(
    @Arg("id") _id: ObjectId,
    @LoadResource(User) user: DocumentType<User>
  ): Promise<UserMutationResponse> {
    await this.userService.delete({ _id: user.id });

    return {
      message: this.i18nService.translate("delete", { name: user.name }),
      data: user,
    };
  }
}
