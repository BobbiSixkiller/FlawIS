import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { getModelForClass } from "@typegoose/typegoose";
import {
  ClassType,
  createParamDecorator,
  ParameterDecorator,
} from "type-graphql";
// import { Conference } from "../entities/Conference";
// import { Attendee } from "../entities/Attendee";
import { Context } from "./auth";
// import { Section } from "../entities/Section";
import Container from "typedi";
import { I18nService } from "../services/i18nService";

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

// export function CheckTicket(): ParameterDecorator {
//   return createParamDecorator(async ({ args, context }) => {
//     const conference = await getModelForClass(Conference).findOne({
//       _id: args.data.conferenceId,
//     });
//     if (!conference) throw new UserInputError("Conference not found!");

//     const ticket = conference.tickets.find(
//       (t) => t.id.toString() === args.data.ticketId.toString()
//     );
//     if (!ticket) throw new UserInputError("Invalid ticket!");

//     const { user, locale } = context as Context;
//     const attendeeExists = await getModelForClass(Attendee).findOne({
//       conference: conference.id,
//       user: user?.id,
//     });
//     if (attendeeExists)
//       throw new UserInputError("You are already signed up for the conference!");

//     return {
//       ticket,
//       conference: convertDocument(conference, locale),
//     };
//   });
// }

// export function CheckConferenceSection(): ParameterDecorator {
//   return createParamDecorator(async ({ args }) => {
//     const [conference, section] = await Promise.all([
//       getModelForClass(Conference).findOne({
//         _id: args.data.conference,
//       }),
//       getModelForClass(Section).findOne({
//         _id: args.data.section,
//       }),
//     ]);
//     if (!conference) throw new UserInputError("Conference not found!");
//     if (!section) throw new UserInputError("Section not found!");

//     return { conference, section };
//   });
// }

export function LoadResource<Type extends object>(
  TypeClass: ClassType<Type>
): ParameterDecorator {
  return createParamDecorator<Context>(async ({ args }) => {
    const resource = await getModelForClass(TypeClass).findOne({
      $or: [{ _id: args.id }, { slug: args.slug }],
    });
    if (!resource)
      throw new Error(Container.get(I18nService).translate("notFound"));

    return resource;
  });
}
