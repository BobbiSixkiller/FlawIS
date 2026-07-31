import { Service } from "typedi";
import { ObjectId } from "mongodb";
import {
  ElearningAccess,
  ElearningProvisioningStatus,
} from "../entitites/Course";
import { Status } from "../entitites/Internship";
import { CourseAttendeeRepository } from "../repositories/courseAttendee.repository";
import { CourseRepository } from "../repositories/course.repository";
import { UserRepository } from "../repositories/user.repository";

const REACH_API_VERSION = "2023-05-04";

type ReachFetch = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

interface ReachUser {
  id: string;
  email: string;
}

interface ReachInvitation {
  id: string;
  email: string;
}

interface ReachCourse {
  id: string;
  title: string;
}

interface ReachErrorBody {
  errors?: Array<{
    code?: string;
    message?: string;
  }>;
}

export class Reach360ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status?: number,
    message?: string,
  ) {
    super(message || code);
    this.name = "Reach360ApiError";
  }
}

export class Reach360Client {
  private readonly baseUrl: string;

  constructor(
    baseUrl: string,
    private readonly apiKey: string,
    private readonly fetchImpl: ReachFetch = fetch,
    private readonly timeoutMs = 10_000,
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Reach360ApiError("reach_not_configured");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        ...init,
        signal: init.signal ?? controller.signal,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "API-Version": REACH_API_VERSION,
          ...(init.body ? { "Content-Type": "application/json" } : {}),
          ...init.headers,
        },
      });
    } catch {
      throw new Reach360ApiError("reach_unavailable");
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      let errorBody: ReachErrorBody | undefined;
      try {
        errorBody = (await response.json()) as ReachErrorBody;
      } catch {
        errorBody = undefined;
      }

      const error = errorBody?.errors?.[0];
      throw new Reach360ApiError(
        error?.code || `reach_http_${response.status}`,
        response.status,
        error?.message,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  async getCourse(courseId: string) {
    return await this.request<ReachCourse>(
      `/courses/${encodeURIComponent(courseId)}`,
    );
  }

  async findUser(email: string) {
    const result = await this.request<{ users: ReachUser[] }>(
      `/users?email=${encodeURIComponent(email)}&limit=1`,
    );
    return result.users[0] ?? null;
  }

  async findInvitation(email: string) {
    const result = await this.request<{ invitations: ReachInvitation[] }>(
      `/invitations?email=${encodeURIComponent(email)}&limit=1`,
    );
    return result.invitations[0] ?? null;
  }

  async createInvitation(email: string) {
    const result = await this.request<{ invitation: ReachInvitation }>(
      "/invitations",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
    );
    return result.invitation;
  }

  async enrollUser(courseId: string, userId: string) {
    await this.request<void>(
      `/courses/${encodeURIComponent(courseId)}/users/${encodeURIComponent(userId)}`,
      { method: "PUT" },
    );
  }

  async unenrollUser(courseId: string, userId: string) {
    await this.request<void>(
      `/courses/${encodeURIComponent(courseId)}/users/${encodeURIComponent(userId)}`,
      { method: "DELETE" },
    );
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

@Service()
export class Reach360Service {
  private readonly client: Reach360Client;

  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly courseAttendeeRepository: CourseAttendeeRepository,
    private readonly userRepository: UserRepository,
  ) {
    this.client = new Reach360Client(
      process.env.REACH_API_BASE_URL || "https://api.reach360.eu",
      process.env.REACH_API_KEY || "",
    );
  }

  async validateCourse(courseId: string) {
    await this.client.getCourse(courseId);
  }

  async getCourseConfig(courseId: ObjectId) {
    const course = await this.courseRepository.findOne({ _id: courseId });
    return course?.reachCourse ?? null;
  }

  async getElearningAccess(
    courseId: ObjectId,
    userId: ObjectId,
  ): Promise<ElearningAccess | null> {
    const [course, attendee] = await Promise.all([
      this.courseRepository.findOne({ _id: courseId }),
      this.courseAttendeeRepository.findOne({
        course: courseId,
        "user._id": userId,
      }),
    ]);

    if (!course?.reachCourse || attendee?.status !== Status.Accepted) {
      return null;
    }

    const status =
      attendee.reachEnrollment?.status ??
      ElearningProvisioningStatus.SyncFailed;

    return {
      status,
      launchUrl:
        status === ElearningProvisioningStatus.Enrolled
          ? course.reachCourse.launchUrl
          : undefined,
    };
  }

  async syncAttendee(
    attendeeId: ObjectId,
    shouldHaveAccess?: boolean,
  ) {
    const attendee = await this.courseAttendeeRepository.findOne({
      _id: attendeeId,
    });
    if (!attendee) {
      throw new Error("Attendee not found!");
    }

    const course = await this.courseRepository.findOne({
      _id: attendee.course,
    });
    if (!course) {
      throw new Error("Course not found!");
    }

    if (!course.reachCourse) {
      return attendee;
    }

    const desiredAccess =
      shouldHaveAccess ?? attendee.status === Status.Accepted;

    try {
      const reachUserId = await this.resolveReachUserId(
        attendee.user.id,
        attendee.user.email,
      );

      if (!desiredAccess) {
        if (reachUserId) {
          await this.client.unenrollUser(
            course.reachCourse.courseId,
            reachUserId,
          );
        }
        return await this.updateEnrollmentStatus(
          attendeeId,
          course.reachCourse.courseId,
          ElearningProvisioningStatus.Revoked,
        );
      }

      if (reachUserId) {
        await this.client.enrollUser(
          course.reachCourse.courseId,
          reachUserId,
        );
        return await this.updateEnrollmentStatus(
          attendeeId,
          course.reachCourse.courseId,
          ElearningProvisioningStatus.Enrolled,
        );
      }

      const pendingInvitation = await this.client.findInvitation(
        attendee.user.email,
      );
      if (!pendingInvitation) {
        await this.client.createInvitation(attendee.user.email);
      }

      return await this.updateEnrollmentStatus(
        attendeeId,
        course.reachCourse.courseId,
        ElearningProvisioningStatus.PendingInvitation,
      );
    } catch (error) {
      const errorCode =
        error instanceof Reach360ApiError ? error.code : "reach_sync_failed";
      return await this.updateEnrollmentStatus(
        attendeeId,
        course.reachCourse.courseId,
        ElearningProvisioningStatus.SyncFailed,
        errorCode,
      );
    }
  }

  async handleUserCreated(user: ReachUser) {
    const emailFilter = new RegExp(
      `^${escapeRegExp(user.email.trim())}$`,
      "i",
    );

    await this.userRepository.findOneAndUpdate(
      { email: emailFilter },
      { $set: { reachUserId: user.id } },
    );

    const attendees = await this.courseAttendeeRepository.findAll({
      "user.email": emailFilter,
      status: Status.Accepted,
    });

    const results = [];
    for (const attendee of attendees) {
      results.push(await this.syncAttendee(attendee._id, true));
    }
    return results;
  }

  private async resolveReachUserId(
    localUserId: ObjectId,
    email: string,
  ): Promise<string | null> {
    const localUser = await this.userRepository.findOne({ _id: localUserId });
    if (localUser?.reachUserId) {
      return localUser.reachUserId;
    }

    const reachUser = await this.client.findUser(email);
    if (!reachUser) {
      return null;
    }

    await this.userRepository.findOneAndUpdate(
      { _id: localUserId },
      { $set: { reachUserId: reachUser.id } },
    );
    return reachUser.id;
  }

  private async updateEnrollmentStatus(
    attendeeId: ObjectId,
    courseId: string,
    status: ElearningProvisioningStatus,
    lastErrorCode?: string,
  ) {
    const updated = await this.courseAttendeeRepository.findOneAndUpdate(
      { _id: attendeeId },
      {
        $set: {
          reachEnrollment: {
            courseId,
            status,
            ...(lastErrorCode ? { lastErrorCode } : {}),
            syncedAt: new Date(),
          },
        },
      },
      { new: true },
    );

    if (!updated) {
      throw new Error("Attendee not found!");
    }
    return updated;
  }
}
