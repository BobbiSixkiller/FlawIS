import {
  Arg,
  Authorized,
  Ctx,
  Mutation,
  Resolver,
  registerEnumType,
} from "type-graphql";
import { ObjectId } from "mongodb";
import { Service } from "typedi";
import { Context } from "../../util/auth";
import {
  ConferenceTemplateKind,
  ConferenceTemplateService,
} from "../../services/conferences/conference-template.service";

registerEnumType(ConferenceTemplateKind, { name: "ConferenceTemplateKind" });

@Service()
@Resolver()
export class ConferenceTemplateResolver {
  constructor(private readonly templates: ConferenceTemplateService) {}

  @Authorized()
  @Mutation(() => Boolean)
  setConferenceTemplate(
    @Ctx() { user }: Context,
    @Arg("conference") conference: ObjectId,
    @Arg("kind", () => ConferenceTemplateKind) kind: ConferenceTemplateKind,
    @Arg("file", () => ObjectId, { nullable: true }) file?: ObjectId | null,
  ) {
    return this.templates.setTemplate(user!, conference, kind, file ?? null);
  }
}
