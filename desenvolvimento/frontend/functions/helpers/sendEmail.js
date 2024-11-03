import * as nodemailer from "nodemailer";
import { log } from "firebase-functions/logger";

export const sendEmail = async (snapshot) => {
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

  const notification = {
    id: snapshot.id,
    ...snapshot.data(),
  };

  const app_link = "https://studyflow-three.vercel.app";

  const subject = "Seu edital foi processado com sucesso!";
  const to = notification.user_email;
  const text = "Seu edital foi processado com sucesso!";
  const html =
    "<h2>Olá, " +
    notification.owner_name +
    "!</h2><br />" +
    "<p>Estamos felizes em informar que o seu edital foi processado com sucesso!</p>" +
    '<p>Você pode acessar mais detalhes sobre o edital clicando <a href="' +
    app_link +
    '">aqui</a>.</p>' +
    "<p>Obrigado por utilizar nosso serviço!</p>";

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
