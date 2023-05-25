import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { I18nModule, I18nService } from 'nestjs-i18n';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { EmailService } from './email.service';

@Module({
  imports: [
    I18nModule.forRootAsync({
      useFactory() {
        return {
          fallbackLanguage: 'sk',
          loaderOptions: {
            path: join(__dirname, '/locales/'),
            watch: true,
          },
        };
      },
      resolvers: [],
    }),
    MailerModule.forRootAsync({
      useFactory(config: ConfigService, i18n: I18nService) {
        return {
          transport: config.get<any>('transport'),
          defaults: {
            from: `"No Reply" <${config.get<string>('MAIL_FROM')}>`,
          },
          template: {
            dir: join(__dirname, '/templates/'),
            adapter: new HandlebarsAdapter({
              t: i18n.hbsHelper,
              SUM: (a, b) => a + b,
              DATE: (date, locale) => {
                return new Date(date).toLocaleDateString(locale as string);
              },
            }),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService, I18nService],
    }),
  ],
  providers: [EmailService],
})
export class EmailModule {}
