import {
  Arg,
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Service } from "typedi";
import { Intern, Internship, Status } from "../entitites/Internship";
import { InternshipService } from "../services/internship.service";
import { ObjectId } from "mongodb";
import {
  InternshipArgs,
  InternshipConnection,
  InternshipInput,
  InternshipMutationResponse,
} from "./types/internship";
import { Access } from "../entitites/User";
import { I18nService } from "../services/i18n.service";
import { Context } from "../util/auth";
import { InternService } from "../services/intern.service";

@Service()
@Resolver(() => Internship)
export class InternshipResolver {
  constructor(
    private readonly internshipService: InternshipService,
    private readonly internService: InternService,
    private readonly i18nService: I18nService
  ) {}

  @Authorized()
  @Query(() => Internship)
  async internship(@Arg("id") id: ObjectId): Promise<Internship> {
    return await this.internshipService.getInternship(id);
  }

  @Authorized()
  @Query(() => InternshipConnection)
  async internships(
    @Args() args: InternshipArgs
  ): Promise<InternshipConnection> {
    return await this.internshipService.getInternships(args);
  }

  @Authorized([Access.Admin, Access.Organization])
  @Mutation(() => InternshipMutationResponse)
  async createInternship(
    @Arg("input") data: InternshipInput,
    @Ctx() { user }: Context
  ): Promise<InternshipMutationResponse> {
    const internship = await this.internshipService.createInternship(
      data,
      user!
    );

    return {
      data: internship,
      message: this.i18nService.translate("new", {
        ns: "internship",
        name: internship.organization,
      }),
    };
  }

  @Authorized([Access.Admin, Access.Organization])
  @Mutation(() => InternshipMutationResponse)
  async updateInternship(
    @Arg("input") data: InternshipInput,
    @Arg("id") id: ObjectId
  ): Promise<InternshipMutationResponse> {
    const internship = await this.internshipService.updateInternship(data, id);

    return {
      data: internship,
      message: this.i18nService.translate("update", {
        ns: "internship",
        name: internship.organization,
      }),
    };
  }

  @Authorized([Access.Admin, Access.Organization])
  @Mutation(() => Boolean)
  async deleteInternship(@Arg("id") id: ObjectId): Promise<boolean> {
    const { deletedCount } = await this.internshipService.deleteInternship(id);

    return deletedCount > 0;
  }

  // @Authorized()
  // @Mutation(() => InternshipMutationResponse)
  // async createIntern(
  //   @Ctx() { user, req }: Context,
  //   @Arg("internshipId") internshipId: ObjectId,
  //   @Arg("fileUrls", () => [String], { nullable: "items" }) fileUrls: string[]
  // ): Promise<InternshipMutationResponse> {
  //   const hostname = req.headers["tenant-domain"] as string;

  //   const internship = await this.internshipService.getInternship(internshipId);
  //   const intern = await this.internService.createIntern(
  //     user!.id,
  //     internshipId,
  //     fileUrls,
  //     hostname
  //   );

  //   console.log({ ...internship, myApplication: intern });

  //   return {
  //     message: this.i18nService.translate("applied", { ns: "intern" }),
  //     data: { ...internship, myApplication: intern },
  //   };
  // }

  @Authorized()
  @FieldResolver(() => Intern, { nullable: true })
  async myApplication(
    @Ctx() { user }: Context,
    @Root() { id: internshipId }: Internship
  ) {
    try {
      return await this.internService.getByUserInternship(
        user!.id,
        internshipId
      );
    } catch (error) {
      return null;
    }
  }

  @Authorized()
  @FieldResolver(() => Int)
  async applicationsCount(
    @Ctx() { user }: Context,
    @Root() { id }: Internship
  ): Promise<number> {
    const { totalCount } = await this.internService.getInterns({
      first: 1000,
      internship: id,
      status: user?.access.includes(Access.Organization)
        ? [Status.Eligible, Status.Accepted, Status.Rejected]
        : undefined,
    });

    return totalCount;
  }
}
