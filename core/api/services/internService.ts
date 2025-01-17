import { Service } from "typedi";
import { TypegooseService } from "./typegooseService";
import { Intern, Status } from "../entitites/Internship";
import { InternArgs, InternConnection } from "../resolvers/types/internship";
import { ObjectId } from "mongodb";
import { I18nService } from "./i18nService";
import { User } from "../util/types";
import { InternshipService } from "./internshipService";
import { getAcademicYearInterval } from "../util/helpers";
import { Access } from "../entitites/User";
import { UserService } from "./userService";
import { transformIds } from "../middlewares/typegoose-middleware";

@Service()
export class InternService {
  constructor(
    private readonly crudService = new TypegooseService(Intern),
    private readonly internshipService: InternshipService,
    private readonly userService: UserService,
    private readonly i18nService: I18nService
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
    files: string[]
  ): Promise<Intern> {
    const session = await this.crudService.dataModel.startSession();
    session.startTransaction();

    try {
      const user = await this.userService.getUser(userId);

      const { startDate, endDate } = getAcademicYearInterval();

      // Count documents within the transaction
      const count = await this.crudService.dataModel
        .countDocuments({
          "user._id": user.id,
          createdAt: { $gte: startDate, $lte: endDate },
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
            files,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();
      return newIntern[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async changeStatus(status: Status, id: ObjectId, user: User) {
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
      return intern;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async updateFiles(files: string[], id: ObjectId, user: User) {
    const session = await this.crudService.dataModel.startSession();
    session.startTransaction();

    try {
      const intern = await this.crudService.findOneAndUpdate(
        { _id: id },
        { files },
        session
      );
      if (!intern) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "intern" })
        );
      }
      if (intern.user.id.toString() !== user.id.toString()) {
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

      await session.commitTransaction();
      session.endSession();
      return intern;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
