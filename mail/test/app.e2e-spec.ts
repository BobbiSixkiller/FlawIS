import { Test, type TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import {
  AmqpConnection,
  AmqpConnectionManager,
  RABBIT_HANDLER,
} from '@golevelup/nestjs-rabbitmq';
import type { EmailService as EmailServiceType } from '../src/email/email.service';

describe('headless mail worker', () => {
  let app: TestingModule;
  let EmailService: typeof EmailServiceType;
  const exchange = 'FlawIS.module-test';
  const sendMail = jest.fn().mockResolvedValue(undefined);
  const publish = jest.fn().mockResolvedValue(undefined);
  const originalFetch = global.fetch;
  const environment = { ...process.env };
  beforeAll(async () => {
    Object.assign(process.env, {
      MAIL_HOST: '127.0.0.1',
      MAIL_PORT: '2526',
      MAIL_FROM: 'worker@example.test',
      RMQ_URI: 'amqp://127.0.0.1:5678',
      RMQ_EXCHANGE: exchange,
      NOTIFICATION_SECRET: 'isolated-worker-test',
    });
    // Load after setting the fixture environment; this test is compiled as CommonJS.
    const { AppModule } =
      require('../src/app.module') as typeof import('../src/app.module');
    EmailService = (
      require('../src/email/email.service') as typeof import('../src/email/email.service')
    ).EmailService;
    app = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MailerService)
      .useValue({ sendMail })
      .overrideProvider(AmqpConnectionManager)
      .useValue({
        getConnections: () => [],
        close: async () => {},
        clearConnections: () => {},
      })
      .overrideProvider(AmqpConnection)
      .useValue({ publish })
      .compile();
    await app.init();
  }, 15000);
  afterAll(async () => {
    await app?.close();
    global.fetch = originalFetch;
    for (const key of [
      'MAIL_HOST',
      'MAIL_PORT',
      'MAIL_FROM',
      'RMQ_URI',
      'RMQ_EXCHANGE',
      'NOTIFICATION_SECRET',
    ]) {
      if (environment[key] === undefined) delete process.env[key];
      else process.env[key] = environment[key];
    }
  });
  it('resolves the actual module dependencies and handles a claimed notification without an HTTP server', async () => {
    expect(app.get(ConfigService).get('rmqExchange')).toBe(exchange);
    const subscriptions = Object.getOwnPropertyNames(EmailService.prototype)
      .map((method) =>
        Reflect.getMetadata(RABBIT_HANDLER, EmailService.prototype[method]),
      )
      .filter(Boolean);
    expect(subscriptions.length).toBeGreaterThan(0);
    for (const subscription of subscriptions) {
      expect(subscription.exchange).toBe(exchange);
      expect(subscription.queueOptions.deadLetterExchange).toBe(
        `${exchange}.dead`,
      );
    }
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ claimed: true }), { status: 200 }),
      ) as any;
    await app.get(EmailService).sendReview({
      hostname: 'conferences.example.test',
      locale: 'sk',
      name: 'Reviewer',
      email: 'reviewer@example.test',
      subject: 'Review',
      text: 'Please review.',
      _notificationId: '000000000000000000000001',
      _notificationAttempt: 1,
    } as any);
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(
      exchange,
      'notification.result',
      expect.objectContaining({ success: true }),
      expect.objectContaining({ persistent: true }),
    );
  });
});
