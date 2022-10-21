import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory(config: ConfigService) {
        return {
          exchanges: [
            {
              name: 'FlawIS',
              type: 'topic',
              options: { durable: false },
            },
          ],
          uri: config.get<string>('rmqUri'),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class RmqModule {}
