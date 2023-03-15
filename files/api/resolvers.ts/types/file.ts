import { Stream } from "stream";
import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { File } from "../../entities/File";
import { CreateConnection, CreatePaginationArgs } from "./pagination";

export interface Upload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}

export enum FileType {
  IMAGE = "images",
  SUBMISSION = "submissions",
  GRANT = "grants",
}

registerEnumType(FileType, {
  name: "FileType", // this one is mandatory
  description: "Supported file types for upload mutation", // this one is optional
});

@ObjectType({ description: "Cursor based pagination return object type" })
export class FileConnection extends CreateConnection(File) {}

@ArgsType()
export class FileArgs extends CreatePaginationArgs(File) {}
