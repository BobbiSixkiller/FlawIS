import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory(config: ConfigService) {
        return {
          exchanges: [
            {
              name: config.get<string>('rmqExchange'),
              type: 'topic',
              options: { durable: false },
            },
          ],
          uri: config.get<string>('rmqUri'),
          connectionInitOptions: { wait: false },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class RmqModule {}
