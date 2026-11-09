import { MailerService } from '@nestjs-modules/mailer';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import type { Invoice, InvoiceMsg } from './templates/invoice';
import type { AuthorMsg } from './templates/author';
import { resolveTenantOrigin } from './tenant-domain';

export interface Msg {
  locale: 'en' | 'sk';
  hostname: string;
  name: string;
  email: string;
}
export interface AuthMsg extends Msg {
  token: string;
}

export interface InternshipMsg extends Msg {
  internshipId: string;
  internId?: string;
  organization: string;
  count?: number;
}

export interface CourseMsg extends Msg {
  courseId: string;
  course: string;
  invoice?: Invoice;
}

type SendMailOptions = Parameters<MailerService['sendMail']>[0];

const TRANSIENT_MAIL_RETRY_DELAYS_MS = [1_000, 5_000];

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private i18n: I18nService,
    private readonly connection?: AmqpConnection,
  ) {}

  private async processNotification(
    raw: unknown,
    operation: () => Promise<unknown>,
  ) {
    const msg = raw as {
      _notificationId?: string;
      _notificationAttempt?: number;
    };
    if (!msg._notificationId) return operation();
    const secret = process.env.NOTIFICATION_SECRET || process.env.SECRET;
    if (!secret || !this.connection)
      throw new Error('Notification transport is not configured.');
    const response = await fetch(
      (process.env.CORE_INTERNAL_URL || 'http://core:5000') +
        '/internal/notifications/' +
        msg._notificationId +
        '/claim',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-notification-secret': secret,
        },
        body: JSON.stringify({ attempt: msg._notificationAttempt }),
      },
    );
    if (!response.ok) throw new Error('Could not claim notification.');
    if (!((await response.json()) as { claimed: boolean }).claimed) return;
    let outcome: Record<string, unknown>;
    try {
      await operation();
      outcome = {
        id: msg._notificationId,
        attempt: msg._notificationAttempt,
        success: true,
      };
    } catch (error) {
      outcome = {
        id: msg._notificationId,
        attempt: msg._notificationAttempt,
        success: false,
        uncertain: this.isAmbiguousMailError(error),
        retryable:
          !this.isPermanentMailError(error) &&
          !this.isAmbiguousMailError(error),
        error:
          error instanceof Error
            ? error.message.slice(0, 500)
            : 'Delivery failed',
      };
    }
    await this.connection.publish(
      process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
      'notification.result',
      outcome,
      {
        persistent: true,
        messageId: msg._notificationId + ':' + msg._notificationAttempt,
      },
    );
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.review',
    queue: 'flawis.mail.review.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendReview(
    msg: Msg & {
      subject: string;
      text: string;
      url?: string;
      replyTo?: string;
      fileIds?: string[];
      _notificationId?: string;
    },
  ) {
    return this.processNotification(msg, async () => {
      const attachments = await Promise.all(
        (msg.fileIds || []).map(async (file) => {
          const response = await fetch(
            (process.env.CORE_INTERNAL_URL || 'http://core:5000') +
              '/internal/notifications/' +
              msg._notificationId +
              '/files/' +
              file,
            {
              headers: {
                'x-notification-secret':
                  process.env.NOTIFICATION_SECRET || process.env.SECRET || '',
              },
            },
          );
          if (!response.ok)
            throw new Error('Approved manuscript attachment is unavailable.');
          return {
            filename: response.headers.get('content-type')?.includes('pdf')
              ? 'manuscript.pdf'
              : 'manuscript.docx',
            content: Buffer.from(await response.arrayBuffer()),
          };
        }),
      );
      await this.deliverMail('mail.review', msg.email, {
        to: msg.email,
        subject: msg.subject,
        template: 'review',
        replyTo: msg.replyTo || undefined,
        attachments,
        context: {
          name: msg.name,
          text: msg.text,
          url: msg.url || '',
          i18nLang: msg.locale,
        },
      });
    });
  }

  private mailErrorDetails(error: unknown) {
    const smtpError =
      error && typeof error === 'object'
        ? (error as {
            code?: unknown;
            command?: unknown;
            responseCode?: unknown;
          })
        : undefined;

    return {
      message: error instanceof Error ? error.message : String(error),
      code: smtpError?.code,
      command: smtpError?.command,
      responseCode: smtpError?.responseCode,
    };
  }

  private isAmbiguousMailError(error: unknown) {
    if (!error || typeof error !== 'object') return false;
    const smtp = error as { command?: string; code?: string };
    return (
      smtp.command === 'DATA' &&
      ['ETIMEDOUT', 'ECONNRESET', 'ECONNECTION', 'ESOCKET'].includes(
        smtp.code || '',
      )
    );
  }

  private isPermanentMailError(error: unknown) {
    const responseCode =
      error && typeof error === 'object'
        ? Number((error as { responseCode?: unknown }).responseCode)
        : NaN;

    return responseCode >= 500 && responseCode < 600;
  }

  private async deliverMail(
    routingKey: string,
    recipient: string,
    options: SendMailOptions,
  ) {
    const attempts = TRANSIENT_MAIL_RETRY_DELAYS_MS.length + 1;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        await this.mailerService.sendMail(options);
        console.log(
          JSON.stringify({
            event: 'mail.delivery_succeeded',
            routingKey,
            recipient,
            attempt,
          }),
        );
        return true;
      } catch (error) {
        const permanent = this.isPermanentMailError(error);
        const finalAttempt = attempt === attempts;

        if (permanent || finalAttempt || this.isAmbiguousMailError(error)) {
          console.error(
            JSON.stringify({
              event: 'mail.delivery_failed',
              routingKey,
              recipient,
              attempt,
              permanent,
              ...this.mailErrorDetails(error),
            }),
          );
          throw error;
        }

        const retryDelayMs = TRANSIENT_MAIL_RETRY_DELAYS_MS[attempt - 1];
        console.warn(
          JSON.stringify({
            event: 'mail.delivery_retry',
            routingKey,
            recipient,
            attempt,
            retryDelayMs,
            ...this.mailErrorDetails(error),
          }),
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }

    return false;
  }

  private async renderInvoice(
    invoice: Invoice,
    locale: Msg['locale'],
    logo?: string,
  ) {
    const secret =
      process.env.INVOICE_RENDER_SECRET || process.env.SECRET || '';
    if (!secret) {
      throw new Error('INVOICE_RENDER_SECRET is not configured.');
    }

    const baseUrl = process.env.CLIENT_INTERNAL_URL || 'http://client:3000';
    const response = await fetch(`${baseUrl}/api/internal/invoices/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-invoice-render-secret': secret,
      },
      body: JSON.stringify({ invoice, locale, logo }),
    });

    if (!response.ok) {
      throw new Error(
        `Invoice renderer failed with status ${
          response.status
        }: ${await response.text()}`,
      );
    }

    return Buffer.from(await response.arrayBuffer());
  }

  private invoiceFilename(invoice: Invoice) {
    const number = (invoice.issuer.variableSymbol || '').replace(
      /[^a-zA-Z0-9_-]/g,
      '-',
    );
    return `invoice-${number || 'document'}.pdf`;
  }

  private courseAttendeeUrl(msg: CourseMsg) {
    return `${resolveTenantOrigin(msg.hostname, 'courses')}/${msg.locale}/${
      msg.courseId
    }`;
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.registration',
    queue: 'flawis.mail.registration.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendActivationLink(msg: AuthMsg) {
    return this.processNotification(msg, async () => {
      const url = `${
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : `https://${msg.hostname}`
      }/${msg.locale}/activate?token=${msg.token}`;

      await this.deliverMail('mail.registration', msg.email, {
        to: msg.email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: this.i18n.t('activation.subject', { lang: msg.locale }),
        template: 'activation',
        context: {
          // ✏️ filling curly brackets with content
          name: msg.name,
          url,
          i18nLang: msg.locale,
        },
      });
    });
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.reset',
    queue: 'flawis.mail.reset.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendResetLink(msg: AuthMsg) {
    return this.processNotification(msg, async () => {
      const url = `${
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : `https://${msg.hostname}`
      }/${msg.locale}/resetPassword?token=${msg.token}`;

      await this.deliverMail('mail.reset', msg.email, {
        to: msg.email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: this.i18n.t('passwordReset.subject', { lang: msg.locale }),
        template: 'passwordReset',
        context: {
          // ✏️ filling curly brackets with content
          name: msg.name,
          url,
          i18nLang: msg.locale,
        },
      });
    });
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.conference.invoice',
    queue: 'flawis.mail.conference.invoice.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendConferenceInvoice(msg: InvoiceMsg) {
    return this.processNotification(msg, async () => {
      const pdfBuffer = await this.renderInvoice(
        msg.invoice,
        msg.locale,
        msg.conferenceLogo,
      );

      await this.deliverMail('mail.conference.invoice', msg.email, {
        to: msg.email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject:
          this.i18n.t('conference.subject', { lang: msg.locale }) +
          ' ' +
          msg.conferenceName,
        template: 'conferenceRegistration',
        context: {
          // ✏️ filling curly brackets with content
          name: msg.name,
          i18nLang: msg.locale,
          conferenceLogo: msg.conferenceLogo,
          conferenceName: msg.conferenceName,
          invoice: msg.invoice,
        },
        attachments: [
          {
            filename: this.invoiceFilename(msg.invoice),
            content: pdfBuffer,
          },
        ],
      });
    });
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.conference.coAuthor',
    queue: 'flawis.mail.conference.coAuthor.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendCoauthorLink(msg: AuthorMsg) {
    return this.processNotification(msg, async () => {
      const url = `${resolveTenantOrigin(msg.hostname, 'conferences')}/${
        msg.locale
      }/${msg.conferenceSlug}/register?submission=${msg.submissionId}&token=${
        msg.token
      }`;

      await this.deliverMail('mail.conference.coAuthor', msg.email, {
        to: msg.email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject:
          this.i18n.t('author.subject', { lang: msg.locale }) +
          ' ' +
          msg.conferenceName,
        template: 'author',
        context: {
          // ✏️ filling curly brackets with content
          name: msg.name,
          url,
          i18nLang: msg.locale,
          conferenceName: msg.conferenceName,
          conferenceSlug: msg.conferenceSlug,
          submissionName: msg.submissionName,
          submissionAbstract: msg.submissionAbstract,
          submissionKeywords: msg.submissionKeywords,
        },
      });
    });
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.internships.newOrg',
    queue: 'flawis.mail.internships.newOrg.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendOrgRegistrationLink(msg: AuthMsg) {
    return this.processNotification(msg, async () => {
      const url = `${
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : `https://${msg.hostname}`
      }/${msg.locale}/register?token=${msg.token}`;

      await this.deliverMail('mail.internships.newOrg', msg.email, {
        to: msg.email,
        subject: this.i18n.t('newOrg.subject', { lang: msg.locale }),
        template: 'newOrg',
        context: {
          url,
          i18nLang: msg.locale,
        },
      });
    });
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.internships.applied',
    queue: 'flawis.mail.internships.applied.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendInternApplied(msg: InternshipMsg) {
    return this.processNotification(msg, async () => {
      const url = `${
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : `https://${msg.hostname}`
      }/${msg.locale}/${msg.internshipId}`;

      await this.deliverMail('mail.internships.applied', msg.email, {
        to: msg.email,
        subject: this.i18n.t('intern.applied.subject', { lang: msg.locale }),
        template: 'internApplied',
        context: {
          url,
          i18nLang: msg.locale,
          name: msg.name,
          organization: msg.organization,
        },
      });
    });
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.internships.eligible',
    queue: 'flawis.mail.internships.eligible.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendInternEligible(msg: InternshipMsg) {
    return this.processNotification(msg, async () => {
      const url = `${
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : `https://${msg.hostname}`
      }/${msg.locale}/${msg.internshipId}`;

      await this.deliverMail('mail.internships.eligible', msg.email, {
        to: msg.email,
        subject: this.i18n.t('intern.eligible.subject', { lang: msg.locale }),
        template: 'internEligible',
        context: {
          url,
          i18nLang: msg.locale,
          name: msg.name,
          organization: msg.organization,
        },
      });
    });
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.internships.accepted',
    queue: 'flawis.mail.internships.accepted.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendInternAccepted(msg: InternshipMsg) {
    return this.processNotification(msg, async () => {
      const url = `${
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : `https://${msg.hostname}`
      }/${msg.locale}/${msg.internshipId}`;

      await this.deliverMail('mail.internships.accepted', msg.email, {
        to: msg.email,
        subject: this.i18n.t('intern.accepted.subject', { lang: msg.locale }),
        template: 'internAccepted',
        context: {
          url,
          i18nLang: msg.locale,
          name: msg.name,
          organization: msg.organization,
        },
      });
    });
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.internships.rejected',
    queue: 'flawis.mail.internships.rejected.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendInternRejected(msg: InternshipMsg) {
    return this.processNotification(msg, async () => {
      const url = `${
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : `https://${msg.hostname}`
      }/${msg.locale}/${msg.internshipId}`;

      await this.deliverMail('mail.internships.rejected', msg.email, {
        to: msg.email,
        subject: this.i18n.t('intern.rejected.subject', { lang: msg.locale }),
        template: 'internRejected',
        context: {
          url,
          i18nLang: msg.locale,
          name: msg.name,
          organization: msg.organization,
        },
      });
    });
  }

  //implement llink to intern
  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.internships.admin',
    queue: 'flawis.mail.internships.admin.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendAdminInternNotification(msg: InternshipMsg) {
    return this.processNotification(msg, async () => {
      const url = `${
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : `https://${msg.hostname}`
      }/${msg.locale}/internships`;

      await this.deliverMail('mail.internships.admin', msg.email, {
        to: msg.email,
        subject: this.i18n.t('intern.admin.subject', { lang: msg.locale }),
        template: 'adminPendingIntern',
        context: {
          url,
          i18nLang: msg.locale,
          name: msg.name,
        },
      });
    });
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.internships.org',
    queue: 'flawis.mail.internships.org.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendOrgInternsNotification(msg: InternshipMsg) {
    return this.processNotification(msg, async () => {
      const url = `${
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : `https://${msg.hostname}`
      }/${msg.locale}/${msg.internshipId}/applications`;

      await this.deliverMail('mail.internships.org', msg.email, {
        to: msg.email,
        subject: this.i18n.t('intern.org.subject', { lang: msg.locale }),
        template: 'orgPendingInterns',
        context: {
          url,
          i18nLang: msg.locale,
          name: msg.name,
          organization: msg.organization,
          count: msg.count,
        },
      });
    });
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.courses.applied',
    queue: 'flawis.mail.courses.applied.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendCourseAttendeeApplied(msg: CourseMsg) {
    return this.processNotification(msg, async () => {
      const url = this.courseAttendeeUrl(msg);

      const attachment = msg.invoice
        ? {
            filename: this.invoiceFilename(msg.invoice),
            content: await this.renderInvoice(msg.invoice, msg.locale),
          }
        : undefined;

      await this.deliverMail('mail.courses.applied', msg.email, {
        to: msg.email,
        subject: this.i18n.t('course.applied.subject', { lang: msg.locale }),
        template: 'courses/attendeeApplied',
        context: {
          url,
          i18nLang: msg.locale,
          name: msg.name,
          course: msg.course,
        },
        attachments: attachment ? [attachment] : undefined,
      });
    });
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.courses.eligible',
    queue: 'flawis.mail.courses.eligible.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendCourseAttendeeEligible(msg: CourseMsg) {
    return this.processNotification(msg, async () => {
      const url = this.courseAttendeeUrl(msg);

      await this.deliverMail('mail.courses.eligible', msg.email, {
        to: msg.email,
        subject: this.i18n.t('course.eligible.subject', { lang: msg.locale }),
        template: 'courses/attendeeEligible',
        context: {
          url,
          i18nLang: msg.locale,
          name: msg.name,
          course: msg.course,
        },
      });
    });
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.courses.accepted',
    queue: 'flawis.mail.courses.accepted.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendCourseAttendeeAccepted(msg: CourseMsg) {
    return this.processNotification(msg, async () => {
      const url = this.courseAttendeeUrl(msg);

      await this.deliverMail('mail.courses.accepted', msg.email, {
        to: msg.email,
        subject: this.i18n.t('course.accepted.subject', { lang: msg.locale }),
        template: 'courses/attendeeAccepted',
        context: {
          url,
          i18nLang: msg.locale,
          name: msg.name,
          course: msg.course,
        },
      });
    });
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
    routingKey: 'mail.courses.rejected',
    queue: 'flawis.mail.courses.rejected.v2',
    queueOptions: {
      durable: true,
      autoDelete: false,
      deadLetterExchange:
        (process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2') + '.dead',
    },
  })
  async sendCourseAttendeeRejected(msg: CourseMsg) {
    return this.processNotification(msg, async () => {
      const url = this.courseAttendeeUrl(msg);

      await this.deliverMail('mail.courses.rejected', msg.email, {
        to: msg.email,
        subject: this.i18n.t('course.rejected.subject', { lang: msg.locale }),
        template: 'courses/attendeeRejected',
        context: {
          url,
          i18nLang: msg.locale,
          name: msg.name,
          course: msg.course,
        },
      });
    });
  }
}
