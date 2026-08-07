import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { getModelForClass } from "@typegoose/typegoose";

export function RefDocExists(
  modelClass: any,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "RefDocExists",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [modelClass],
      options: validationOptions,
      validator: {
        async validate(refId: string, args: ValidationArguments) {
          const modelClass = args.constraints[0];
          return await getModelForClass(modelClass).exists({ _id: refId });
        },

        defaultMessage(): string {
          return "Referenced Document not found!";
        },
      },
    });
  };
}

export function IsAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isAfter",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          if (!(value instanceof Date) || !(relatedValue instanceof Date)) {
            return false;
          }
          return value > relatedValue;
        },

        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must be after ${relatedPropertyName}`;
        },
      },
    });
  };
}

export function IsBefore(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isBefore",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          if (!(value instanceof Date) || !(relatedValue instanceof Date)) {
            return false;
          }
          return value < relatedValue;
        },

        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must be before ${relatedPropertyName}`;
        },
      },
    });
  };
}

export function UniqueFieldNames(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "UniqueFieldNames",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (!Array.isArray(value)) return false;

          const names = value
            .map((f) => (typeof f?.name === "string" ? f.name.trim() : ""))
            .filter(Boolean);

          const lower = names.map((n) => n.toLowerCase());
          return new Set(lower).size === lower.length;
        },
      },
    });
  };
}
