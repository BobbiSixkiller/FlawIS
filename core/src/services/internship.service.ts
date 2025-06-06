import { Service } from "typedi";
import { Internship } from "../entitites/Internship";
import { ObjectId } from "mongodb";
import {
  InternshipArgs,
  InternshipConnection,
  InternshipInput,
} from "../resolvers/types/internship";
import { I18nService } from "./i18n.service";
import { User } from "../util/types";
import { UserService } from "./user.service";
import { DocumentType } from "@typegoose/typegoose";
import { InternshipRepository } from "../repositories/internship.repository";

function toInternshipDTO(doc: DocumentType<Internship>) {
  const json = doc.toJSON({
    virtuals: false,
    versionKey: false, // drop __v
    transform(_doc, ret) {
      // copy _id → id and remove _id
      if (ret._id) {
        ret.id = ret._id;
        delete ret._id;
      }

      return ret;
    },
  });

  return json as Internship;
}

@Service()
export class InternshipService {
  constructor(
    private readonly internshipRepository: InternshipRepository,
    private readonly i18nService: I18nService,
    private readonly userService: UserService
  ) {}

  async getInternships(args: InternshipArgs): Promise<InternshipConnection> {
    try {
      return await this.internshipRepository.paginatedInternships(args);
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

    return toInternshipDTO(internship);
  }

  async createInternship(data: InternshipInput, ctxUser: User) {
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

  async updateInternship(data: InternshipInput, id: ObjectId) {
    const internship = await this.internshipRepository.findOne({ _id: id });
    if (!internship) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "internship" })
      );
    }

    for (const [key, value] of Object.entries(data)) {
      internship[key as keyof InternshipInput] = value;
    }

    const update = await internship.save();

    return toInternshipDTO(update);
  }

  async deleteInternship(id: ObjectId) {
    return await this.internshipRepository.delete({ _id: id });
  }
}
