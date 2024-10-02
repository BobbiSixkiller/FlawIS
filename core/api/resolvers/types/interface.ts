import { Field, InterfaceType } from "type-graphql";

@InterfaceType()
export abstract class IMutationResponse {
  @Field((type) => String)
  message: string;
}
