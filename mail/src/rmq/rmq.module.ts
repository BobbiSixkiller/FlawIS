import {
  RabbitMQModule,
  MessageHandlerErrorBehavior,
} from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      useFactory(config: ConfigService) {
        return {
          exchanges: [
            {
              name: config.get<string>('rmqExchange'),
              type: 'topic',
              options: { durable: true },
            },
          ],
          uri: config.get<string>('rmqUri'),
          defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.REQUEUE,
          prefetchCount: 5,
          connectionInitOptions: { wait: false },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [RabbitMQModule],
})
export class RmqModule {}
