import { Min } from "class-validator";
import { ObjectId } from "mongodb";
import {
  ArgsType,
  ClassType,
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "type-graphql";

type EncodedValue =
  | { t: "oid"; v: string }
  | { t: "date"; v: string }
  | { t: "num"; v: number }
  | { t: "str"; v: string }
  | { t: "bool"; v: boolean };

export function encodeCursor(fields: Record<string, any>): string {
  const encoded: Record<string, EncodedValue> = {};

  for (const [key, value] of Object.entries(fields)) {
    if (value instanceof ObjectId) {
      encoded[key] = { t: "oid", v: value.toHexString() };
    } else if (value instanceof Date) {
      encoded[key] = { t: "date", v: value.toISOString() };
    } else if (typeof value === "number") {
      encoded[key] = { t: "num", v: value };
    } else if (typeof value === "boolean") {
      encoded[key] = { t: "bool", v: value };
    } else {
      // fallback to string
      encoded[key] = { t: "str", v: String(value) };
    }
  }

  return Buffer.from(JSON.stringify(encoded)).toString("base64");
}

export function decodeCursor(cursor: string): Record<string, any> {
  const raw = JSON.parse(
    Buffer.from(cursor, "base64").toString("utf8")
  ) as Record<string, EncodedValue>;

  const decoded: Record<string, any> = {};

  for (const [key, { t, v }] of Object.entries(raw)) {
    switch (t) {
      case "oid":
        decoded[key] = new ObjectId(v);
        break;
      case "date":
        decoded[key] = new Date(v);
        break;
      case "num":
        decoded[key] = v;
        break;
      case "bool":
        decoded[key] = v;
        break;
      case "str":
      default:
        decoded[key] = v;
        break;
    }
  }

  return decoded;
}

export type SortField = { field: string; direction: 1 | -1 };
export type CursorValues = Record<string, any>;

export function ensureIdSort(sortFields: SortField[]): SortField[] {
  const hasId = sortFields.some((f) => f.field === "_id");
  if (hasId) {
    return sortFields;
  }
  return [...sortFields, { field: "_id", direction: -1 }];
}

export function buildCursorFilter(
  sortFields: SortField[],
  cursor: CursorValues
): any {
  function recurse(i: number): any {
    const { field, direction } = sortFields[i];
    const value = cursor[field];

    const comparison = direction === 1 ? { $gt: value } : { $lt: value };
    const eqCondition = { [field]: value };

    if (i === sortFields.length - 1) {
      return { [field]: comparison };
    }

    return {
      $or: [
        { [field]: comparison },
        {
          ...eqCondition,
          ...recurse(i + 1),
        },
      ],
    };
  }

  return recurse(0);
}

export enum SortDirection {
  ASC = 1,
  DESC = -1,
}

registerEnumType(SortDirection, {
  name: "SortDirection",
  description: "Ascending/descending direction of the sort field",
});

export function CreateArgs<TNode extends object, TSortFieldEnum extends object>(
  TNodeClass: ClassType<TNode>,
  TSortableField: TSortFieldEnum
) {
  @InputType(`${TNodeClass.name}SortInput`)
  abstract class Sort {
    @Field(() => TSortableField)
    field: TSortFieldEnum;

    @Field(() => SortDirection)
    direction: SortDirection;
  }

  @ArgsType()
  abstract class ConnectionArgs {
    @Field({ nullable: true })
    after?: string;

    @Field(() => Int, { defaultValue: 20 })
    @Min(1)
    first: number = 20;

    @Field(() => [Sort], { nullable: "items" })
    sort: Sort[];
  }

  return ConnectionArgs;
}

//generic function for creating corresponding Connection Type enabling relay style pagination
export function CreateConnection<TNode extends object>(
  TNodeClass: ClassType<TNode>
) {
  @ObjectType(`${TNodeClass.name}Edge`)
  abstract class Edge {
    @Field(() => TNodeClass) // here we use the runtime argument
    node: TNode; // and here the generic type

    @Field()
    cursor: string;
  }

  @ObjectType(`${TNodeClass.name}PageInfo`)
  abstract class PageInfo {
    @Field({ nullable: true })
    endCursor?: string;

    @Field()
    hasNextPage: boolean;
  }

  @ObjectType()
  abstract class Connection {
    @Field(() => [Edge], { nullable: "items" })
    edges: Edge[];

    @Field(() => PageInfo)
    pageInfo: PageInfo;

    @Field(() => Int)
    totalCount: number;
  }

  return Connection;
}
