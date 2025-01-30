import {
  Arg,
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Service } from "typedi";
import { Intern, Status, UserReferece } from "../entitites/Internship";
import { InternshipService } from "../services/internshipService";
import { InternService } from "../services/internService";
import { I18nService } from "../services/i18nService";
import {
  InternArgs,
  InternConnection,
  InternMutationResponse,
} from "./types/internship";
import { ObjectId } from "mongodb";
import { Context } from "../util/auth";
import { Access } from "../entitites/User";
import { UserService } from "../services/userService";

@Service()
@Resolver(() => Intern)
export class InternResolver {
  constructor(
    private readonly internService: InternService,
    private readonly userService: UserService,
    private readonly i18nService: I18nService
  ) {}

  @Authorized([Access.Admin, Access.Organization])
  @Query(() => Intern)
  async intern(@Arg("id") id: ObjectId): Promise<Intern> {
    return await this.internService.getById(id);
  }

  @Authorized([Access.Admin, Access.Organization])
  @Query(() => InternConnection)
  async interns(@Args() args: InternArgs): Promise<InternConnection> {
    return await this.internService.getInterns(args);
  }

  @Authorized([Access.Admin, Access.Organization])
  @Mutation(() => InternMutationResponse)
  async changeInternStatus(
    @Arg("id") id: ObjectId,
    @Arg("status", () => Status) status: Status,
    @Ctx() { req }: Context
  ): Promise<InternMutationResponse> {
    const hostname = req.headers["tenant-domain"] as string;

    const intern = await this.internService.changeStatus(status, id, hostname);

    return {
      message: this.i18nService.translate("status", { ns: "intern" }),
      data: intern,
    };
  }

  @Authorized()
  @Mutation(() => InternMutationResponse)
  async updateInternFiles(
    @Ctx() { user }: Context,
    @Arg("id") id: ObjectId,
    @Arg("fileUrls", () => [String], { nullable: "items" }) fileUrls: string[]
  ): Promise<InternMutationResponse> {
    const intern = await this.internService.updateFiles(fileUrls, id, user!);

    return {
      message: this.i18nService.translate("internFiles", { ns: "intern" }),
      data: intern,
    };
  }

  @Authorized([Access.Admin, Access.Organization])
  @Mutation(() => InternMutationResponse)
  async updateOrgFeedback(
    @Ctx() { user }: Context,
    @Arg("id") id: ObjectId,
    @Arg("fileUrl", { nullable: true }) fileUrl: string
  ): Promise<InternMutationResponse> {
    const intern = await this.internService.updateOrganizationFeedbackUrl(
      id,
      user!,
      fileUrl
    );

    return {
      message: this.i18nService.translate("feedback", { ns: "intern" }),
      data: intern,
    };
  }

  @Authorized()
  @Mutation(() => InternMutationResponse)
  async deleteIntern(
    @Ctx() { user }: Context,
    @Arg("id") id: ObjectId
  ): Promise<InternMutationResponse> {
    const intern = await this.internService.deleteIntern(id, user!);

    return {
      message: this.i18nService.translate("delete", {
        ns: "intern",
        name: intern.user.name,
      }),
      data: intern,
    };
  }

  @Authorized()
  @FieldResolver(() => UserReferece)
  async user(@Root() { user: userReference }: Intern): Promise<UserReferece> {
    try {
      const user = await this.userService.getUser(userReference.id);

      return { ...userReference, avatarUrl: user.avatarUrl };
    } catch (error: any) {
      console.log(error.message);
      return userReference;
    }
  }
}
