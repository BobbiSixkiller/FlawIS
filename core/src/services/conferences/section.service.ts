import { ObjectId } from "mongodb";
import { Service } from "typedi";

import { ConferenceRepository } from "../../repositories/conference.repository";
import { SectionRepository } from "../../repositories/section.repository";
import { SubmissionRepository } from "../../repositories/submission.repository";
import { SectionInput } from "../../resolvers/types/conference.types";
import { SubmissionArgs } from "../../resolvers/types/submission.types";
import { I18nService } from "../i18n.service";

@Service()
export class SectionService {
  constructor(
    private readonly sectionRepository: SectionRepository,
    private readonly conferenceRepository: ConferenceRepository,
    private readonly submissionRepository: SubmissionRepository,
    private readonly i18nService: I18nService,
  ) {}

  async createSection(data: SectionInput) {
    const conferenceExists = await this.conferenceRepository.exists({
      _id: data.conference,
    });
    if (!conferenceExists) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "conference" }),
      );
    }
    return await this.sectionRepository.create(data);
  }

  async updateSection(id: ObjectId, data: SectionInput) {
    const section = await this.sectionRepository.findOne({ _id: id });
    if (!section) this.throwNotFound();

    section!.conference = data.conference;
    section!.translations = data.translations;
    await section!.save();
    return section!;
  }

  async deleteSection(id: ObjectId) {
    const section = await this.sectionRepository.findOneAndDelete({ _id: id });
    if (!section) this.throwNotFound();
    return section!;
  }

  async getConference(conferenceId?: ObjectId) {
    if (!conferenceId) return null;
    return await this.conferenceRepository.findOne({ _id: conferenceId });
  }

  async getSubmissions(
    sectionId: ObjectId,
    conferenceId: ObjectId | undefined,
    { first, after }: SubmissionArgs,
  ) {
    return await this.submissionRepository.paginatedSubmissions({
      first,
      after,
      filter: {
        sectionIds: [sectionId],
        conferenceId,
      },
      sort: [],
    });
  }

  private throwNotFound(): never {
    throw new Error(
      this.i18nService.translate("notFound", { ns: "section" }),
    );
  }
}
