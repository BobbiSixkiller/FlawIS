import { Service } from "typedi";
import { Authorized, FieldResolver, Resolver, Root } from "type-graphql";
import { Member } from "../entitites/Grant";
import { User } from "../entitites/User";
import { CRUDservice } from "../services/CRUDservice";

@Service()
@Resolver(() => Member)
export class MemberResolver {
  constructor(private readonly userService = new CRUDservice(User)) {}

  @Authorized()
  @FieldResolver(() => User)
  async member(@Root() { user }: Member): Promise<User | null> {
    return await this.userService.findOne({ _id: user });
  }
}
