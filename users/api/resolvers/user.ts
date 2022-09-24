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
import { sendMail } from "../util/mail";
import { ResetToken } from "../util/types";

@Service()
@Resolver()
export class UserResolver {
  constructor(private readonly userService = new CRUDservice(User)) {}

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
  async me(@Ctx() { user }: Context): Promise<User> {
    const loggedInUser = await this.userService.findOne({ _id: user?.id });
    if (!loggedInUser)
      throw new AuthenticationError("User account has been deleted!");

    return loggedInUser;
  }

  @Mutation(() => User)
  async register(
    @Arg("data") registerInput: RegisterInput,
    @Ctx() { res, produceMessage }: Context
  ) {
    const user = await this.userService.create(registerInput);

    res.cookie("accessToken", user.token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 7),
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    produceMessage(JSON.stringify({ action: "REGISTER", data: user }));

    //drop when email service is implemented
    const token = signJwt({ id: user.id }, { expiresIn: "1d" });
    console.log(token);

    sendMail(
      registerInput.email,
      "AccountActivation",
      `Hi there,\nin order to activate your account, please click on the link down below.\n\n<a href=${
        process.env.CLIENT_URL || "http://localhost:3010"
      }/activate/${token}>Activate my account</a>\n\nBest regards,\n\nMojTrh Team`,
      `<h1>Account Activation</h1><p>In order to activate your account please click on the following link</p><a href=${
        process.env.CLIENT_URL || "http://localhost:3010"
      }/activate/${token}>Activate my account</a><p>Best regards,</p><p>MojTrh team</p>`,
      []
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
  async forgotPassword(@Arg("email") email: string): Promise<string> {
    const user = await this.userService.findOne({ email });
    if (!user)
      throw new UserInputError("No user with provided email address found!");

    const token = signJwt({ id: user.id }, { expiresIn: "1h" });

    sendMail(
      email,
      "Password Reset",
      `Reset password with the following token: ${token}`,
      `<html><head></head><body><p>Dear ${user.name}</p><p>Please reset your password with the following token: ${token}</p></body></html>`,
      []
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

  //Mutation used to save newly added billing while registering for a conference
  // @Authorized(["IS_OWN_USER"])
  // @Mutation(() => User)
  // async updateBilling(
  //   @Ctx() { user }: Context,
  //   @Arg("data") billingData: BillingInput
  // ): Promise<User> {
  //   const loggedInUser = await this.userService.findOne({ _id: user?.id });
  //   if (!loggedInUser) throw new UserInputError("User not found!");

  //   const billing = loggedInUser.billings.find(
  //     (billing) => billing.name === billingData.name
  //   );
  //   if (billing) {
  //     billing.address = billingData.address;
  //     billing.DIC = billingData.DIC;
  //     billing.ICO = billingData.ICO;
  //     billing.ICDPH = billingData.ICDPH;
  //   } else {
  //     loggedInUser.billings.push(billingData);
  //   }

  //   return await loggedInUser.save();
  // }

  @Authorized(["ADMIN"])
  @Mutation(() => Boolean)
  async deleteUser(@Arg("id") id: ObjectId): Promise<boolean> {
    const { deletedCount } = await this.userService.delete({ _id: id });
    return deletedCount > 0;
  }
}
