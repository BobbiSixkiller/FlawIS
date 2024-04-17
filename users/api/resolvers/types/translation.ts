import { ClassType, Field, InputType, ObjectType } from "type-graphql";
import { prop as Property } from "@typegoose/typegoose";

export function LocalesType<TranslationType extends object>(
  TranslationTypeClass: ClassType<TranslationType>
) {
  @ObjectType()
  abstract class TranslationsClass {
    @Field(() => TranslationTypeClass)
    @Property({ _id: false, type: () => TranslationTypeClass })
    sk: TranslationType;

    @Field(() => TranslationTypeClass)
    @Property({ _id: false, type: () => TranslationTypeClass })
    en: TranslationType;
  }
  return TranslationsClass;
}

export function LocalesInput<TranslationType extends object>(
  TranslationTypeClass: ClassType<TranslationType>
) {
  @InputType()
  abstract class TranslationsClass {
    @Field(() => TranslationTypeClass)
    sk: TranslationType;

    @Field((type) => TranslationTypeClass)
    en: TranslationType;
  }
  return TranslationsClass;
}
