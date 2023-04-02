import { MailerService } from '@nestjs-modules/mailer';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';

interface Msg {
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

  @RabbitSubscribe({
    exchange: 'FlawIS',
    routingKey: 'mail.registration',
  })
  async sendActivationLink(msg: AuthMsg) {
    try {
      const url = `${this.configService.get<string>('CLIENT_APP_URL')}/${
        msg.locale
      }/activate?token=${msg.token}`;
      console.log(url);

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
}
