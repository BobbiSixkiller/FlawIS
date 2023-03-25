import { Field, InputType } from "type-graphql";
import { IsLocale, IsString } from "class-validator";

import { Section } from "../../entities/Section";

@InputType()
class TranslationInput {
	@Field()
	language: string;

	@Field()
	name: string;

	@Field()
	description: string;
}

@InputType({ description: "Conference section input type" })
export class SectionInput implements Partial<Section> {
	@Field()
	@IsString()
	name: string;

	@Field()
	@IsString()
	description: string;

	@Field(() => [TranslationInput])
	translations: TranslationInput[];

	@Field(() => [String])
	@IsLocale({ each: true })
	languages: string[];
}
