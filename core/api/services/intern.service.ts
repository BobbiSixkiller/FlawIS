import { Service } from "typedi";
import { Intern, Status } from "../entitites/Internship";
import { InternArgs } from "../resolvers/types/internship";
import { ObjectId } from "mongodb";
import { I18nService } from "./i18n.service";
import { User } from "../util/types";
import { InternshipService } from "./internship.service";
import { getAcademicYear } from "../util/helpers";
import { Access } from "../entitites/User";
import { UserService } from "./user.service";
import { RmqService, RoutingKey } from "./rmq.service";
import { MinioService } from "./minio.service";
import { InternRepository } from "../repositories/intern.repository";
import mongoose from "mongoose";
import { DocumentType } from "@typegoose/typegoose";

function toInternDTO(doc: DocumentType<Intern>): Intern {
  const { _id, ...rest } = doc.toJSON({ versionKey: false });
  return { ...rest, id: _id };
}

@Service()
export class InternService {
  constructor(
    private readonly internRepository: InternRepository,
    private readonly internshipService: InternshipService,
    private readonly userService: UserService,
    private readonly i18nService: I18nService,
    private readonly rmqService: RmqService,
    private readonly minioService: MinioService
  ) {}

  async getInterns(args: InternArgs) {
    return await this.internRepository.paginatedInterns(args);
  }

  async getById(id: ObjectId) {
    const intern = await this.internRepository.findOne({ _id: id });
    if (!intern) {
      throw new Error(this.i18nService.translate("notFound", { ns: "intern" }));
    }

    return toInternDTO(intern);
  }

  async getByUserInternship(userId: ObjectId, internshipId: ObjectId) {
    const intern = await this.internRepository.findOne({
      "user._id": userId,
      internship: internshipId,
    });
    if (!intern) {
      throw new Error(this.i18nService.translate("notFound", { ns: "intern" }));
    }

    return toInternDTO(intern);
  }

  async createIntern(
    userId: ObjectId,
    internshipId: ObjectId,
    fileUrls: string[],
    hostname: string
  ): Promise<Intern> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await this.userService.getUser(userId);
      if (!user.organization || !user.telephone || !user.studyProgramme) {
        throw new Error(
          "User has to have organization, telephone and study programme defined!"
        );
      }

      const { startDate, endDate } = getAcademicYear();

      // Count documents within the transaction
      const count = await this.internRepository.countDocuments(
        {
          "user._id": user.id,
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: Status.Rejected },
        },
        { session }
      );

      if (count >= 2) {
        throw new Error(
          this.i18nService.translate("applicationLimitReached", {
            ns: "intern",
          })
        );
      }

      // Fetch internship (ensure it exists)
      const internship = await this.internshipService.getInternship(
        internshipId
      );

      // Create the document within the transaction
      const newIntern = await this.internRepository.create(
        {
          organization: internship.organization,
          internship: internship.id,
          user: {
            _id: user.id,
            name: user.name,
            email: user.email,
            telephone: user.telephone,
            studyProgramme: user.studyProgramme,
            address: user.address,
          },
          status: Status.Applied,
          fileUrls,
        },
        { session }
      );

      await this.rmqService.produceMessage(
        JSON.stringify({
          locale: this.i18nService.language(),
          hostname,
          name: user.name,
          email: user.email,
          internshipId: internship.id,
          organization: internship.organization,
        }),
        "mail.internships.applied"
      );

      const admins = await this.userService.getPaginatedUsers({
        first: 100,
        access: [Access.Admin],
      });

      admins.edges.forEach((edge) =>
        this.rmqService.produceMessage(
          JSON.stringify({
            locale: this.i18nService.language(),
            name: edge.node.name,
            email: edge.node.email,
            internshipId: newIntern.internship,
            internId: newIntern.id,
            organization: internship.organization,
            hostname:
              process.env.NODE_ENV === "production"
                ? "flawis.flaw.uniba.sk"
                : "flawis-staging.flaw.uniba.sk",
          }),
          "mail.internships.admin"
        )
      );

      await session.commitTransaction();

      return toInternDTO(newIntern);
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async changeStatus(status: Status, id: ObjectId, hostname: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const intern = await this.internRepository.findOneAndUpdate(
        { _id: id },
        { status },
        session
      );
      if (!intern) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "intern" })
        );
      }

      await this.rmqService.produceMessage(
        JSON.stringify({
          locale: this.i18nService.language(),
          hostname,
          name: intern.user.name,
          email: intern.user.email,
          internshipId: intern.internship,
          organization: intern.organization,
        }),
        `mail.internships.${status.toLowerCase()}` as RoutingKey
      );

      await session.commitTransaction();

      return toInternDTO(intern);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateFiles(fileUrls: string[], id: ObjectId, user: User) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const intern = await this.internRepository.findOneAndUpdate(
        { _id: id },
        { fileUrls },
        session
      );
      if (!intern) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "intern" })
        );
      }
      if (
        intern.user.id.toString() !== user.id.toString() &&
        !user.access.includes(Access.Admin)
      ) {
        throw new Error("Not allowed!");
      }

      await session.commitTransaction();

      return toInternDTO(intern);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteIntern(id: ObjectId, user: User) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const intern = await this.internRepository.findOneAndDelete(
        { _id: id },
        { session }
      );
      if (!intern) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "intern" })
        );
      }
      if (
        user.access.includes(Access.Student) &&
        intern.user.id.toString() !== user.id.toString()
      ) {
        console.log(intern.user.id.toString(), user.id.toString());
        throw new Error("Not allowed!");
      }

      await this.minioService.deleteFiles(intern.fileUrls);

      await session.commitTransaction();

      return toInternDTO(intern);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateOrganizationFeedbackUrl(
    id: ObjectId,
    user: User,
    fileUrl: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const intern = await this.internRepository.findOneAndUpdate(
        { _id: id },
        { organizationFeedbackUrl: fileUrl },
        session
      );
      if (!intern) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "intern" })
        );
      }
      const internship = await this.internshipService.getInternship(
        intern.internship as ObjectId
      );
      if (
        internship.user.toString() !== user.id.toString() &&
        !user.access.includes(Access.Admin)
      ) {
        throw new Error("Not allowed!");
      }

      await session.commitTransaction();

      return toInternDTO(intern);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async notifyAdminsOfAppliedInterns() {
    const { startDate, endDate } = getAcademicYear();

    // Count intern documents with status "APPLIED" for the current academic year.
    const count = await this.internRepository.countDocuments({
      status: Status.Applied,
      createdAt: { $gte: startDate, $lte: endDate },
    });
    if (count > 0) {
      console.log("Sending notifications to FlawIS admins");
      const admins = await this.userService.getPaginatedUsers({
        first: 100,
        access: [Access.Admin],
      });

      admins.edges.forEach((edge) =>
        this.rmqService.produceMessage(
          JSON.stringify({
            locale: this.i18nService.language(),
            name: edge.node.name,
            email: edge.node.email,
            hostname:
              process.env.NODE_ENV === "production"
                ? "flawis.flaw.uniba.sk"
                : "flawis-staging.flaw.uniba.sk",
            count,
          }),
          "mail.internships.admin"
        )
      );
    }
  }

  async notifyOrgsOfEligibleInterns() {
    const internshipsWithEligibleInterns =
      await this.internRepository.internshipsWithEligibleInterns();

    for (const data of internshipsWithEligibleInterns) {
      console.log(`Sending notification to ${data.internship.organization}`);

      this.rmqService.produceMessage(
        JSON.stringify({
          locale: data.internship.language,
          name: data.user.name,
          email: data.user.email,
          organization: data.internship.organization,
          internshipId: data.internship.id,
          hostname:
            process.env.NODE_ENV === "production"
              ? "intern.flaw.uniba.sk"
              : "intern-staging.flaw.uniba.sk",
          count: data.count,
        }),
        "mail.internships.org"
      );
    }
  }
}
