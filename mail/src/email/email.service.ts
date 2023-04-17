import { MailerService } from '@nestjs-modules/mailer';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { InvoiceMsg } from './templates/invoice';
import { AuthorMsg } from './templates/author';

import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import puppeteer from 'puppeteer';

export interface Msg {
  locale: 'en' | 'sk';
  name: string;
  email: string;
}
interface AuthMsg extends Msg {
  token: string;
}

interface Grant {
  name: string;
  id: string;
}

interface GrantAnnouncementMsg extends Msg {
  announcement: string;
  grants: Grant[];
}

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private i18n: I18nService,
    private configService: ConfigService,
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
        args: ['--no-sandbox', '--disable-gpu'],
        executablePath: '/usr/bin/chromium-browser',
        headless: true,
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
    exchange: 'FlawIS',
    routingKey: 'mail.registration',
  })
  async sendActivationLink(msg: AuthMsg) {
    try {
      const url = `${this.configService.get<string>('CLIENT_APP_URL')}/${
        msg.locale
      }/activate?token=${msg.token}`;

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
    exchange: 'FlawIS',
    routingKey: 'mail.reset',
  })
  async sendResetLink(msg: AuthMsg) {
    const url = `${this.configService.get<string>('CLIENT_APP_URL')}/${
      msg.locale
    }/resetPassword?token=${msg.token}`;

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
    exchange: 'FlawIS',
    routingKey: 'mail.grantAnnouncemenet',
  })
  async sendGrantAnnouncement(msg: GrantAnnouncementMsg) {
    const urls = msg.grants.map((grant) => ({
      text: grant.name,
      url: `${this.configService.get<string>('CLIENT_APP_URL')}/${msg.locale}/${
        grant.id
      }`,
    }));

    await this.mailerService.sendMail({
      to: msg.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: this.i18n.t('grantAnnouncement.subject', { lang: msg.locale }),
      template: 'grantAnnouncement',
      context: {
        // ✏️ filling curly brackets with content
        name: msg.name,
        announcement: msg.announcement,
        urls,
        i18nLang: msg.locale,
      },
    });
  }

  @RabbitSubscribe({
    exchange: 'FlawIS',
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
    exchange: 'FlawIS',
    routingKey: 'mail.conference.coAuthor',
  })
  async sendCoauthorLink(msg: AuthorMsg) {
    const url = `${this.configService.get<string>('CLIENT_APP_URL')}/${
      msg.locale
    }/${msg.conferenceSlug}/register?submission=${msg.submissionId}`;

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
}
