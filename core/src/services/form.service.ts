import { Service } from "typedi";
import { Form } from "../entitites/Form";
import { Repository } from "../repositories/base.repository";
import { ObjectId } from "mongodb";
import { FormInput } from "../resolvers/types/form/form.types";
import { toDTO } from "../util/helpers";

@Service()
export class FormService {
  constructor(private readonly formRepository = new Repository(Form)) {}

  async getForm(id: ObjectId) {
    const form = await this.formRepository.findOne({ _id: id });
    if (!form) {
      throw new Error("Form not found!");
    }

    return toDTO(form);
  }

  async geCourseForms(courseId: ObjectId) {
    const forms = await this.formRepository.findAll(
      { course: courseId },
      null,
      {
        sort: { version: -1 },
      },
    );

    return forms.map((f) => toDTO(f));
  }

  async createForm(data: FormInput) {
    const form = await this.formRepository.create(data);
    return toDTO(form);
  }

  async updateForm(id: ObjectId, data: FormInput) {
    const form = await this.formRepository.findOneAndUpdate(
      { _id: id },
      { $set: data },
    );
    if (!form) {
      throw new Error("Form not found!");
    }

    return toDTO(form);
  }

  async deleteForm(id: ObjectId) {
    const form = await this.formRepository.findOneAndDelete({ _id: id });
    if (!form) {
      throw new Error("Form not found!");
    }

    return toDTO(form);
  }
}
