import "isomorphic-fetch";

import { Arg, Args, Ctx, Query, Resolver, UseMiddleware } from "type-graphql";
import { ObjectId } from "mongodb";
import { Service } from "typedi";
import { User } from "../entitites/User";
import { Mutation } from "type-graphql";
import {
  OrganizationEmailsInput,
  PasswordInput,
  RegisterUserInput,
  UserArgs,
  UserConnection,
  UserInput,
  UserMutationResponse,
} from "./types/user.types";

import { issueSessionToken } from "../util/auth";
import { ActivityService } from "../services/reviews/activity.service";
import { Context } from "../util/auth";
import { Authorized } from "type-graphql";
import { RateLimit } from "../middlewares/ratelimit.middleware";
import { I18nService } from "../services/i18n.service";
import { UserService } from "../services/user.service";

@Service()
@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly i18nService: I18nService,
    private readonly activity: ActivityService,
  ) {}

  @Authorized(["ADMIN"])
  @Mutation(() => UserMutationResponse)
  async impersonateUser(@Arg("id") id: ObjectId, @Ctx() { user }: Context) {
    const originalActorId = user!.originalActorId || String(user!.id);
    const original = await this.userService.getUser(
      new ObjectId(originalActorId),
    );
    if (!original.access.includes("ADMIN" as any))
      throw new Error("Administrator access required.");
    const target = await this.userService.getUser(id);
    await this.activity.record(
      user!,
      "session.impersonated",
      undefined,
      undefined,
      { effectiveUser: String(id) },
    );
    return {
      data: target,
      token: issueSessionToken(target, originalActorId),
      message: "Impersonation started.",
    };
  }

  @Authorized()
  @Mutation(() => UserMutationResponse)
  async stopImpersonation(@Ctx() { user }: Context) {
    if (!user!.originalActorId) throw new Error("No impersonation session.");
    const original = await this.userService.getUser(
      new ObjectId(user!.originalActorId),
    );
    if (!original.access.includes("ADMIN" as any))
      throw new Error("Administrator access required.");
    await this.activity.record(user!, "session.impersonation_ended");
    return {
      data: original,
      token: issueSessionToken(original),
      message: "Impersonation ended.",
    };
  }

  @Authorized(["ADMIN"])
  @Query(() => UserConnection)
  async users(@Args() args: UserArgs) {
    return await this.userService.getPaginatedUsers(args);
  }

  @Authorized(["ADMIN"])
  @Query(() => User)
  async user(@Arg("id") id: ObjectId) {
    return await this.userService.getUser(id);
  }

  @Authorized(["ADMIN"])
  @Query(() => [User])
  async textSearchUser(@Arg("text") text: string) {
    return await this.userService.textSearchUser(text);
  }

  @Authorized()
  @Query(() => User)
  async me(@Ctx() { user }: Context) {
    return await this.userService.getUser(user!.id);
  }

  @Mutation(() => UserMutationResponse)
  @UseMiddleware(RateLimit())
  async register(
    @Arg("data") registerInput: RegisterUserInput,
    @Ctx() { user: ctxUser, req }: Context,
  ): Promise<UserMutationResponse> {
    const token = req.headers.token as string;
    const hostname = req.headers["tenant-domain"] as string;

    const user = await this.userService.createUser(
      registerInput,
      hostname,
      ctxUser,
      token,
    );

    return {
      data: user,
      token: ctxUser ? undefined : issueSessionToken(user),
      message: this.i18nService.translate("new", { name: user.name }),
    };
  }

  @Authorized()
  @UseMiddleware(RateLimit())
  @Mutation(() => String)
  async resendActivationLink(@Ctx() { user, req }: Context) {
    const hostname = req.headers["tenant-domain"] as string;

    return this.userService.resendActivationLink(user!, hostname);
  }

  @Authorized()
  @Mutation(() => UserMutationResponse)
  @UseMiddleware(RateLimit())
  async activateUser(@Ctx() { req }: Context): Promise<UserMutationResponse> {
    const token = req.headers.activation as string;

    const user = await this.userService.activateUser(token);

    return {
      message: this.i18nService.translate("activated"),
      data: user,
      token: issueSessionToken(user),
    };
  }

  @Mutation(() => UserMutationResponse)
  @UseMiddleware(RateLimit())
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
  ): Promise<UserMutationResponse> {
    const user = await this.userService.login(email, password);

    return {
      data: user,
      token: issueSessionToken(user),
      message: this.i18nService.translate("welcome", {
        ns: "user",
        name: user.name,
      }),
    };
  }

  @Mutation(() => UserMutationResponse)
  @UseMiddleware(RateLimit())
  async googleSignIn(
    @Arg("authCode") authCode: string,
    @Arg("redirectUri") redirectUri: string,
  ): Promise<UserMutationResponse> {
    const user = await this.userService.googleSignIn(authCode, redirectUri);

    return {
      data: user,
      token: issueSessionToken(user),
      message: this.i18nService.translate("welcome", {
        ns: "user",
        name: user.name,
      }),
    };
  }

  @Query(() => String)
  @UseMiddleware(RateLimit())
  async forgotPassword(@Arg("email") email: string, @Ctx() { req }: Context) {
    const hostname = req.headers["tenant-domain"] as string;

    return await this.userService.sendPasswordResetLink(email, hostname);
  }

  @Authorized("ADMIN")
  @Mutation(() => String)
  async inviteUsers(@Arg("input") { emails }: OrganizationEmailsInput) {
    await this.userService.sendRegistrationLinks(
      emails,
      process.env.NODE_ENV === "production"
        ? "internships.flaw.uniba.sk"
        : "internships-staging.flaw.uniba.sk",
    );

    return "Invites successfully sent!";
  }

  @Mutation(() => UserMutationResponse)
  @UseMiddleware(RateLimit())
  async passwordReset(
    @Arg("data") { password }: PasswordInput,
    @Ctx() { req }: Context,
  ): Promise<UserMutationResponse> {
    const token = req.headers["resettoken"] as string;

    const user = await this.userService.resetPassword(token, password);

    return {
      data: user,
      token: issueSessionToken(user),
      message: this.i18nService.translate("update", { name: user.name }),
    };
  }

  @Authorized()
  @UseMiddleware(RateLimit())
  @Mutation(() => UserMutationResponse)
  async updateUser(
    @Arg("id") id: ObjectId,
    @Arg("data") userInput: UserInput,
    @Ctx() { user }: Context,
  ): Promise<UserMutationResponse> {
    const data = await this.userService.updateUser(user!, id, userInput);

    return {
      data,
      message: this.i18nService.translate("update", { name: data.name }),
    };
  }

  @Authorized(["ADMIN"])
  @Mutation(() => UserMutationResponse)
  async toggleVerifiedUser(
    @Arg("id") id: ObjectId,
    @Arg("verified") verified: boolean,
    @Ctx() { user }: Context,
  ): Promise<UserMutationResponse> {
    const data = await this.userService.updateUser(user!, id, {
      verified: !verified,
    });

    return {
      data,
      message: this.i18nService.translate("update", { name: data.name }),
    };
  }

  @Authorized(["ADMIN"])
  @Mutation(() => UserMutationResponse)
  async deleteUser(@Arg("id") id: ObjectId): Promise<UserMutationResponse> {
    const deletedUser = await this.userService.deleteUser(id);

    return {
      message: this.i18nService.translate("delete", { name: deletedUser.name }),
      data: deletedUser,
    };
  }
}
