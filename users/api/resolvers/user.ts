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
} from "./types/user";
import { AuthenticationError, UserInputError } from "apollo-server-core";

import { Context, signJwt, verifyJwt } from "../util/auth";
import { compare } from "bcrypt";
import { Authorized } from "type-graphql";
import { ResetToken } from "../util/types";
import messageBroker from "../util/rmq";
import { RateLimit } from "../middlewares/ratelimit-middleware";

@Service()
@Resolver()
export class UserResolver {
	//using mongodb change steams to handle user integrity accross federated subgraphs
	constructor(private readonly userService = new CRUDservice(User)) {
		userService.dataModel
			.watch([])
			.on("change", (data: ChangeStreamDocument<User>) => {
				switch (data.operationType) {
					case "insert":
						return messageBroker.produceMessage(
							JSON.stringify({
								id: data.documentKey?._id,
								email: data.fullDocument?.email,
								name: data.fullDocument?.name,
							}),
							"user.new"
						);
					case "update":
						return messageBroker.produceMessage(
							JSON.stringify({
								id: data.documentKey?._id,
								email: data.updateDescription?.updatedFields?.email,
								name: data.updateDescription?.updatedFields?.name,
							}),
							"user.update.personal"
						);
					case "delete":
						return messageBroker.produceMessage(
							JSON.stringify({
								id: data.documentKey?._id,
							}),
							"user.delete"
						);
					case "invalidate":
						console.log("invalidate");
						console.log(data);

					default:
						console.log("Unhandled operation type: ", data.operationType);
						return;
				}
			});
	}

	@Authorized(["ADMIN"])
	@Query(() => UserConnection)
	async users(@Args() { first, after }: UserArgs) {
		const users = await this.userService.dataModel.paginatedUsers(first, after);

		return users[0] as UserConnection;
	}

	@Authorized(["ADMIN"])
	@Query(() => User)
	async user(@Arg("id") id: ObjectId) {
		const user = await this.userService.findOne({ _id: id });
		if (!user) throw new Error("User not found!");

		return user;
	}

	@Authorized()
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
	@UseMiddleware([RateLimit(100)])
	@Query(() => User)
	async me(@Ctx() { user }: Context) {
		const loggedInUser = await this.userService.findOne({ _id: user?.id });
		if (!loggedInUser)
			throw new AuthenticationError("User account has been deleted!");

		return loggedInUser;
	}

	@Mutation(() => User)
	@UseMiddleware([RateLimit(50)])
	async register(
		@Arg("data") registerInput: RegisterInput,
		@Ctx() { res, locale }: Context //produceMessage for email service and define coresponding routing keys
	) {
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

	@Authorized()
	@UseMiddleware([RateLimit(10)])
	@Mutation(() => Boolean)
	resendActivationLink(@Ctx() { locale, user }: Context) {
		messageBroker.produceMessage(
			JSON.stringify({
				locale,
				name: user?.name,
				email: user?.email,
				token: signJwt({ id: user?.id }, { expiresIn: "1d" }),
			}),
			"mail.registration"
		);

		return true;
	}

	@Mutation(() => Boolean)
	@UseMiddleware([RateLimit(10)])
	async activateUser(@Arg("token") token: string) {
		const user: Partial<User> | null = verifyJwt(token);
		if (user) {
			const { modifiedCount } = await this.userService.update(
				{ _id: user.id, verified: false },
				{ verified: true }
			);

			return modifiedCount > 0;
		}

		return false;
	}

	@Mutation(() => User)
	@UseMiddleware([RateLimit(50)])
	async login(
		@Arg("email") email: string,
		@Arg("password") password: string,
		@Ctx() { res }: Context
	) {
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
	@UseMiddleware([RateLimit(50)])
	async forgotPassword(
		@Arg("email") email: string,
		@Ctx() { locale }: Context
	) {
		const user = await this.userService.findOne({ email });
		if (!user) throw new Error("No user with provided email address found!");

		const token = signJwt({ id: user.id }, { expiresIn: "1h" });

		messageBroker.produceMessage(
			JSON.stringify({ locale, email: user.email, name: user.name, token }),
			"mail.reset"
		);

		return "Password reset link has been sent to your email!";
	}

	@Mutation(() => User)
	@UseMiddleware([RateLimit(10)])
	async passwordReset(
		@Arg("data") { password }: PasswordInput,
		@Ctx() { req, res }: Context
	) {
		const token = req.headers.resettoken;

		const userId: ResetToken = verifyJwt(token as string);
		if (!userId) throw new Error("Reset token expired!");

		const user = await this.userService.findOne({ _id: userId.id });
		if (!user) throw new Error("User not found!");

		user.password = password;

		res.cookie("accessToken", user.token, {
			httpOnly: true,
			expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 7),
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
			secure: process.env.NODE_ENV === "production",
		});

		return await user.save();
	}

	@Authorized(["ADMIN", "IS_OWN_USER"])
	@UseMiddleware([RateLimit(10)])
	@Mutation(() => User)
	async updateUser(@Arg("id") id: ObjectId, @Arg("data") userInput: UserInput) {
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
