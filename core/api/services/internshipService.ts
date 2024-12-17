import { Service } from "typedi";
import { Internship } from "../entitites/Internship";
import { ObjectId } from "mongodb";
import { TypegooseService } from "./typegooseService";
import {
  InternshipArgs,
  InternshipConnection,
  InternshipInput,
} from "../resolvers/types/internship";
import { I18nService } from "./i18nService";
import { User } from "../util/types";
import { UserService } from "./userService";

@Service()
export class InternshipService {
  constructor(
    private readonly crudService = new TypegooseService(Internship),
    private readonly i18nService: I18nService,
    private readonly userService: UserService
  ) {}

  async getInternships(args: InternshipArgs): Promise<InternshipConnection> {
    try {
      const data = await this.crudService.dataModel.paginatedInternships(args);
      return data[0];
    } catch (error: any) {
      throw new Error(`Error fetching internships: ${error.message}`);
    }
  }

  async getInternship(id: ObjectId) {
    try {
      const internship = await this.crudService.findOne({ _id: id });
      if (!internship) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "internship" })
        );
      }

      return internship;
    } catch (error: any) {
      throw new Error(`Error fetching internship: ${error.message}`);
    }
  }

  async createInternship(data: InternshipInput, ctxUser: User) {
    const user = await this.userService.getUser(ctxUser.id);
    if (!user.organization) {
      throw new Error("User has to have organization defined!");
    }

    return await this.crudService.create({
      ...data,
      organization: user.organization,
      user: {
        name: user?.name,
        _id: user?.id,
      },
    });
  }

  async updateInternship(data: InternshipInput, id: ObjectId) {
    const internship = await this.getInternship(id);

    for (const [key, value] of Object.entries(data)) {
      internship[key as keyof InternshipInput] = value;
    }

    return await internship.save();
  }

  async deleteInternship(id: ObjectId) {
    return await this.crudService.delete({ _id: id });
  }
}
