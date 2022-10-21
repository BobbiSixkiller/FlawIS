import { MailerService } from '@nestjs-modules/mailer';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

interface ActivationMsg {
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
    routingKey: 'mail.#',
  })
  async sendActivationLink(msg: ActivationMsg) {
    console.log(msg);
    const url = `http://localhost:3010/${msg.locale}/reset/${msg.token}`;

    await this.mailerService.sendMail({
      to: msg.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: this.i18n.t('registration.subject'),
      template: 'registration',
      context: {
        // ✏️ filling curly brackets with content
        name: msg.name,
        url,
        // i18nLang: msg.locale,
      },
    });
  }

  async sendResetLink() {}

  async sendConferenceInvoice() {}
}
