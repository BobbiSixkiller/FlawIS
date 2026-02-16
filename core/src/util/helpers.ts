import mongoose from "mongoose";
import type { ClientSession } from "mongoose";
import { DocumentType } from "@typegoose/typegoose";

export function getAcademicYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Academic year starts in September but consider summer months for creating internships
  // or applying for internships for next academic year
  const startYear = month >= 6 ? year : year - 1;
  const endYear = startYear + 1;

  const startDate = new Date(`${startYear}-07-01T00:00:00Z`);
  const endDate = new Date(`${endYear}-06-30T23:59:59Z`);

  const academicYear = `${startYear}/${endYear}`;

  return { startYear, endYear, startDate, endDate, academicYear };
}

export function todayAtMidnight(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export function toDTO<T>(doc: DocumentType<T>): T {
  return doc.toJSON({
    versionKey: false,
    virtuals: false,
    transform(_doc, ret) {
      if (ret._id) {
        ret.id = ret._id;
        delete ret._id;
      }
      return ret;
    },
  }) as T;
}

export async function withOptionalTransaction<T>(
  session: ClientSession | undefined,
  fn: (session: ClientSession | undefined) => Promise<T>,
): Promise<T> {
  if (session) return fn(session);

  const newSession = await mongoose.startSession();
  try {
    let result!: T;
    await newSession.withTransaction(async () => {
      result = await fn(newSession);
    });
    return result;
  } finally {
    newSession.endSession();
  }
}
