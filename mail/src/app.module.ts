import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config';
import { RmqModule } from './rmq/rmq.module';
import { EmailModule } from './email/email.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema: Joi.object({
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.string().required(),
        MAIL_FROM: Joi.string().required(),
        RMQ_URI: Joi.string().required(),
        RMQ_EXCHANGE: Joi.string().required(),
      }),
    }),
    RmqModule,
    EmailModule,
  ],
})
export class AppModule {}
