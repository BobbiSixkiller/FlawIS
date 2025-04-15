import { Course } from "../../entitites/Course";
import { CreateArgs, CreateConnection } from "./pagination";

export class CourseArgs extends CreateArgs(Course) {}

export class CourseConnection extends CreateConnection(Course) {}
