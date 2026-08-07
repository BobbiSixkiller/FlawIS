import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { Field, InputType } from "type-graphql";

import { Address, Billing } from "../../entitites/Billing";

@InputType()
export class AddressInput implements Address {
  @Field()
  @IsString()
  street: string;

  @Field()
  @IsString()
  city: string;

  @Field()
  @IsString()
  postal: string;

  @Field()
  @IsString()
  country: string;
}

@InputType()
export class BillingInput implements Billing {
  @Field()
  @IsString()
  name: string;

  @Field(() => AddressInput)
  address: AddressInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  DIC?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ICDPH?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ICO?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  IBAN?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  SWIFT?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, {
    message: "variableSymbol must contain only numeric digits",
  })
  @MaxLength(10)
  variableSymbol?: string;
}
