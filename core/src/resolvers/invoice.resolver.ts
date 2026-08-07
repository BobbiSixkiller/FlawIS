import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";
import { ObjectId } from "mongodb";
import { Service } from "typedi";

import { Invoice } from "../entitites/Invoice";
import { InvoiceService } from "../services/invoice.service";
import { Context } from "../util/auth";
import { InvoiceOwnerType } from "./types/attendee.types";

@Service()
@Resolver()
export class InvoiceResolver {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Authorized()
  @Query(() => Invoice, { nullable: true })
  async invoice(
    @Arg("ownerType", () => InvoiceOwnerType)
    ownerType: InvoiceOwnerType,
    @Arg("attendeeId") attendeeId: ObjectId,
    @Ctx() { user }: Context,
  ): Promise<Invoice | null> {
    return this.invoiceService.getAuthorizedInvoice(
      ownerType,
      attendeeId,
      user!,
    );
  }
}
