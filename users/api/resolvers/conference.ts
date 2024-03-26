import {
  Arg,
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Service } from "typedi";
import { CRUDservice } from "../services/CRUDservice";
import { Conference, ConferenceTranslation } from "../entitites/Conference";
import { I18nService } from "../services/i18nService";
import {
  ConferenceArgs,
  ConferenceConnection,
  ConferenceInput,
  ConferenceMutationResponse,
} from "./types/conference";
import { ObjectId } from "mongodb";
import { LoadResource } from "../util/decorators";
import { DocumentType } from "@typegoose/typegoose";

import { Context } from "../util/auth";
import { Attendee } from "../entitites/Attendee";

@Service()
@Resolver(() => Conference)
export class ConferencerResolver {
  constructor(
    private readonly conferenceService = new CRUDservice(Conference),
    private readonly attendeeService = new CRUDservice(Attendee),
    private readonly i18nService: I18nService
  ) {}

  @Authorized()
  @Query(() => ConferenceConnection)
  async conferences(
    @Args() { first, after }: ConferenceArgs,
    @Ctx() { locale }: Context
  ): Promise<ConferenceConnection> {
    const users = await this.conferenceService.dataModel.paginatedConferences(
      first,
      after
    );

    return users[0] as ConferenceConnection;
  }

  @Authorized()
  @Query(() => Conference)
  async conference(
    @Arg("slug") _slug: string,
    @LoadResource(Conference) conference: DocumentType<Conference>
  ) {
    return conference;
  }

  @Authorized(["ADMIN"])
  @Query(() => [Conference])
  async textSearchConference(@Arg("text") text: string) {
    return await this.conferenceService.aggregate([
      { $match: { $text: { $search: text } } },
      { $sort: { score: { $meta: "textScore" } } },
      { $addFields: { id: "$_id" } },
      { $limit: 10 },
    ]);
  }

  @Authorized(["ADMIN"])
  @Mutation(() => ConferenceMutationResponse)
  async createConference(
    @Arg("data") data: ConferenceInput
  ): Promise<ConferenceMutationResponse> {
    const conference = await this.conferenceService.create(data);

    return {
      data: conference,
      message: this.i18nService.translate("new", {
        ns: "conference",
        name: conference.translations[
          this.i18nService.language() as keyof ConferenceTranslation
        ].name,
      }),
    };
  }

  @Authorized(["ADMIN"])
  @Mutation(() => String)
  async deleteConference(
    @Arg("id") _id: ObjectId,
    @LoadResource(Conference) conference: DocumentType<Conference>
  ): Promise<string> {
    await this.conferenceService.delete({ _id: conference.id });

    return this.i18nService.translate("delete", {
      ns: "conference",
      name: conference.translations[
        this.i18nService.language() as keyof ConferenceTranslation
      ].name,
    });
  }

  @Authorized()
  @FieldResolver(() => Attendee, { nullable: true })
  async attending(@Ctx() { user }: Context, @Root() { id }: Conference) {
    return await this.attendeeService.findOne({
      conference: id,
      user: user?.id,
    });
  }
}
