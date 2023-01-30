import { MailerService } from '@nestjs-modules/mailer';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

interface AuthMsg {
  locale: 'en' | 'sk';
  name: string;
  email: string;
  token: string;
}

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private i18n: I18nService,
  ) {}

  @RabbitSubscribe({
    exchange: 'FlawIS',
    routingKey: 'mail.registration',
  })
  async sendActivationLink(msg: AuthMsg) {
    console.log(msg);
    const url = `http://localhost:3000/${msg.locale}/activate?token=${msg.token}`;

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
  }

  @RabbitSubscribe({
    exchange: 'FlawIS',
    routingKey: 'mail.reset',
  })
  async sendResetLink(msg: AuthMsg) {
    console.log(msg);
    const url = `http://localhost:3000/${msg.locale}/resetPassword?token=${msg.token}`;

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
    routingKey: 'mail.#',
  })
  async sendConferenceInvoice() {}
}
