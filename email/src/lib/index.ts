import Email from "email-templates";
import path from "path";
import env from "dotenv";

env.config();

export default async function send(
  locale: string,
  template: string,
  from: string = "test@example.com",
  to: string | string[],
  data: Object,
  attachments: Object[]
) {
  const email = new Email({
    message: {
      from,
      attachments,
    },
    preview: false,
    send: true,
    views: {
      root: path.join("", "src/lib/templates/"),
    },
    transport: {
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "dfe6cc63fd2380",
        pass: "b7e520dba14a13",
      },
    },
    i18n: {
      locales: ["en", "sk"],
      directory: path.join(__dirname, `../locales`),
      defaultLocale: "sk",
    },
  });

  try {
    const res = await email.send({
      template,
      message: {
        to,
      },
      locals: {
        locale,
        filesUrl: process.env.FILES_URL || "http://localhost:5002",
        clientUrl: process.env.CLIENT_URL || "http://localhost:3010",
        ...data,
      },
    });
    console.log(res);
  } catch (error) {
    console.log(error);
  }
}
