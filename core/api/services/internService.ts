import { Service } from "typedi";
import { TypegooseService } from "./typegooseService";
import { Intern, Internship, Status } from "../entitites/Internship";
import { InternArgs, InternConnection } from "../resolvers/types/internship";
import { ObjectId } from "mongodb";
import { I18nService } from "./i18nService";
import { User } from "../util/types";
import { InternshipService } from "./internshipService";
import { getAcademicYear } from "../util/helpers";
import { Access } from "../entitites/User";
import { UserService } from "./userService";
import { transformIds } from "../middlewares/typegoose-middleware";
import { RmqService, RoutingKey } from "./rmqService";
import { MinioService } from "./minioService";
import { name } from "@azure/msal-node/dist/packageMetadata";

@Service()
export class InternService {
  constructor(
    private readonly crudService = new TypegooseService(Intern),
    private readonly internshipService: InternshipService,
    private readonly userService: UserService,
    private readonly i18nService: I18nService,
    private readonly rmqService: RmqService,
    private readonly minioService: MinioService
  ) {}

  async getInterns(args: InternArgs): Promise<InternConnection> {
    try {
      const data = await this.crudService.dataModel.paginatedInterns(args);
      const connection = data[0] as InternConnection;

      return {
        ...connection,
        edges: connection.edges.map((edge) => ({
          cursor: edge.cursor,
          node: transformIds(edge.node),
        })),
      };
    } catch (error: any) {
      throw new Error(`Error fetching interns: ${error.message}`);
    }
  }

  async getById(id: ObjectId) {
    const intern = await this.crudService.findOne({ _id: id });
    if (!intern) {
      throw new Error(this.i18nService.translate("notFound", { ns: "intern" }));
    }

    return intern;
  }

  async getByUserInternship(userId: ObjectId, internshipId: ObjectId) {
    const intern = await this.crudService.findOne({
      "user._id": userId,
      internship: internshipId,
    });
    if (!intern) {
      throw new Error(this.i18nService.translate("notFound", { ns: "intern" }));
    }

    return intern;
  }

  async createIntern(
    userId: ObjectId,
    internshipId: ObjectId,
    fileUrls: string[],
    hostname: string
  ): Promise<Intern> {
    const session = await this.crudService.dataModel.startSession();
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
      const count = await this.crudService.dataModel
        .countDocuments({
          "user._id": user.id,
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: Status.Rejected },
        })
        .session(session);

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
      const newIntern = await this.crudService.dataModel.create(
        [
          {
            organization: internship.organization,
            internship: internship.id,
            user: {
              _id: user.id,
              name: user.name,
              email: user.email,
              telephone: user.telephone,
              studyProgramme: user.studyProgramme,
              avatarUrl: user.avatarUrl,
            },
            status: Status.Applied,
            fileUrls,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

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
            internshipId: newIntern[0].internship,
            internId: newIntern[0].id,
            organization: internship.organization,
            hostname:
              process.env.NODE_ENV === "production"
                ? "flawis.flaw.uniba.sk"
                : "flawis-staging.flaw.uniba.sk",
          }),
          "mail.internships.admin"
        )
      );

      return newIntern[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async changeStatus(status: Status, id: ObjectId, hostname: string) {
    const session = await this.crudService.dataModel.startSession();
    session.startTransaction();

    try {
      const intern = await this.crudService.findOneAndUpdate(
        { _id: id },
        { status },
        session
      );
      if (!intern) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "intern" })
        );
      }

      await session.commitTransaction();
      session.endSession();

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

      return intern;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async updateFiles(fileUrls: string[], id: ObjectId, user: User) {
    const session = await this.crudService.dataModel.startSession();
    session.startTransaction();

    try {
      const intern = await this.crudService.findOneAndUpdate(
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
      session.endSession();
      return intern;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async deleteIntern(id: ObjectId, user: User) {
    const session = await this.crudService.dataModel.startSession();
    session.startTransaction();

    try {
      const intern = await this.crudService.findOneAndDelete(
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
      session.endSession();
      return intern;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async updateOrganizationFeedbackUrl(
    id: ObjectId,
    user: User,
    fileUrl: string
  ) {
    const session = await this.crudService.dataModel.startSession();
    session.startTransaction();

    try {
      const intern = await this.crudService.findOneAndUpdate(
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
      session.endSession();
      return intern;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async notifyAdminsOfAppliedInterns() {
    const { startDate, endDate } = getAcademicYear();

    // Count intern documents with status "APPLIED" for the current academic year.
    const count = await this.crudService.dataModel.countDocuments({
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
    const { startDate, endDate } = getAcademicYear();

    const internshipsWithEligibleInterns = await this.crudService.aggregate<{
      count: number;
      internship: Internship;
      user: User;
    }>([
      {
        $match: {
          status: Status.Eligible,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$internship",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "internships",
          localField: "_id",
          foreignField: "_id",
          as: "internship",
        },
      },
      {
        $unwind: {
          path: "$internship",
          preserveNullAndEmptyArrays: false,
        },
      },
      { $addFields: { "internship.id": "$internship._id" } },
      {
        $lookup: {
          from: "users",
          localField: "internship.user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      },
    ]);

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
