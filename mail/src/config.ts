export default () => ({
  rmqUri: 'amqp://rabbitmq:5672',
  transport: {
    // host: process.env.MAIL_HOST,
    // port: process.env.MAIL_PORT,
    service: "Gmail",
    // secure: process.env.NODE_ENV === 'production',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  },
});
