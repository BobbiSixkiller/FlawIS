import { Service } from "typedi";
import { Access, User as UserEntity } from "../entitites/User";
import { signJwt, verifyJwt } from "../util/auth";
import {
  RegisterUserInput,
  UserArgs,
  UserConnection,
} from "../resolvers/types/user.types";
import { RmqService } from "./rmq.service";
import { I18nService } from "./i18n.service";
import { ObjectId } from "mongodb";
import { CtxUser, ResetToken } from "../util/types";
import { DocumentType, mongoose } from "@typegoose/typegoose";
import { compare } from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { UserRepository } from "../repositories/user.repository";
import { ArgumentValidationError } from "type-graphql";
import { TokenService } from "./token.service";

type UserDTO = Omit<UserEntity, "password">;

type UserUpdateData = Partial<
  Omit<UserEntity, "id" | "createdAt" | "updatedAt" | "token">
>;

function toUserDTO(doc: DocumentType<UserEntity>) {
  const obj = doc.toJSON({
    versionKey: false,
    virtuals: false,
    transform(_doc, ret) {
      if (ret._id) {
        ret.id = ret._id;
        delete ret._id;
      }
      delete ret.password;

      return ret;
    },
  });

  return obj as UserDTO;
}

@Service()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly rmqService: RmqService,
    private readonly i18nService: I18nService,
    private readonly googleOAuthClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
  ) {}

  async getUser(id: ObjectId) {
    const user = await this.userRepository.findOne({ _id: id });
    if (!user) {
      throw new Error(this.i18nService.translate("notFound", { ns: "user" }));
    }

    return toUserDTO(user);
  }

  async textSearchUser(text: string) {
    return await this.userRepository.textSearch(text);
  }

  async getPaginatedUsers(args: UserArgs): Promise<UserConnection> {
    return await this.userRepository.paginatedUsers(args);
  }

  async sendRegistrationLinks(emails: string[], hostname: string) {
    for await (const email of emails) {
      const token = await this.tokenService.generateOneTimeToken(
        60 * 60 * 24 * 7
      ); // Token valid for 7 days
      const locale = this.i18nService.language();

      await this.rmqService.produceMessage(
        JSON.stringify({ hostname, token, email, locale }),
        "mail.internships.newOrg"
      );
    }
  }

  async createUser(
    data: RegisterUserInput,
    hostname: string,
    ctxUser: CtxUser | null,
    token?: string
  ) {
    const isUniba = data.email.split("@")[1].includes("uniba");
    const isAdmin = ctxUser?.access.includes(Access.Admin);
    const access: Access[] = [];

    const emailExists = await this.userRepository.findOne({
      email: data.email,
    });
    if (emailExists && emailExists._id !== ctxUser?.id) {
      throw new ArgumentValidationError([
        {
          // target: User, // Object that was validated.
          property: "email", // Object's property that haven't pass validation.
          value: data.email, // Value that haven't pass a validation.
          constraints: {
            // Constraints that failed validation with error messages.
            emailExist: this.i18nService.translate("emailExists", {
              ns: "user",
            }),
          },
          //children?: ValidationError[], // Contains all nested validation errors of the property
        },
      ]);
    }

    if (hostname?.includes("conferences")) {
      access.push(Access.ConferenceAttendee);
    }
    if (hostname?.includes("intern")) {
      if (token && token !== "undefined") {
        await this.tokenService.verifyOneTimeToken(token);
        access.push(Access.Organization);
      } else {
        access.push(Access.Student);
      }
    }

    const user = await this.userRepository.create({
      ...data,
      access: data.access ? data.access : access,
      verified: isAdmin,
      organization: isUniba
        ? "Univerzita Komenského v Bratislave, Právnická fakulta"
        : data.organization,
      billings: isUniba
        ? [
            {
              name: "Univerzita Komenského v Bratislave, Právnická fakulta",
              address: {
                street: "Šafárikovo nám. č. 6",
                city: "Bratislava",
                postal: "810 00",
                country: "Slovensko",
              },
              ICO: "00397865",
              DIC: "2020845332",
              ICDPH: "SK2020845332 ",
            },
          ]
        : [],
    });

    if (!isAdmin) {
      this.rmqService.produceMessage(
        JSON.stringify({
          locale: this.i18nService.language(),
          name: user.name,
          email: user.email,
          hostname,
          token: signJwt({ id: user.id }, { expiresIn: 3600 }),
        }),
        "mail.registration"
      );
    }

    return toUserDTO(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ email });
    if (!user || !user?.password)
      throw new Error(this.i18nService.translate("credentials"));

    const match = await compare(password, user.password);
    if (!match) throw new Error(this.i18nService.translate("credentials"));

    return toUserDTO(user);
  }

  async googleSignIn(authCode: string) {
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
        let user = await this.userRepository.findOne({ email: payload.email });
        if (!user) {
          user = await this.userRepository.create({
            name: payload.name,
            email: payload.email,
            verified: payload.email_verified,
            access: Access.ConferenceAttendee,
          });
        }
        if (!user) {
          throw new Error("User creation failed!");
        }

        return toUserDTO(user);
      } else throw new Error("Invalid token payload");
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async sendPasswordResetLink(email: string, hostname: string) {
    const user = await this.userRepository.findOne({ email });
    if (!user) throw new Error(this.i18nService.translate("notRegistered"));

    const token = signJwt({ id: user.id }, { expiresIn: "1h" });

    this.rmqService.produceMessage(
      JSON.stringify({
        locale: this.i18nService.language(),
        email: user.email,
        name: user.name,
        hostname,
        token,
      }),
      "mail.reset"
    );

    return this.i18nService.translate("resetLinkSent");
  }

  resendActivationLink(user: CtxUser, hostname: string) {
    const token = signJwt({ id: user.id }, { expiresIn: "1h" });

    this.rmqService.produceMessage(
      JSON.stringify({
        locale: this.i18nService.language(),
        name: user?.name,
        email: user?.email,
        hostname,
        token,
      }),
      "mail.registration"
    );

    return this.i18nService.translate("activation");
  }

  async activateUser(token: string) {
    const user: CtxUser | null = verifyJwt(token);
    if (!user) {
      throw new Error(this.i18nService.translate("invalidActivationToken"));
    }

    const activatedUser = await this.userRepository.findOneAndUpdate(
      { _id: user.id, verified: false },
      { verified: true }
    );
    if (!activatedUser) {
      throw new Error(this.i18nService.translate("notFound"));
    }

    return toUserDTO(activatedUser);
  }

  async resetPassword(token: string, password: string) {
    const payload: ResetToken = verifyJwt(token as string);
    if (!payload) throw new Error(this.i18nService.translate("invalidToken"));

    const user = await this.userRepository.findOne({ _id: payload.id });
    if (!user) throw new Error(this.i18nService.translate("notFound"));

    user.password = password;

    await user.save();

    return toUserDTO(user);
  }

  /**
   * Update a user inside a transaction, only if ctxUser is admin or the user themself.
   */
  async updateUser(
    ctxUser: CtxUser,
    id: ObjectId,
    data: UserUpdateData
  ): Promise<UserDTO> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 1) authorization
      const isAdmin = ctxUser.access.includes("ADMIN" as any);
      if (!isAdmin && ctxUser.id.toString() !== id.toString()) {
        throw new Error(this.i18nService.translate("401", { ns: "common" }));
      }

      // 2) load
      const doc = await this.userRepository.findOne({ _id: id }, null, {
        session,
      });
      if (!doc) {
        throw new Error(this.i18nService.translate("notFound", { ns: "user" }));
      }

      // 3) assign only allowed props
      Object.assign(doc, data);

      // 4) save (runs your @pre("save") hooks)
      const saved = await doc.save({ session });

      await session.commitTransaction();
      return toUserDTO(saved);
    } catch (err) {
      console.log(err);
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async deleteUser(id: ObjectId): Promise<UserDTO> {
    const deletedDoc = await this.userRepository.findOneAndDelete({ _id: id });
    if (!deletedDoc) {
      throw new Error(this.i18nService.translate("notFound", { ns: "user" }));
    }

    return toUserDTO(deletedDoc);
  }
}
