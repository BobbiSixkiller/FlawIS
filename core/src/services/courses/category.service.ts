import { ObjectId } from "mongodb";
import { Category } from "../../entitites/Course";
import { Service } from "typedi";
import { Repository } from "../../repositories/base.repository";
import { toDTO } from "../../util/helpers";
import { I18nService } from "../i18n.service";

@Service()
export class CategoryService {
  constructor(
    private readonly categoryRepository = new Repository(Category),
    private readonly i18nService: I18nService,
  ) {}

  async getCategories(categoryIds: ObjectId[]) {
    return await this.categoryRepository.findAll({ _id: categoryIds });
  }

  async searchCategories(search?: string) {
    const filter = search ? { name: { $regex: search, $options: "i" } } : {};
    const categories = await this.categoryRepository.findAll(filter);
    return categories.map(toDTO);
  }

  async createCategory(name: string) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const category = await this.categoryRepository.create({ name, slug });
    return toDTO(category);
  }

  async updateCategory(id: ObjectId, name: string) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const updated = await this.categoryRepository.findOneAndUpdate(
      { _id: id },
      { $set: { name, slug } },
      { new: true },
    );
    if (!updated) {
      throw new Error("Category not found!");
    }
    return toDTO(updated);
  }

  async deleteCategory(id: ObjectId) {
    const deleted = await this.categoryRepository.findOneAndDelete({ _id: id });
    if (!deleted) {
      throw new Error("Category not found!");
    }
    return toDTO(deleted);
  }
}
