import { ObjectId } from "mongodb";
import { DocumentType } from "@typegoose/typegoose";

import { CourseArgs, CourseInput } from "../resolvers/types/course.types";
import { Course, CourseTerm } from "../entitites/Course";
import { I18nService } from "./i18n.service";
import mongoose from "mongoose";
import { Service } from "typedi";
import { CourseRepository } from "../repositories/course.repository";
import { Repository } from "../repositories/base.repository";
import { CourseAttendeeRepository } from "../repositories/courseTermAttendee.repository";

function toCourseDTO(doc: DocumentType<Course>) {
  const obj = doc.toJSON({
    versionKey: false,
    virtuals: false,
    transform(_doc, ret) {
      if (ret._id) {
        ret.id = ret._id;
        delete ret._id;
      }

      return ret;
    },
  });

  return obj as Course;
}

@Service()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly termRepository = new Repository(CourseTerm),
    private readonly courseAttendeeRepository: CourseAttendeeRepository,
    private readonly i18nService: I18nService
  ) {}

  async getCourse(id: ObjectId) {
    const course = await this.courseRepository.findOne({ _id: id });
    if (!course) {
      throw new Error(this.i18nService.translate("notFound", { ns: "course" }));
    }

    return toCourseDTO(course);
  }

  async getPaginatedCourses(args: CourseArgs) {
    return await this.courseRepository.paginatedCourses(args);
  }

  async createCourse(data: CourseInput) {
    const course = await this.courseRepository.create(data);

    return toCourseDTO(course);
  }

  async updateCourse(id: ObjectId, data: CourseInput) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const updated = await this.courseRepository.findOneAndUpdate(
        { _id: id },
        data,
        session
      );
      if (!updated) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "course" })
        );
      }

      await session.commitTransaction();

      return toCourseDTO(updated);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteCourse(id: ObjectId) {
    const deleted = await this.courseRepository.findOneAndDelete({ _id: id });
    if (!deleted) {
      throw new Error(this.i18nService.translate("notFound", { ns: "course" }));
    }

    return toCourseDTO(deleted);
  }

  async createModule() {}

  async updateModule() {}

  async deleteModule() {}

  async createTerm() {}

  async updateTerm() {}

  async deleteTerm() {}
}
