import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { getModelForClass } from "@typegoose/typegoose";
import { ClassType, createParamDecorator } from "type-graphql";
import { Conference } from "../entities/Conference";
import { UserInputError } from "apollo-server";
import { Attendee } from "../entities/Attendee";
import { Context } from "./auth";
import { Section } from "../entities/Section";
import { convertDocument } from "../middlewares/typegoose-middleware";

@ValidatorConstraint({ name: "RefDoc", async: true })
class RefDocValidator implements ValidatorConstraintInterface {
  async validate(refId: string, args: ValidationArguments) {
    const modelClass = args.constraints[0];
    return await getModelForClass(modelClass).exists({ _id: refId });
  }

  defaultMessage(): string {
    return "Referenced Document not found!";
  }
}

export function RefDocExists(
  modelClass: any,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "RefDocExists",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [modelClass],
      options: validationOptions,
      validator: RefDocValidator,
    });
  };
}

export function CheckTicket(): ParameterDecorator {
  return createParamDecorator(async ({ args, context }) => {
    const conference = await getModelForClass(Conference).findOne({
      _id: args.data.conferenceId,
    });
    if (!conference) throw new UserInputError("Conference not found!");

    const ticket = conference.tickets.find(
      (t) => t.id.toString() === args.data.ticketId.toString()
    );
    if (!ticket) throw new UserInputError("Invalid ticket!");

    const { user, locale } = context as Context;
    const attendeeExists = await getModelForClass(Attendee).findOne({
      conference: conference.id,
      user: user?.id,
    });
    if (attendeeExists)
      throw new UserInputError("You are already signed up for the conference!");

    return {
      ticket,
      conference: convertDocument(conference, locale),
    };
  });
}

export function CheckConferenceSection(): ParameterDecorator {
  return createParamDecorator(async ({ args }) => {
    const [conference, section] = await Promise.all([
      getModelForClass(Conference).findOne({
        _id: args.data.conference,
      }),
      getModelForClass(Section).findOne({
        _id: args.data.section,
      }),
    ]);
    if (!conference) throw new UserInputError("Conference not found!");
    if (!section) throw new UserInputError("Section not found!");

    return { conference, section };
  });
}

export function LoadResource<TNode>(
  TNodeClass: ClassType<TNode>
): ParameterDecorator {
  return createParamDecorator(async ({ args }) => {
    const resource = await getModelForClass(TNodeClass).findOne({
      _id: args.id,
    });
    if (!resource) throw new UserInputError("Resource not found!");

    return resource;
  });
}
