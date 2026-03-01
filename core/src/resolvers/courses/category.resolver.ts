import { ObjectId } from "mongodb";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Service } from "typedi";
import { Category } from "../../entitites/Course";
import { CategoryService } from "../../services/courses/category.service";
import { I18nService } from "../../services/i18n.service";
import {
  CategoryInput,
  CategoryMutationResponse,
} from "../types/course/course.types";

@Service()
@Resolver(() => Category)
export class CategoryResolver {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly i18nService: I18nService,
  ) {}

  @Query(() => [Category])
  async categories(
    @Arg("search", { nullable: true }) search?: string,
  ): Promise<Category[]> {
    return await this.categoryService.searchCategories(search);
  }

  @Mutation(() => CategoryMutationResponse)
  async createCategory(
    @Arg("data") data: CategoryInput,
  ): Promise<CategoryMutationResponse> {
    const category = await this.categoryService.createCategory(data.name);
    return {
      data: category,
      message: this.i18nService.translate("new", {
        ns: "course",
        name: category.name,
      }),
    };
  }

  @Mutation(() => CategoryMutationResponse)
  async updateCategory(
    @Arg("id") id: ObjectId,
    @Arg("data") data: CategoryInput,
  ): Promise<CategoryMutationResponse> {
    const category = await this.categoryService.updateCategory(id, data.name);
    return {
      data: category,
      message: this.i18nService.translate("update", {
        ns: "course",
        name: category.name,
      }),
    };
  }

  @Mutation(() => CategoryMutationResponse)
  async deleteCategory(
    @Arg("id") id: ObjectId,
  ): Promise<CategoryMutationResponse> {
    const category = await this.categoryService.deleteCategory(id);
    return {
      data: category,
      message: this.i18nService.translate("delete", {
        ns: "course",
        name: category.name,
      }),
    };
  }
}
