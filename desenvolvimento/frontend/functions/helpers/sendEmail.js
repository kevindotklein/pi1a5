import * as nodemailer from "nodemailer";
import { log } from "firebase-functions/logger";

export const sendEmail = async ({ to, subject, text, html, snapshot }) => {
  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    secure: true,
    secureConnection: false, // TLS requires secureConnection to be false
    tls: {
      ciphers: "SSLv3",
    },
    requireTLS: true,
    port: 465,
    debug: true,
    auth: {
      user: "dev@siad.online",
      pass: process.env.MAILER_PASSWORD,
    },
  });

  const from = '"StudyFlow" <dev@siad.online>';

  const email = {
    from,
    to,
    subject,
    text,
    html,
  };

  log("Sending email to: " + to + " with subject: " + subject);

  transporter.sendMail(email, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Mensagem %s enviada: %s", info.messageId, info.response);
  });

  return snapshot.ref.set(
    {
      email_sent: true,
    },
    { merge: true }
  );
};
