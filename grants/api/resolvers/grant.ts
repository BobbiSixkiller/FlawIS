import {
  Arg,
  Args,
  ArgumentValidationError,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { ObjectId } from "mongodb";
import { DocumentType } from "@typegoose/typegoose/lib/types";
import { Service } from "typedi";
import { CRUDservice } from "../services/CRUDservice";

import { Budget, Grant, Member } from "../entitites/Grant";
import { Announcement } from "../entitites/Announcement";

import env from "dotenv";
import {
  BudgetInput,
  GrantArgs,
  GrantConnection,
  GrantInput,
  MemberInput,
} from "./types/grant";
import { LoadGrant } from "../util/decorators";
import { Context } from "../util/auth";

env.config();

@Service()
@Resolver(() => Grant)
export class GrantResolver {
  constructor(
    private readonly grantService = new CRUDservice(Grant),
    private readonly announcementService = new CRUDservice(Announcement)
  ) { }

  @Authorized()
  @Query(() => GrantConnection)
  async grants(@Args() { after, first }: GrantArgs): Promise<GrantConnection> {
    const grants = await this.grantService.dataModel.paginatedGrants(
      first,
      after
    );
    if (grants[0].edges.length === 0) throw new Error("No grants!")

    return grants[0] as GrantConnection;
  }

  @Authorized()
  @Query(() => Grant)
  async grant(
    @Arg("id") _id: ObjectId,
    @LoadGrant() grant: DocumentType<Grant>
  ) {
    return grant;
  }

  @Authorized()
  @Query(() => [Grant])
  async grantTextSearch(@Arg("text") text: string, @Ctx() { user }: Context) {
    const filter =
      user?.role === "ADMIN"
        ? { $text: { $search: text } }
        : { $text: { $search: text }, "budgets.members.user": user?.id };



    return await this.grantService.findAll(filter);
  }

  @Authorized()
  @Mutation(() => Grant)
  async createGrant(@Arg("data") grantInput: GrantInput): Promise<Grant> {
    return await this.grantService.create(grantInput);
  }

  @Authorized()
  @Mutation(() => Grant)
  async updategrant(
    @Arg("data") grantInput: GrantInput,
    @Arg("id") _id: ObjectId,
    @LoadGrant() grant: DocumentType<Grant>
  ): Promise<Grant> {
    for (const [key, value] of Object.entries(grantInput)) {
      grant[key as keyof GrantInput] = value;
    }

    return await grant.save();
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteGrant(@Arg("id") id: ObjectId): Promise<boolean> {
    const { deletedCount } = await this.grantService.delete({ _id: id });
    return deletedCount > 0;
  }

  @Authorized()
  @Mutation(() => Grant)
  async addApprovedBudget(
    @Arg("id") _id: ObjectId,
    @Arg("data") data: BudgetInput,
    @LoadGrant() grant: DocumentType<Grant>
  ) {
    if (
      grant.budgets.some(
        (b) => b.year.getFullYear() === data.year.getFullYear()
      )
    ) {
      throw new ArgumentValidationError([
        {
          target: Grant, // Object that was validated.
          property: "year", // Object's property that haven't pass validation.
          value: data.year, // Value that haven't pass a validation.
          constraints: {
            // Constraints that failed validation with error messages.
            EmailExists: "Budget is already set for submitted year!",
          },
          //children?: ValidationError[], // Contains all nested validation errors of the property
        },
      ]);
    }

    grant.budgets.push({
      year: data.year,
      approved: {
        services: data.services,
        salaries: data.salaries,
        material: data.material,
        indirect: data.indirect,
        travel: data.travel,
      },
    } as unknown as Budget);

    return await grant.save();
  }

  @Authorized()
  @Mutation(() => Grant)
  async deleteBudget(
    @Arg("id") _id: ObjectId,
    @Arg("year") year: Date,
    @LoadGrant() grant: DocumentType<Grant>
  ) {
    grant.budgets = grant.budgets.filter(
      (b) => b.year.getFullYear() !== year.getFullYear()
    );

    return await grant.save();
  }

  @Authorized()
  @Mutation(() => Grant)
  async addSpentBudget(
    @Arg("id") _id: ObjectId,
    @Arg("data") data: BudgetInput,
    @LoadGrant() grant: DocumentType<Grant>
  ) {
    const budget = grant.budgets.find(
      (b) => b.year.getFullYear() === data.year.getFullYear()
    );
    if (!budget) {
      throw new Error("Budget not found!");
    }

    budget.spent = {
      services: data.services,
      salaries: data.salaries,
      material: data.material,
      indirect: data.indirect,
      travel: data.travel,
    };

    return await grant.save();
  }

  @Authorized()
  @Mutation(() => Grant)
  async addMember(
    @Arg("id") _id: ObjectId,
    @Arg("year") year: Date,
    @Arg("data") data: MemberInput,
    @LoadGrant() grant: DocumentType<Grant>
  ) {
    const budget = grant.budgets.find(
      (b) => b.year.getFullYear() === year.getFullYear()
    );
    if (!budget) {
      throw new Error("Budget not found!");
    }

    if (
      budget.members.some((m) => {
        return m.user?.toString() === data.user?.toString();
      })
    ) {
      throw new ArgumentValidationError([
        {
          target: Grant, // Object that was validated.
          property: "user", // Object's property that haven't pass validation.
          value: data.user, // Value that haven't pass a validation.
          constraints: {
            // Constraints that failed validation with error messages.
            UserExists: "User is already set for submitted year!",
          },
          //children?: ValidationError[], // Contains all nested validation errors of the property
        },
      ]);
    }

    if (data.isMain && budget.members.some((m) => m.isMain === true)) {
      throw new ArgumentValidationError([
        {
          target: Grant, // Object that was validated.
          property: "isMain", // Object's property that haven't pass validation.
          value: data.isMain, // Value that haven't pass a validation.
          constraints: {
            // Constraints that failed validation with error messages.
            MainExists: "Main is already set!",
          },
          //children?: ValidationError[], // Contains all nested validation errors of the property
        },
      ]);
    }

    budget.members.push(data as unknown as Member);

    return await grant.save();
  }

  @Authorized()
  @Mutation(() => Grant)
  async deleteMember(
    @Arg("id") _id: ObjectId,
    @Arg("year") year: Date,
    @Arg("user") user: ObjectId,
    @LoadGrant() grant: DocumentType<Grant>
  ) {
    const index = grant.budgets.findIndex(
      (b) => b.year.getFullYear() === year.getFullYear()
    );
    if (index === -1) {
      throw new Error("Budget for submitted year not found!");
    }

    grant.budgets[index].members = grant.budgets[index].members.filter(
      (m) => m.user?.toString() !== user.toString()
    );

    return await grant.save();
  }

  @FieldResolver(() => [Announcement])
  async announcements(@Root() { announcements }: Grant) {
    return await this.announcementService.findAll({
      _id: { $in: announcements },
    });
  }
}
