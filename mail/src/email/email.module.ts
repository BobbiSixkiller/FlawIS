import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { I18nModule, I18nService } from 'nestjs-i18n';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { EmailService } from './email.service';
import { CustomResolver } from 'src/email/custom.resolver';

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
      resolvers: [new CustomResolver(['en', 'sk'])],
    }),
    MailerModule.forRootAsync({
      useFactory(config: ConfigService, i18n: I18nService) {
        return {
          transport: {
            host: 'smtp.mailtrap.io',
            secure: false,
            auth: {
              user: 'dfe6cc63fd2380',
              pass: 'b7e520dba14a13',
            },
          },
          defaults: {
            from: `"No Reply" <${config.get<string>('MAIL_FROM')}>`,
          },
          template: {
            dir: join(__dirname, '/templates/'),
            adapter: new HandlebarsAdapter({ t: i18n.hbsHelper }),
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
