export default () => ({
  rmqUri: process.env.RMQ_URI || 'amqp://rabbitmq:5672',
  rmqExchange: process.env.RMQ_EXCHANGE || 'FlawIS',
  transport: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth:
      process.env.MAIL_USER && process.env.MAIL_PASSWORD
        ? {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          }
        : undefined,
  },
});
