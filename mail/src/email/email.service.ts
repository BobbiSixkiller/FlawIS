import { MailerService } from '@nestjs-modules/mailer';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Invoice, InvoiceMsg } from './templates/invoice';
import { AuthorMsg } from './templates/author';
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
  ) {}

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

        if (permanent || finalAttempt) {
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
          return false;
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
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.registration',
    queue: 'flawis.mail.registration',
  })
  async sendActivationLink(msg: AuthMsg) {
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
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.reset',
    queue: 'flawis.mail.reset',
  })
  async sendResetLink(msg: AuthMsg) {
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
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.conference.invoice',
    queue: 'flawis.mail.conference.invoice',
  })
  async sendConferenceInvoice(msg: InvoiceMsg) {
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
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.conference.coAuthor',
    queue: 'flawis.mail.conference.coAuthor',
  })
  async sendCoauthorLink(msg: AuthorMsg) {
    const url = `${
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : `https://${msg.hostname}`
    }/${msg.locale}/${msg.conferenceSlug}/register?submission=${
      msg.submissionId
    }&token=${msg.token}`;

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
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.internships.newOrg',
    queue: 'flawis.mail.internships.newOrg',
  })
  async sendOrgRegistrationLink(msg: AuthMsg) {
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
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.internships.applied',
    queue: 'flawis.mail.internships.applied',
  })
  async sendInternApplied(msg: InternshipMsg) {
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
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.internships.eligible',
    queue: 'flawis.mail.internships.eligible',
  })
  async sendInternEligible(msg: InternshipMsg) {
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
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.internships.accepted',
    queue: 'flawis.mail.internships.accepted',
  })
  async sendInternAccepted(msg: InternshipMsg) {
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
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.internships.rejected',
    queue: 'flawis.mail.internships.rejected',
  })
  async sendInternRejected(msg: InternshipMsg) {
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
  }

  //implement llink to intern
  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.internships.admin',
    queue: 'flawis.mail.internships.admin',
  })
  async sendAdminInternNotification(msg: InternshipMsg) {
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
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.internships.org',
    queue: 'flawis.mail.internships.org',
  })
  async sendOrgInternsNotification(msg: InternshipMsg) {
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
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.courses.applied',
    queue: 'flawis.mail.courses.applied',
  })
  async sendCourseAttendeeApplied(msg: CourseMsg) {
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
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.courses.eligible',
    queue: 'flawis.mail.courses.eligible',
  })
  async sendCourseAttendeeEligible(msg: CourseMsg) {
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
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.courses.accepted',
    queue: 'flawis.mail.courses.accepted',
  })
  async sendCourseAttendeeAccepted(msg: CourseMsg) {
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
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.courses.rejected',
    queue: 'flawis.mail.courses.rejected',
  })
  async sendCourseAttendeeRejected(msg: CourseMsg) {
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
  }
}
