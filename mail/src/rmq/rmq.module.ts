import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqService } from './rmq.service';

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
  providers: [RmqService],
})
export class RmqModule {}
