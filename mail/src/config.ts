export default () => ({
  rmqUri: `amqp://${process.env.RMQ_USERNAME}:${process.env.RMQ_PASSWORD}@localhost:5672`,
  transport: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  },
});
