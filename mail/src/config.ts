export default () => ({
  rmqUri: process.env.RMQ_URI || 'amqp://rabbitmq:5672',
  rmqExchange: process.env.RMQ_EXCHANGE || 'FlawIS',
  transport: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth:
      process.env.NODE_ENV === 'development'
        ? {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          }
        : undefined,
    // tls: {
    //   ciphers: 'SSLv3',
    // },
  },
});
