import { Field, InputType } from "type-graphql";
import { FieldType } from "../../../entitites/Form";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { ObjectId } from "mongodb";
import { UniqueFieldNames } from "../../../util/decorators";
import { JSONObject } from "../../../util/scalars";

/**
 * Input option
 */
@InputType()
export class SelectOptionInput {
  @Field()
  @IsString()
  @MaxLength(200)
  value: string;

  @Field()
  @IsString()
  @MaxLength(200)
  text: string;
}

/**
 * Field input with optional ID to support changing of existing fields across versions
 */
@InputType()
export class FormFieldInput {
  @Field(() => ObjectId, { nullable: true })
  id?: ObjectId;

  @Field(() => FieldType)
  @IsEnum(FieldType)
  type: FieldType;

  @Field()
  @IsString()
  @MaxLength(200)
  label: string;

  @Field(() => Boolean)
  @IsBoolean()
  required: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  placeholder?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  helpText?: string;

  /**
   * Only for SELECT. Enforce conditional requirement in service layer,
   * or add a custom class-validator constraint if you want.
   */
  @Field(() => [SelectOptionInput], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  selectOptions?: SelectOptionInput[];
}
