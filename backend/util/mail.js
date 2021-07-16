const nodemailer = require("nodemailer");
//testovaci transport pre mailtrap
/* const transport = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS
	}
}); */

const transport = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS,
	},
});

exports.send = async (options) => {
	const mailOptions = {
		from: `FlawIS <noreply@flaw.uniba.sk>`,
		to: options.user.email,
		subject: options.subject,
		text: options.text,
		html: options.html,
	};

	return await transport.sendMail(mailOptions);
};
