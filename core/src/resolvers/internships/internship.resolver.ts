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
import { Intern, Internship, Status } from "../../entitites/Internship";
import { ObjectId } from "mongodb";
import {
  InternshipArgs,
  InternshipConnection,
  InternshipInput,
  InternshipMutationResponse,
} from "../types/internship.types";
import { Access } from "../../entitites/User";
import { I18nService } from "../../services/i18n.service";
import { Context } from "../../util/auth";
import { InternshipService } from "../../services/internships/internship.service";
import { InternService } from "../../services/internships/intern.service";

@Service()
@Resolver(() => Internship)
export class InternshipResolver {
  constructor(
    private readonly internshipService: InternshipService,
    private readonly internService: InternService,
    private readonly i18nService: I18nService
  ) {}

  @Query(() => Internship)
  async internship(
    @Arg("id") id: ObjectId,
    @Ctx() { user }: Context
  ): Promise<Internship> {
    return await this.internshipService.getInternship(id, user);
  }

  @Query(() => InternshipConnection)
  async internships(
    @Args() args: InternshipArgs,
    @Ctx() { user }: Context
  ): Promise<InternshipConnection> {
    return await this.internshipService.getInternships(args, user);
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
    @Arg("id") id: ObjectId,
    @Ctx() { user }: Context
  ): Promise<InternshipMutationResponse> {
    const internship = await this.internshipService.updateInternship(
      data,
      id,
      user!
    );

    return {
      data: internship,
      message: this.i18nService.translate("update", {
        ns: "internship",
        name: internship.organization,
      }),
    };
  }

  @Authorized([Access.Admin, Access.Organization])
  @Mutation(() => InternshipMutationResponse)
  async deleteInternship(
    @Arg("id") id: ObjectId,
    @Ctx() { user }: Context
  ) {
    const internship = await this.internshipService.deleteInternship(
      id,
      user!
    );

    return {
      data: internship,
      message: this.i18nService.translate("delete", {
        ns: "internship",
        name: internship.organization,
      }),
    };
  }

  @FieldResolver(() => Intern, { nullable: true })
  async myApplication(
    @Ctx() { user }: Context,
    @Root() { id: internshipId }: Internship
  ) {
    if (
      !user ||
      user.access.includes(Access.Admin) ||
      user.access.includes(Access.Organization) ||
      !user.access.includes(Access.Student)
    ) {
      return null;
    }

    try {
      return await this.internService.getByUserInternship(
        user.id,
        internshipId
      );
    } catch (error) {
      return null;
    }
  }

  @FieldResolver(() => Int)
  async applicationsCount(
    @Ctx() { user }: Context,
    @Root() { id, user: ownerId }: Internship
  ) {
    const isAdmin = user?.access.includes(Access.Admin) ?? false;
    const isOwningOrganization =
      !isAdmin &&
      (user?.access.includes(Access.Organization) ?? false) &&
      user?.id.toString() === ownerId.toString();

    return await this.internService.countApplications(
      id,
      isOwningOrganization
        ? [Status.Eligible, Status.Accepted, Status.Rejected]
        : undefined
    );
  }
}
