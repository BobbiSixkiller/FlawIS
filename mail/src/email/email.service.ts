import { MailerService } from '@nestjs-modules/mailer';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { InvoiceMsg } from './templates/invoice';
import { join } from 'path';
import { renderFile } from 'ejs';
import * as pdfkit from 'pdfkit';
import { AuthorMsg } from './templates/author';

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

  private async generatePdfStream(
    html: string,
  ): Promise<NodeJS.ReadableStream> {
    const pdfStream = new pdfkit({ size: 'A4', margin: 50 });
    pdfStream.font('Helvetica');
    pdfStream.text(html, { align: 'justify' });
    pdfStream.end();
    return pdfStream;
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (error) => reject(error));
    });
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
    const templateHtml = await renderFile(
      join(__dirname, './templates/invoice.hbs'),
      msg.invoice,
    );
    const pdfStream = await this.generatePdfStream(templateHtml);
    const pdfBuffer = await this.streamToBuffer(pdfStream);
    const fileName = `invoice-${new Date().getTime()}.pdf`;

    await this.mailerService.sendMail({
      to: msg.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject:
        this.i18n.t('conference.subject', { lang: msg.locale }) +
        ' ' +
        msg.conferenceName,
      template: 'invoice',
      context: {
        // ✏️ filling curly brackets with content
        name: msg.name,
        i18nLang: msg.locale,
        conferenceLogo: msg.conferenceLogo,
        invoice: msg.invoice,
      },
      attachments: [{ filename: fileName, content: pdfBuffer }],
    });
  }

  @RabbitSubscribe({
    exchange: 'FlawIS',
    routingKey: 'mail.conference.coAuthor',
  })
  async sendCoauthorLink(msg: AuthorMsg) {
    try {
      const url = `${this.configService.get<string>('CLIENT_APP_URL')}/${
        msg.locale
      }/${msg.conferenceSlug}/register?submission=${msg.submissionId}`;

      await this.mailerService.sendMail({
        to: msg.email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: this.i18n.t('author.subject', { lang: msg.locale }),
        template: 'author',
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
}
