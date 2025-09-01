import { Service } from "typedi";
import { v4 as uuidv4 } from "uuid";
import { RedisService } from "./redis.service";
import { signJwt, verifyJwt } from "../util/auth";
import { I18nService } from "./i18n.service";

@Service()
export class TokenService {
  constructor(
    private readonly redisService: RedisService,
    private readonly i18nService: I18nService
  ) {}

  // Generate a one-time-use token
  async generateOneTimeToken(expiresIn: number, payload?: object) {
    const tokenId = uuidv4();
    const token = signJwt({ tokenId, payload }, { expiresIn });

    // Store token ID in Redis
    await this.redisService.set(tokenId, "valid", expiresIn);
    return token;
  }

  // Verify a one-time-use token
  async verifyOneTimeToken<T>(token: string) {
    const decoded = verifyJwt<{ tokenId: string; payload?: T }>(token);
    if (!decoded) {
      throw new Error(
        this.i18nService.translate("tokenMalformed", { ns: "common" })
      );
    }

    // Check if the token ID is still valid in Redis
    const tokenStatus = await this.redisService.get(decoded?.tokenId);
    if (tokenStatus !== "valid") {
      this.i18nService.translate("tokenUsed", { ns: "common" });
    }

    // Mark the token ID as used
    await this.redisService.delete(decoded.tokenId);

    return decoded; // Token is valid
  }
}
