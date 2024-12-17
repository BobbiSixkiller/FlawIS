import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { Service } from "typedi";
import { Internship } from "../entitites/Internship";
import { InternshipService } from "../services/internshipService";
import { ObjectId } from "mongodb";
import {
  InternshipArgs,
  InternshipConnection,
  InternshipInput,
  InternshipMutationResponse,
} from "./types/internship";
import { Access } from "../entitites/User";
import { I18nService } from "../services/i18nService";
import { Context } from "../util/auth";

@Service()
@Resolver(() => Internship)
export class InternshipResolver {
  constructor(
    private readonly internshipService: InternshipService,
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
    console.log(user);
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
}
