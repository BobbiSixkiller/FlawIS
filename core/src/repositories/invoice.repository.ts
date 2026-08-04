import {
  DocumentType,
  getModelForClass,
  ReturnModelType,
} from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { ClientSession } from "mongoose";
import { Service } from "typedi";

import { Invoice, InvoiceCounter } from "../entitites/Invoice";
import { InvoiceOwnerType } from "../resolvers/types/attendee.types";

export interface CreateStoredInvoice extends Invoice {
  attendeeId: ObjectId;
  ownerType: InvoiceOwnerType;
  userId: ObjectId;
}

export function isDuplicateInvoiceNumberError(error: unknown) {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    error.code !== 11000
  ) {
    return false;
  }

  const keyPattern = "keyPattern" in error ? error.keyPattern : undefined;
  if (
    typeof keyPattern === "object" &&
    keyPattern !== null &&
    "issuer.variableSymbol" in keyPattern
  ) {
    return true;
  }

  return (
    error instanceof Error && error.message.includes("issuer.variableSymbol")
  );
}

@Service()
export class InvoiceRepository {
  private readonly model: ReturnModelType<typeof Invoice>;
  private readonly counterModel: ReturnModelType<typeof InvoiceCounter>;

  constructor() {
    this.model = getModelForClass(Invoice);
    this.counterModel = getModelForClass(InvoiceCounter);
  }

  private async ensureIndexes() {
    await Promise.all([this.model.init(), this.counterModel.init()]);
  }

  private async ensureCounter(prefix: string, minimumSequence: number) {
    await this.ensureIndexes();

    try {
      await this.counterModel.updateOne(
        { prefix },
        { $setOnInsert: { prefix, sequence: minimumSequence } },
        { upsert: true },
      );
    } catch (error) {
      if (
        typeof error !== "object" ||
        error === null ||
        !("code" in error) ||
        error.code !== 11000
      ) {
        throw error;
      }
      // Another allocator inserted this prefix after our upsert query.
    }
  }

  async create(
    data: CreateStoredInvoice,
    session?: ClientSession,
  ): Promise<DocumentType<Invoice>> {
    await this.ensureIndexes();
    const invoice = new this.model(data);
    return invoice.save({ session });
  }

  async reserveNextSequence(
    prefix: string,
    minimumSequence: number,
    session?: ClientSession,
  ): Promise<number> {
    await this.ensureCounter(prefix, minimumSequence);
    await this.counterModel.updateOne(
      { prefix },
      { $max: { sequence: minimumSequence } },
      { session },
    );
    const counter = await this.counterModel.findOneAndUpdate(
      { prefix },
      { $inc: { sequence: 1 } },
      { new: true, session },
    );
    if (!counter) {
      throw new Error(`Invoice counter for prefix ${prefix} was not found.`);
    }
    return counter.sequence;
  }

  async findByOwner(
    ownerType: InvoiceOwnerType,
    attendeeId: ObjectId,
  ): Promise<DocumentType<Invoice> | null> {
    return this.model.findOne({ ownerType, attendeeId });
  }

  async findVariableSymbols(prefix: string): Promise<string[]> {
    const records = await this.model
      .find({ "issuer.variableSymbol": new RegExp(`^${prefix}\\d+$`) })
      .select({ "issuer.variableSymbol": 1 })
      .lean();

    return records.flatMap((record) =>
      record.issuer.variableSymbol ? [record.issuer.variableSymbol] : [],
    );
  }

  async updateByOwner(
    ownerType: InvoiceOwnerType,
    attendeeId: ObjectId,
    invoice: Invoice,
  ): Promise<DocumentType<Invoice> | null> {
    return this.model.findOneAndUpdate(
      { ownerType, attendeeId },
      {
        $set: {
          body: invoice.body,
          issuer: invoice.issuer,
          payer: invoice.payer,
        },
      },
      { new: true, runValidators: true },
    );
  }
}
