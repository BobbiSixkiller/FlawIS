import {
  ArgumentValidationError,
  Field,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { ObjectId } from "mongodb";
import {
  getModelForClass,
  Index,
  post,
  pre,
  prop as Property,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { hash } from "bcrypt";
import { signJwt } from "../util/auth";
import { ModelType } from "@typegoose/typegoose/lib/types";
import Container from "typedi";
import { I18nService } from "../services/i18nService";
import { Billing } from "./Billing";

export enum Role {
  Basic = "BASIC",
  Admin = "ADMIN",
  Student = "STUDENT",
  Organization = "ORGANIZATION",
}

registerEnumType(Role, {
  name: "Role", // this one is mandatory
  description: "User role inside the FLAWIS system", // this one is optional
});

@pre<User>("save", async function () {
  if ((this.isNew && this.password) || this.isModified("password")) {
    this.password = await hash(this.password, 12);
  }
  if (this.isNew || this.isModified("email")) {
    const emailExists = await getModelForClass(User)
      .findOne({ email: this.email })
      .exec();
    if (emailExists && emailExists.id !== this.id) {
      throw new ArgumentValidationError([
        {
          target: User, // Object that was validated.
          property: "email", // Object's property that haven't pass validation.
          value: this.email, // Value that haven't pass a validation.
          constraints: {
            // Constraints that failed validation with error messages.
            emailExists: Container.get(I18nService).translate("emailExists"),
          },
          //children?: ValidationError[], // Contains all nested validation errors of the property
        },
      ]);
    }
  }
  if (this.email.split("@")[1].includes("uniba")) {
    this.organization = "Univerzita Komenského v Bratislave, Právnická fakulta";
  }
  if (this.isNew && this.email.split("@")[1].includes("uniba")) {
    this.billings.push({
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
    });
  }
})
@Index({ name: "text", email: "text" })
@ObjectType({ description: "The user model entity" })
export class User extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  @Property({ unique: true })
  email: string;

  @Property()
  password: string;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property({ default: "N/A" })
  telephone: string;

  @Field()
  @Property({ default: "N/A" })
  organization: string;

  @Field(() => [Billing], { nullable: "items" })
  @Property({ type: () => [Billing], _id: false, default: [] })
  billings: Billing[];

  @Field(() => Role)
  @Property({
    default: "BASIC",
    enum: ["BASIC", "ADMIN", "STUDENT", "ORGANIZATION"],
  })
  role: Role;

  @Field({ nullable: true })
  @Property()
  cvUrl?: string;

  @Field()
  @Property({ default: false })
  verified: boolean;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;

  @Field()
  get token(): string {
    return (
      "Bearer " +
      signJwt(
        {
          id: this.id,
          email: this.email,
          name: this.name,
          role: this.role,
        },
        { expiresIn: "24h" }
      )
    );
  }

  public static async paginatedUsers(
    this: ModelType<User>,
    first: number,
    after?: ObjectId
  ) {
    return await this.aggregate([
      { $sort: { _id: -1 } },
      {
        $facet: {
          data: [
            {
              $match: {
                $expr: {
                  $cond: [
                    { $eq: [after, null] },
                    { $ne: ["$_id", null] },
                    { $lt: ["$_id", after] },
                  ],
                },
              },
            },
            { $limit: first || 20 },
          ],
          hasNextPage: [
            {
              $match: {
                $expr: {
                  $cond: [
                    { $eq: [after, null] },
                    { $ne: ["$_id", null] },
                    { $lt: ["$_id", after] },
                  ],
                },
              },
            },
            { $skip: first || 20 }, // skip paginated data
            { $limit: 1 }, // just to check if there's any element
          ],
          totalCount: [{ $count: "totalCount" }], // Count matching documents,
        },
      },
      {
        $project: {
          totalCount: { $arrayElemAt: ["$totalCount.totalCount", 0] }, // Extract totalCount value
          edges: {
            $map: {
              input: "$data",
              as: "edge",
              in: { cursor: "$$edge._id", node: "$$edge" },
            },
          },
          pageInfo: {
            hasNextPage: { $eq: [{ $size: "$hasNextPage" }, 1] },
            endCursor: { $last: "$data._id" },
          },
        },
      },
    ]);
  }
}
