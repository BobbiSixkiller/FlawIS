import { ObjectId } from "mongodb";
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { GraphQLUpload } from "graphql-upload";
import { FileArgs, FileConnection, FileType, Upload } from "./types/file";
import { createWriteStream, unlink } from "fs";
import * as path from "path";
import { v4 as uuid } from "uuid";
import { UserInputError } from "apollo-server-core";
import { File } from "../entities/File";
import { CRUDservice } from "../services/CRUDservice";
import { Service } from "typedi";
import { Context } from "../util/auth";
import { LoadResource } from "../util/decorators";
import { DocumentType } from "@typegoose/typegoose";

@Service()
@Resolver()
export class FileResolver {
  constructor(private readonly fileService = new CRUDservice(File)) {}

  @Authorized(["ADMIN"])
  @Query(() => FileConnection)
  async files(@Args() { first, after }: FileArgs) {
    const data = await this.fileService.dataModel.paginatedFiles(first, after);

    return data[0];
  }

  @Authorized()
  @Mutation(() => File)
  async uploadFile(
    @Arg("file", () => GraphQLUpload)
    { createReadStream, filename, mimetype }: Upload,
    @Arg("type", () => FileType) filetype: FileType,
    @Ctx() { user }: Context
  ) {
    if (
      mimetype != "application/pdf" &&
      mimetype !=
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      mimetype !== "image/jpeg" &&
      mimetype !== "image/png"
    ) {
      throw new UserInputError(
        "Supported file types: PDF, Word, image/jpeg, image/png"
      );
    }

    const filepath =
      "/public/" +
      filetype +
      "/" +
      uuid() +
      "-" +
      filename.toLowerCase().split(" ").join("-");

    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(createWriteStream(path.join(process.cwd(), filepath)))
        .on("finish", async () => {
          const file = await this.fileService.create({
            name: filename,
            type: filetype,
            path: filepath,
            user,
          });
          resolve(file);
        })
        .on("error", () => reject(new Error("File upload failed!")))
    );
  }

  //implement RMQ messaging in order to keep integrity amongst mongo documents that have referenced file document
  @Authorized(["ADMIN"])
  @Mutation(() => File)
  async deleteFile(
    @Arg("id") _id: ObjectId,
    @LoadResource(File) file: DocumentType<File>
  ) {
    return new Promise((resolve, reject) => {
      unlink(path.join(process.cwd(), file.path), async (error) => {
        if (error) reject(error);
        await file.remove();
        resolve(file);
      });
    });
  }
}
