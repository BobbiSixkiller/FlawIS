import { Injectable } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RmqService {
  @RabbitRPC({
    exchange: 'FlawIS',
    routingKey: 'mail.#',
  })
  public async rpcHandler(msg: {}) {
    console.log(msg);
    return {
      response: 42,
    };
  }
}
