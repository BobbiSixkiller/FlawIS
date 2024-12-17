import { Service } from "typedi";
import { TypegooseService } from "./typegooseService";
import { Intern, Status } from "../entitites/Internship";
import { InternArgs, InternConnection } from "../resolvers/types/internship";
import { ObjectId } from "mongodb";
import { I18nService } from "./i18nService";
import { User } from "../util/types";
import { InternshipService } from "./internshipService";
import { name } from "@azure/msal-node/dist/packageMetadata";

@Service()
export class InternService {
  constructor(
    private readonly crudService = new TypegooseService(Intern),
    private readonly internshipService: InternshipService,
    private readonly i18nService: I18nService
  ) {}

  private getAcademicYearInterval(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Academic year starts in September
    const startYear = month >= 8 ? year : year - 1;
    const endYear = startYear + 1;

    const startDate = new Date(`${startYear}-09-01T00:00:00Z`);
    const endDate = new Date(`${endYear}-06-30T23:59:59Z`);

    return { startYear, endYear, startDate, endDate };
  }

  async getInterns(args: InternArgs): Promise<InternConnection> {
    try {
      const data = await this.crudService.dataModel.paginatedInterns(args);
      return data[0] as InternConnection;
    } catch (error: any) {
      throw new Error(`Error fetching interns: ${error.message}`);
    }
  }

  async getIntern(id: ObjectId) {
    try {
      const intern = await this.crudService.findOne({ _id: id });
      if (!intern) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "intern" })
        );
      }

      return intern;
    } catch (error: any) {
      throw new Error(`Error fetching interns: ${error.message}`);
    }
  }

  async createIntern(user: User, internshipID: ObjectId) {
    const session = await this.crudService.dataModel.startSession();
    session.startTransaction();

    try {
      const { startDate, endDate } = this.getAcademicYearInterval();

      // Count documents within the transaction
      const count = await this.crudService.dataModel
        .countDocuments({
          "user._id": user.id,
          createdAt: { $gte: startDate, $lte: endDate },
          status: Status.Applied,
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
        internshipID
      );

      // Create the document within the transaction
      const newIntern = await this.crudService.dataModel.create(
        [
          {
            internship: internship.id,
            user: { _id: user.id, name: user.name },
            status: Status.Applied,
            createdAt: new Date(),
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();
      return newIntern;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async changeStatus(status: Status, id: ObjectId) {
    const intern = await this.getIntern(id);

    intern.status = status;

    return await intern.save();
  }

  async updateFiles(files: string[], id: ObjectId) {
    const intern = await this.getIntern(id);

    intern.files = files;

    return await intern.save();
  }

  async deleteIntern(id: ObjectId) {
    return await this.crudService.delete({ _id: id });
  }
}
