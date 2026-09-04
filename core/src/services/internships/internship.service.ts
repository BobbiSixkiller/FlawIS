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
import { sanitizeRichText } from "../../util/sanitizeRichText";

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
      const connection = await this.internshipRepository.paginatedInternships(
        args,
        ctxUser
      );

      return {
        ...connection,
        edges: connection.edges.map((edge) =>
          edge
            ? {
                ...edge,
                node: {
                  ...edge.node,
                  description: sanitizeRichText(edge.node.description),
                },
              }
            : edge
        ),
      };
    } catch (error: any) {
      throw new Error(`Error fetching internships: ${error.message}`);
    }
  }

  async getInternship(id: ObjectId, ctxUser: CtxUser | null = null) {
    const internship = await this.internshipRepository.findOne({ _id: id });
    if (!internship) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "internship" })
      );
    }

    const isAdmin = ctxUser?.access.includes(Access.Admin) ?? false;
    const isNonOwningOrganization =
      !isAdmin &&
      (ctxUser?.access.includes(Access.Organization) ?? false) &&
      ctxUser?.id.toString() !== internship.user.toString();

    if (isNonOwningOrganization) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "internship" })
      );
    }

    return {
      ...toDTO(internship),
      description: sanitizeRichText(internship.description),
    };
  }

  async createInternship(data: InternshipInput, ctxUser: CtxUser) {
    if (
      !ctxUser.access.includes(Access.Admin) &&
      !ctxUser.access.includes(Access.Organization)
    ) {
      throw new Error("Not allowed!");
    }

    const user = await this.userService.getUser(ctxUser.id);
    if (!user.organization) {
      throw new Error("User has to have organization defined!");
    }

    return await this.internshipRepository.create({
      ...data,
      description: sanitizeRichText(data.description),
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
      await this.assertCanManageInternship(id, ctxUser);

      const internship = await this.internshipRepository.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            ...data,
            description: sanitizeRichText(data.description),
          },
        },
        { session }
      );
      if (!internship) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "internship" })
        );
      }

      await session.commitTransaction();
      return {
        ...toDTO(internship),
        description: sanitizeRichText(internship.description),
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteInternship(id: ObjectId, ctxUser: CtxUser) {
    await this.assertCanManageInternship(id, ctxUser);

    const internship = await this.internshipRepository.findOneAndDelete({
      _id: id,
    });
    if (!internship) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "internship" })
      );
    }

    return {
      ...toDTO(internship),
      description: sanitizeRichText(internship.description),
    };
  }

  async assertCanManageInternship(id: ObjectId, ctxUser: CtxUser) {
    const internship = await this.internshipRepository.findOne({ _id: id });
    if (!internship) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "internship" })
      );
    }

    const isAdmin = ctxUser.access.includes(Access.Admin);
    const isOwningOrganization =
      !isAdmin &&
      ctxUser.access.includes(Access.Organization) &&
      ctxUser.id.toString() === internship.user.toString();

    if (!isAdmin && !isOwningOrganization) {
      throw new Error("Not allowed!");
    }

    return toDTO(internship);
  }
}
