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
import { Context } from "./auth";
import Container from "typedi";
import { I18nService } from "../services/i18nService";
import { Conference } from "../entitites/Conference";
import { Attendee } from "../entitites/Attendee";

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
  return createParamDecorator<Context>(async ({ args, context }) => {
    const conference = await getModelForClass(Conference).findOne({
      _id: args.data.conferenceId,
    });
    if (!conference)
      throw new Error(
        Container.get(I18nService).translate("notFound", {
          ns: "conference",
        })
      );

    const ticket = conference.tickets.find(
      (t) => t.id.toString() === args.data.ticketId.toString()
    );
    if (!ticket)
      throw new Error(
        Container.get(I18nService).translate("notFound", {
          ns: "ticket",
        })
      );

    const { user } = context;
    const attendeeExists = await getModelForClass(Attendee).findOne({
      "conference._id": conference.id,
      "user._id": user?.id,
    });
    if (attendeeExists)
      throw new Error(
        Container.get(I18nService).translate("alreadyRegistered", {
          ns: "conference",
          name: user?.name,
          conference:
            conference.translations[context.locale as "sk" | "en"].name,
        })
      );

    return {
      ticket,
      conference,
    };
  });
}

export function LoadResource<Type extends object>(
  TypeClass: ClassType<Type>
): ParameterDecorator {
  return createParamDecorator<Context>(async ({ args }) => {
    const filter = args.id ? { _id: args.id } : { slug: args.slug };

    const resource = await getModelForClass(TypeClass).findOne(filter);
    if (!resource)
      throw new Error(
        Container.get(I18nService).translate("notFound", {
          ns: TypeClass.name.toLowerCase(),
        })
      );

    return resource;
  });
}
