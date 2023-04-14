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
  @Mutation(() => String)
  async uploadFile(
    @Arg("file", () => GraphQLUpload)
    { createReadStream, filename, mimetype }: Upload,
    @Arg("type", () => FileType) filetype: FileType,
    @Ctx() { user }: Context
  ): Promise<string> {
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

    const url =
      filetype +
      "/" +
      uuid() +
      "-" +
      filename.toLowerCase().split(" ").join("-");

    const file = await this.fileService.create({
      name: filename,
      type: filetype,
      user,
      url: `${"https://flawis-backend.flaw.uniba.sk" + "public/" + url}`,
    });

    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(createWriteStream(path.join(process.cwd(), "/public", url)))
        .on("finish", () =>
          resolve(`${"https://flawis-backend.flaw.uniba.sk" + "public/" + url}`)
        )
        .on("error", () => reject(new Error("File upload failed!")))
    );
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteFile(@Arg("url") url: string) {
    const path =
      "." + url.split(process.env.BASE_URL || "http://localhost:5000")[1];

    return new Promise((resolve, reject) => {
      unlink(path, (error) => {
        if (error) reject(error);
        resolve(true);
      });
    });
  }
}
