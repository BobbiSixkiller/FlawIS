import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { ObjectId } from "mongodb";
import { UserInputError } from "apollo-server";
import { Service } from "typedi";
import fs from "fs";
import { CRUDservice } from "../services/CRUDservice";

import { User } from "../entitites/User";
import { Grant } from "../entitites/Grant";

import { Context } from "../util/auth";
import { sendMail } from "../util/mail";

import env from "dotenv";

env.config();

@Service()
@Resolver(() => Grant)
export class GrantResolver {
  constructor(
    private readonly grantService = new CRUDservice(Grant),
    private readonly userService = new CRUDservice(User)
  ) {}

  async grants() {}

  async grant() {}

  async createGrant() {}

  async updategrant() {}

  async deleteGrant() {}
}
