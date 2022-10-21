import { Injectable, ExecutionContext } from '@nestjs/common';
import { I18nResolver, I18nResolverOptions } from 'nestjs-i18n';

import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class CustomResolver implements I18nResolver {
  constructor(@I18nResolverOptions() private keys: string[]) {}

  resolve(context: ExecutionContext) {
    let lang: string;
    console.log('HAJZLE');
    console.log(context);

    switch (context.getType() as string) {
      case 'rmq':
        const message = context.getArgs()[0];
        console.log(message);
    }

    return this.keys[1];
  }
}
