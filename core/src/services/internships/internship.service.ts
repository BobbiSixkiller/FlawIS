import { Service } from "typedi";
import { ObjectId } from "mongodb";
import {
  InternshipArgs,
  InternshipConnection,
  InternshipInput,
} from "../../resolvers/types/internship.types";
import { I18nService } from "../i18n.service";
import { UserService } from "../user.service";
import { mongoose } from "@typegoose/typegoose";
import { InternshipRepository } from "../../repositories/internship.repository";
import { CtxUser } from "../../util/types";
import { Access } from "../../entitites/User";
import { toDTO } from "../../util/helpers";

@Service()
export class InternshipService {
  constructor(
    private readonly internshipRepository: InternshipRepository,
    private readonly i18nService: I18nService,
    private readonly userService: UserService
  ) {}

  async getInternships(
    args: InternshipArgs,
    ctxUser: CtxUser | null
  ): Promise<InternshipConnection> {
    try {
      return await this.internshipRepository.paginatedInternships(
        args,
        ctxUser
      );
    } catch (error: any) {
      throw new Error(`Error fetching internships: ${error.message}`);
    }
  }

  async getInternship(id: ObjectId) {
    const internship = await this.internshipRepository.findOne({ _id: id });
    if (!internship) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "internship" })
      );
    }

    return toDTO(internship);
  }

  async createInternship(data: InternshipInput, ctxUser: CtxUser) {
    const user = await this.userService.getUser(ctxUser.id);
    if (!user.organization) {
      throw new Error("User has to have organization defined!");
    }

    return await this.internshipRepository.create({
      ...data,
      organization: user.organization,
      user: user.id,
      language: this.i18nService.language(),
    });
  }

  async updateInternship(
    data: InternshipInput,
    id: ObjectId,
    ctxUser: CtxUser
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const internship = await this.internshipRepository.findOneAndUpdate(
        { _id: id },
        { $set: data },
        { session }
      );
      if (!internship) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "internship" })
        );
      }

      if (
        !ctxUser.access.includes(Access.Admin) &&
        ctxUser.id.toString() !== internship.user.toString()
      ) {
        throw new Error("Not allowed!");
      }

      await session.commitTransaction();
      return toDTO(internship);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteInternship(id: ObjectId) {
    const internship = await this.internshipRepository.findOneAndDelete({
      _id: id,
    });
    if (!internship) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "internship" })
      );
    }

    return internship;
  }
}
