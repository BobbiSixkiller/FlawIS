import { DocumentType } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { ClientSession } from "mongoose";
import { Service } from "typedi";

import { Invoice } from "../entitites/Invoice";
import {
  Billing,
  getInvoiceVariableSymbolPrefix,
} from "../entitites/Billing";
import { Access } from "../entitites/User";
import { AttendeeRepository } from "../repositories/conferenceAttendee.repository";
import { CourseAttendeeRepository } from "../repositories/courseAttendee.repository";
import {
  InvoiceRepository,
  isDuplicateInvoiceNumberError,
} from "../repositories/invoice.repository";
import { InvoiceOwnerType } from "../resolvers/types/attendee.types";
import { CtxUser } from "../util/types";

const VARIABLE_SYMBOL_MAX_LENGTH = 10;
const MINIMUM_SEQUENCE_DIGITS = 4;

export interface CreateInvoiceData {
  attendeeId: ObjectId;
  body: string;
  comment: string;
  grossPriceCents: number;
  issuedAt?: Date;
  issuer: Billing;
  ownerType: InvoiceOwnerType;
  payer: Billing;
  payerEmail: string;
  session?: ClientSession;
  type: string;
  userId: ObjectId;
}

@Service()
export class InvoiceService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly attendeeRepository: AttendeeRepository,
    private readonly courseAttendeeRepository: CourseAttendeeRepository,
  ) {}

  async createInvoice({
    attendeeId,
    body,
    comment,
    grossPriceCents,
    issuedAt = new Date(),
    issuer,
    ownerType,
    payer,
    payerEmail,
    session,
    type,
    userId,
  }: CreateInvoiceData): Promise<DocumentType<Invoice>> {
    if (!Number.isInteger(grossPriceCents) || grossPriceCents < 0) {
      throw new Error(
        "Invoice gross price must be a non-negative cent value.",
      );
    }

    const vatRate = Number(process.env.VAT || 1.23);
    if (!Number.isFinite(vatRate) || vatRate <= 0) {
      throw new Error("VAT must be configured as a positive number.");
    }

    const issueDate = new Date(issuedAt);
    if (Number.isNaN(issueDate.getTime())) {
      throw new Error("Invoice issue date is invalid.");
    }

    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 15);

    const netPriceCents = Math.round(grossPriceCents / vatRate);
    const emailDomain = payerEmail.slice(payerEmail.lastIndexOf("@") + 1);
    const isVatExempt = emailDomain.toLowerCase() === "flaw.uniba.sk";
    const vatCents = isVatExempt ? 0 : grossPriceCents - netPriceCents;
    const invoiceBody = {
      body,
      comment,
      type,
      issueDate,
      vatDate: new Date(issueDate),
      dueDate,
      price: netPriceCents / 100,
      vat: vatCents / 100,
    };

    const prefix = getInvoiceVariableSymbolPrefix(issuer);
    let minimumSequence = await this.maximumSequence(prefix);

    while (true) {
      const sequence = await this.invoiceRepository.reserveNextSequence(
        prefix,
        minimumSequence,
        session,
      );
      const variableSymbol = this.formatVariableSymbol(prefix, sequence);
      if (await this.legacyVariableSymbolExists(variableSymbol)) {
        minimumSequence = sequence;
        continue;
      }

      try {
        return await this.invoiceRepository.create(
          {
            attendeeId,
            body: invoiceBody,
            issuer: { ...issuer, variableSymbol },
            ownerType,
            payer,
            userId,
          },
          session,
        );
      } catch (error) {
        if (session || !isDuplicateInvoiceNumberError(error)) throw error;
        minimumSequence = sequence;
      }
    }
  }

  async getAuthorizedInvoice(
    ownerType: InvoiceOwnerType,
    attendeeId: ObjectId,
    user: CtxUser,
  ): Promise<Invoice | null> {
    const storedInvoice = await this.invoiceRepository.findByOwner(
      ownerType,
      attendeeId,
    );
    if (storedInvoice) {
      if (!storedInvoice.userId) {
        throw new Error("Stored invoice owner is missing.");
      }
      const isAdmin = user.access.includes(Access.Admin);
      const isOwner = storedInvoice.userId.toString() === user.id.toString();
      if (!isAdmin && !isOwner) {
        throw new Error("You are not authorized to access this invoice.");
      }
      return this.toInvoice(storedInvoice);
    }

    const attendee = await this.findLegacyAttendee(ownerType, attendeeId);
    if (!attendee) return null;

    const isAdmin = user.access.includes(Access.Admin);
    const isOwner = attendee.user.id.toString() === user.id.toString();
    if (!isAdmin && !isOwner) {
      throw new Error("You are not authorized to access this invoice.");
    }

    return attendee.invoice ?? null;
  }

  async getInvoice(
    ownerType: InvoiceOwnerType,
    attendeeId: ObjectId,
    legacyInvoice?: Invoice,
  ): Promise<Invoice | null> {
    const storedInvoice = await this.invoiceRepository.findByOwner(
      ownerType,
      attendeeId,
    );
    return storedInvoice
      ? this.toInvoice(storedInvoice)
      : legacyInvoice ?? null;
  }

  async updateInvoice(
    ownerType: InvoiceOwnerType,
    attendeeId: ObjectId,
    replacement: Invoice,
    legacyInvoice?: Invoice,
  ): Promise<{ invoice: Invoice; stored: boolean }> {
    const storedInvoice = await this.invoiceRepository.findByOwner(
      ownerType,
      attendeeId,
    );
    const current = storedInvoice
      ? this.toInvoice(storedInvoice)
      : legacyInvoice;
    if (!current) throw new Error("Invoice not found.");

    this.validateInvoiceUpdate(current, replacement);
    if (!storedInvoice) return { invoice: replacement, stored: false };

    const updated = await this.invoiceRepository.updateByOwner(
      ownerType,
      attendeeId,
      replacement,
    );
    if (!updated) throw new Error("Invoice not found.");

    return { invoice: this.toInvoice(updated), stored: true };
  }

  validateInvoiceUpdate(current: Invoice, replacement: Invoice) {
    if (current.issuer.variableSymbol !== replacement.issuer.variableSymbol) {
      throw new Error("An issued invoice number cannot be changed.");
    }
  }

  toInvoice(
    record: Pick<Invoice, "body" | "issuer" | "payer">,
  ): Invoice {
    return {
      body: record.body,
      issuer: record.issuer,
      payer: record.payer,
    };
  }

  private formatVariableSymbol(prefix: string, sequence: number) {
    const suffix = String(sequence).padStart(MINIMUM_SEQUENCE_DIGITS, "0");
    const variableSymbol = `${prefix}${suffix}`;
    if (variableSymbol.length > VARIABLE_SYMBOL_MAX_LENGTH) {
      throw new Error(`Invoice number range for prefix ${prefix} is full.`);
    }
    return variableSymbol;
  }

  private async maximumSequence(prefix: string): Promise<number> {
    const pattern = new RegExp(`^${prefix}(\\d+)$`);
    const [storedSymbols, conferenceAttendees, courseAttendees] =
      await Promise.all([
        this.invoiceRepository.findVariableSymbols(prefix),
        this.attendeeRepository.findAll(
          { "invoice.issuer.variableSymbol": pattern },
          { "invoice.issuer.variableSymbol": 1 },
        ),
        this.courseAttendeeRepository.findAll(
          { "invoice.issuer.variableSymbol": pattern },
          { "invoice.issuer.variableSymbol": 1 },
        ),
      ]);
    const historicalSymbols = [
      ...conferenceAttendees,
      ...courseAttendees,
    ].flatMap((attendee) =>
      attendee.invoice?.issuer.variableSymbol
        ? [attendee.invoice.issuer.variableSymbol]
        : [],
    );

    return [...storedSymbols, ...historicalSymbols].reduce(
      (maximum, variableSymbol) => {
        const match = variableSymbol.match(pattern);
        const sequence = match ? Number(match[1]) : 0;
        return Number.isSafeInteger(sequence)
          ? Math.max(maximum, sequence)
          : maximum;
      },
      0,
    );
  }

  private async legacyVariableSymbolExists(variableSymbol: string) {
    const [conferenceInvoice, courseInvoice] = await Promise.all([
      this.attendeeRepository.exists({
        "invoice.issuer.variableSymbol": variableSymbol,
      }),
      this.courseAttendeeRepository.exists({
        "invoice.issuer.variableSymbol": variableSymbol,
      }),
    ]);
    return Boolean(conferenceInvoice || courseInvoice);
  }

  private findLegacyAttendee(
    ownerType: InvoiceOwnerType,
    attendeeId: ObjectId,
  ) {
    return ownerType === InvoiceOwnerType.COURSE_ATTENDEE
      ? this.courseAttendeeRepository.findOne({ _id: attendeeId })
      : this.attendeeRepository.findOne({ _id: attendeeId });
  }
}
