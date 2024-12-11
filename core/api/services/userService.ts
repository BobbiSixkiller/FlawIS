import { Service } from "typedi";
import { CRUDservice } from "./CRUDservice";
import { Access, User } from "../entitites/User";
import { v4 as uuidv4 } from "uuid";
import { signJwt, verifyJwt } from "../util/auth";
import { UserArgs, UserConnection, UserInput } from "../resolvers/types/user";
import { transformIds } from "../middlewares/typegoose-middleware";
import { RmqService } from "./rmqService";
import { RedisService } from "./redisService";
import { I18nService } from "./i18nService";

@Service()
export class UserService {
  constructor(
    private readonly userCrudService = new CRUDservice(User),
    private readonly rmqService: RmqService,
    private readonly redisService: RedisService,
    private readonly i18nService: I18nService
  ) {}

  // Generate a one-time-use token
  private async generateOneTimeToken(expiresIn: number) {
    const tokenId = uuidv4();
    const token = signJwt({ tokenId }, { expiresIn });

    // Store token ID in Redis
    await this.redisService.set(tokenId, "valid", expiresIn);
    return token;
  }

  // Verify a one-time-use token
  private async verifyOneTimeToken(token: string) {
    const decoded = verifyJwt<{ tokenId: string }>(token);
    if (!decoded) {
      throw new Error("Token has been malformed or expired");
    }

    // Check if the token ID is still valid in Redis
    const tokenStatus = await this.redisService.get(decoded?.tokenId);
    if (tokenStatus !== "valid") {
      throw new Error("Token has already been used");
    }

    // Mark the token ID as used
    await this.redisService.delete(decoded.tokenId);

    return decoded; // Token is valid
  }

  async getPaginatedUsers({ first, after }: UserArgs) {
    const data = await this.userCrudService.dataModel.paginatedUsers(
      first,
      after
    );

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

  async sendRegistrationLinks(emails: string[], hostname: string) {
    for await (const email of emails) {
      const token = await this.generateOneTimeToken(60 * 60 * 24 * 7); // Token valid for 7 days
      const locale = this.i18nService.language();

      await this.rmqService.produceMessage(
        JSON.stringify({ hostname, token, email, locale }),
        "mail.internships.newOrg"
      );
    }
  }

  async createUser(
    data: UserInput,
    hostname: string,
    isAdmin?: boolean,
    token?: string
  ) {
    const access: Access[] = [];

    if (hostname?.includes("conferences")) {
      access.push(Access.ConferenceAttendee);
    }
    if (hostname?.includes("internships")) {
      if (token) {
        await this.verifyOneTimeToken(token);
        access.push(Access.Organization);
      } else {
        access.push(Access.Student);
      }
    }

    const user = await this.userCrudService.create({
      ...data,
      access: data.access ? data.access : access,
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
    } else {
      user.verified = true;
      await user.save();
    }

    return user;
  }
}
