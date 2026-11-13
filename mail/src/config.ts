export default () => ({
  rmqUri: process.env.RMQ_URI || 'amqp://rabbitmq:5672?frameMax=131072',
  rmqExchange: process.env.RMQ_EXCHANGE || 'FlawIS.notifications.v2',
  transport: {
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    connectionTimeout: 30_000,
    greetingTimeout: 30_000,
    socketTimeout: 60_000,
    auth:
      process.env.MAIL_USER && process.env.MAIL_PASSWORD
        ? {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          }
        : undefined,
  },
});
