import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { getModelForClass } from "@typegoose/typegoose";
import { createParamDecorator } from "type-graphql";
import { Conference } from "../entitites/Conference";
import { UserInputError } from "apollo-server";
import { Attendee } from "../entitites/Attendee";
import { Context } from "./auth";
import { Section } from "../entitites/Section";

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

    const { user } = context as Context;
    const attendeeExists = await getModelForClass(Attendee).findOne({
      conference: conference.id,
      user: user?.id,
    });
    if (attendeeExists)
      throw new UserInputError("You are already signed up for the conference!");

    return { ticket, conference };
  });
}

export function CheckConferenceSection(): ParameterDecorator {
  return createParamDecorator(async ({ args }) => {
    const [conference, section] = await Promise.all([
      getModelForClass(Conference).findOne({
        _id: args.data.conferenceId,
      }),
      getModelForClass(Section).findOne({
        _id: args.data.sectionId,
      }),
    ]);
    if (!conference) throw new UserInputError("Conference not found!");
    if (!section) throw new UserInputError("Section not found!");

    return { conference, section };
  });
}
