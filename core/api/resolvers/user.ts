import "isomorphic-fetch";

import {
  Arg,
  Args,
  AuthenticationError,
  Ctx,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { ObjectId } from "mongodb";
import { Service } from "typedi";
import { Access, User } from "../entitites/User";
import { CRUDservice } from "../services/CRUDservice";
import { Mutation } from "type-graphql";
import {
  PasswordInput,
  RegisterUserInput,
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
import { transformIds } from "../middlewares/typegoose-middleware";
import { client } from "../util/redis";
import { v4 as uuidv4 } from "uuid";

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
  ) {}

  // Generate a one-time-use token
  private generateOneTimeToken(expiresIn: number) {
    const tokenId = uuidv4();
    const token = signJwt({ tokenId }, { expiresIn });

    // Store token ID in Redis
    client.set(tokenId, "valid", { PX: expiresIn });
    return token;
  }

  // Verify a one-time-use token
  private async verifyOneTimeToken(token: string) {
    const decoded = verifyJwt<{ tokenId: string }>(token);
    if (!decoded) {
      throw new Error("Token has been malformed or expired");
    }

    // Check if the token ID is still valid in Redis
    const tokenStatus = await client.get(decoded?.tokenId);
    if (tokenStatus !== "valid") {
      throw new Error("Token has already been used");
    }

    // Mark the token ID as used
    await client.del(decoded.tokenId);

    return decoded; // Token is valid
  }

  @Authorized(["ADMIN"])
  @Query(() => UserConnection)
  async users(@Args() { first, after }: UserArgs) {
    const data = await this.userService.dataModel.paginatedUsers(first, after);

    const connection: UserConnection = data[0];

    return {
      totalCount: connection.totalCount || 0,
      pageInfo: connection.pageInfo || { hasNextPage: false },
      edges:
        connection.edges.map((e) => ({
          cursor: e.cursor,
          node: transformIds(e.node),
        })) || [],
    };
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
  @UseMiddleware(RateLimit())
  @Query(() => User)
  async me(@Ctx() { user }: Context) {
    const loggedInUser = await this.userService.findOne({ _id: user?.id });
    if (!loggedInUser) throw new Error("User account has been deleted!");

    return loggedInUser;
  }

  @Mutation(() => UserMutationResponse)
  @UseMiddleware(RateLimit())
  async register(
    @Arg("data") registerInput: RegisterUserInput,
    @Ctx() { locale, user: loggedInUser, req }: Context
  ): Promise<UserMutationResponse> {
    const host = req.header("host");
    const subdomain = host?.split(".")[0];

    const access: Access[] = [];

    if (subdomain?.includes("conferences")) {
      access.push(Access.ConferenceAttendee);
    }
    if (subdomain?.includes("internships")) {
      access.push(Access.Student);
    }

    const user = await this.userService.create({
      ...registerInput,
      access: registerInput.access ? registerInput.access : access,
    });

    if (!loggedInUser) {
      messageBroker.produceMessage(
        JSON.stringify({
          locale,
          name: user.name,
          email: user.email,
          hostname: req.hostname,
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
  @UseMiddleware(RateLimit())
  @Mutation(() => String)
  async resendActivationLink(@Ctx() { locale, user, req }: Context) {
    messageBroker.produceMessage(
      JSON.stringify({
        locale,
        name: user?.name,
        email: user?.email,
        hostname: req.hostname,
        token: signJwt({ id: user?.id }, { expiresIn: 3600 }),
      }),
      "mail.registration"
    );

    return this.i18nService.translate("activation");
  }

  @Authorized()
  @Mutation(() => UserMutationResponse)
  @UseMiddleware(RateLimit())
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
  @UseMiddleware(RateLimit())
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
  @UseMiddleware(RateLimit())
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

  // @Mutation(() => UserMutationResponse)
  // async msalSignIn(
  //   @Arg("authCode") authCode: string
  // ): Promise<UserMutationResponse> {
  //   try {
  //     // Acquire token using MSAL
  //     const tokenResponse = await this.msalClient.acquireTokenByCode({
  //       code: authCode,
  //       scopes: ["user.read"],
  //       redirectUri: "http://localhost:3000/microsoft/callback",
  //     });

  //     if (!tokenResponse || !tokenResponse.accessToken) {
  //       throw new Error("Invalid token payload");
  //     }

  //     // Initialize Microsoft Graph client with access token
  //     const graphClient = this.getAuthenticatedClient(
  //       tokenResponse.accessToken
  //     );

  //     // Fetch user information from Microsoft Graph API
  //     const azureUser = await graphClient
  //       .api("/me")
  //       .select([
  //         "mail",
  //         "displayName",
  //         "otherMails",
  //         "proxyAddresses",
  //         "department",
  //         "jobTitle",
  //       ])
  //       .get();

  //     let user = await this.userService.findOne({
  //       email: azureUser.otherMails,
  //     });
  //     if (!user) {
  //       user = await this.userService.create({
  //         name: azureUser.displayName,
  //         email: azureUser.mail,
  //         verified: true,
  //       });
  //     }

  //     return {
  //       data: user,
  //       message: this.i18nService.translate("welcome", {
  //         ns: "user",
  //         name: user.name,
  //       }),
  //     };
  //   } catch (error: any) {
  //     console.error("Error in msalSignIn:", error);
  //     throw new Error(error.message);
  //   }
  // }

  @Query(() => String)
  @UseMiddleware(RateLimit())
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
        hostname: req.hostname,
        token,
      }),
      "mail.reset"
    );

    return this.i18nService.translate("resetLinkSent");
  }

  @Mutation(() => UserMutationResponse)
  @UseMiddleware(RateLimit())
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

  @Authorized()
  @UseMiddleware(RateLimit())
  @Mutation(() => UserMutationResponse)
  async updateUser(
    @Arg("id") _id: ObjectId,
    @Arg("data") userInput: UserInput,
    @LoadResource(User) user: DocumentType<User>,
    @Ctx() context: Context
  ): Promise<UserMutationResponse> {
    if (
      !context.user?.access.includes(Access.Admin) &&
      user.id !== context.user?.id
    ) {
      throw new AuthenticationError(
        this.i18nService.translate("401", { ns: "common" })
      );
    }

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
