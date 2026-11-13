import { ObjectId } from "mongodb";
import { Service } from "typedi";
import { Conference } from "../../entitites/Conference";
import { ReviewFile, ReviewSettings } from "../../entitites/Review";
import { Repository } from "../../repositories/base.repository";
import { CtxUser } from "../../util/types";
import { withOptionalTransaction } from "../../util/helpers";
import { ReviewAccessService } from "../reviews/access.service";
import { ActivityService } from "../reviews/activity.service";

export enum ConferenceTemplateKind {
  Manuscript = "MANUSCRIPT",
  Review = "REVIEW",
}

@Service()
export class ConferenceTemplateService {
  private readonly conferences = new Repository(Conference);
  private readonly files = new Repository(ReviewFile);
  private readonly settings = new Repository(ReviewSettings);

  constructor(
    private readonly access: ReviewAccessService,
    private readonly activity: ActivityService,
  ) {}

  /** Publishes or removes a conference template with atomic audit evidence. Only conference-wide
   * coordinators/admins may change it. Existing round references and stored files are retained.
   */
  async setTemplate(
    user: CtxUser,
    conference: ObjectId,
    kind: ConferenceTemplateKind,
    file: ObjectId | null,
  ) {
    await this.access.conference(user, conference, undefined, true);
    if (!Object.values(ConferenceTemplateKind).includes(kind))
      throw new Error("Invalid template kind.");
    return withOptionalTransaction(undefined, async (session) => {
      if (!(await this.conferences.exists({ _id: conference })))
        throw new Error("Conference not found.");
      if (
        file &&
        !(await this.files.exists({
          _id: file,
          conference,
          kind:
            kind === ConferenceTemplateKind.Manuscript
              ? "MANUSCRIPT_TEMPLATE"
              : "TEMPLATE",
          submission: { $exists: false },
        }))
      )
        throw new Error(
          "Template must belong to this conference and match its purpose.",
        );
      if (kind === ConferenceTemplateKind.Manuscript) {
        await this.conferences.findOneAndUpdate(
          { _id: conference },
          file
            ? { $set: { manuscriptTemplateFile: file } }
            : { $unset: { manuscriptTemplateFile: 1 } },
          { session, runValidators: true },
        );
      } else {
        await this.settings.findOneAndUpdate(
          { conference },
          file
            ? { $set: { templateFile: file } }
            : { $unset: { templateFile: 1 } },
          { session, upsert: Boolean(file), runValidators: true },
        );
      }
      await this.activity.record(
        user,
        "conference.template_updated",
        conference,
        undefined,
        { kind, file: file ? String(file) : null },
        session,
      );
      return true;
    });
  }

  /** Public download resolves only the conference's current manuscript template. Staged,
   * replaced and review templates remain protected by the authenticated file endpoint.
   */
  async manuscriptTemplate(conference: ObjectId) {
    const config = await this.conferences.findOne({ _id: conference });
    const file = config?.manuscriptTemplateFile
      ? await this.files.findOne({
          _id: config.manuscriptTemplateFile,
          conference,
          kind: "MANUSCRIPT_TEMPLATE",
          submission: { $exists: false },
        })
      : null;
    if (!file) throw new Error("Manuscript template not found.");
    return file;
  }
}
