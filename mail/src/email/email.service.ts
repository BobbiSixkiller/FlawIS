import { MailerService } from '@nestjs-modules/mailer';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { InvoiceMsg } from './templates/invoice';
import { AuthorMsg } from './templates/author';

import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import puppeteer from 'puppeteer';

export interface Msg {
  locale: 'en' | 'sk';
  name?: string;
  email: string;
}
export interface AuthMsg extends Msg {
  hostname: string;
  token: string;
}

function getClientUrl() {
  switch (process.env.NODE_ENV) {
    case 'development':
      return 'http://localhost:3000';
    case 'staging':
      return 'http://conferences-staging.flaw.uniba.sk';
    case 'production':
      return 'http://conferences.flaw.uniba.sk';

    default:
      throw new Error('Invalid environment!');
  }
}

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private i18n: I18nService,
  ) {}

  private async createPDF(
    data: Record<string, any>,
    templateName: string,
  ): Promise<Buffer> {
    try {
      const templatePath = join(
        __dirname,
        '..',
        'email/templates',
        templateName,
      );
      const template = Handlebars.compile(readFileSync(templatePath, 'utf-8'));
      const html = template(data);

      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'],
        executablePath: '/usr/bin/chromium-browser',
        headless: true,
        timeout: 60000, // Increase to 60 seconds
      });
      const page = await browser.newPage();

      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      await browser.close();

      return pdfBuffer;
    } catch (error) {
      console.log(error);
    }
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.registration',
  })
  async sendActivationLink(msg: AuthMsg) {
    try {
      const url = `${
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : `https://${msg.hostname}`
      }/${msg.locale}/activate?token=${msg.token}`;

      await this.mailerService.sendMail({
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
    } catch (error) {
      console.log(error);
    }
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.reset',
  })
  async sendResetLink(msg: AuthMsg) {
    const url = `${
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : `https://${msg.hostname}`
    }/${msg.locale}/resetPassword?token=${msg.token}`;

    await this.mailerService.sendMail({
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
  })
  async sendConferenceInvoice(msg: InvoiceMsg) {
    const pdfBuffer = await this.createPDF(
      {
        name: msg.name,
        i18nLang: msg.locale,
        conferenceLogo: msg.conferenceLogo,
        conferenceName: msg.conferenceName,
        invoice: msg.invoice,
      },
      'invoice.hbs',
    );

    await this.mailerService.sendMail({
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
      attachments: [{ filename: 'invoice.pdf', content: pdfBuffer }],
    });
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.conference.coAuthor',
  })
  async sendCoauthorLink(msg: AuthorMsg) {
    const url = `${getClientUrl()}/${msg.locale}/${
      msg.conferenceSlug
    }/register?submission=${msg.submissionId}`;

    await this.mailerService.sendMail({
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
        submissionId: msg.submissionId,
        submissionName: msg.submissionName,
        submissionAbstract: msg.submissionAbstract,
        submissionKeywords: msg.submissionKeywords,
      },
    });
  }

  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: 'mail.internships.newOrg',
  })
  async sendOrgRegistrationLink(msg: AuthMsg) {
    const url = `${
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : `https://${msg.hostname}`
    }/${msg.locale}/register?token=${msg.token}`;

    await this.mailerService.sendMail({
      to: msg.email,
      subject: this.i18n.t('newOrg.subject', { lang: msg.locale }),
      template: 'newOrg',
      context: {
        url,
        i18nLang: msg.locale,
      },
    });
  }
}
