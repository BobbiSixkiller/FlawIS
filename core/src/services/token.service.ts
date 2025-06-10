import { Service } from "typedi";
import { v4 as uuidv4 } from "uuid";
import { RedisService } from "./redis.service";
import { signJwt, verifyJwt } from "../util/auth";

@Service()
export class TokenService {
  constructor(private readonly redisService: RedisService) {}

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
}
