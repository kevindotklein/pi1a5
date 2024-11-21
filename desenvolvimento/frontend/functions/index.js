import { https } from "firebase-functions";
import { readPDF } from "./helpers/pdfReader.js";
import { runContentInterpreterModel } from "./models/openContentInterpreter.js";
import { config as configDotenv } from "dotenv";
import { log } from "firebase-functions/logger";

import cors from "cors";
import { filterKnowledge } from "./helpers/filterKnowledge.js";
import { filterJSON } from "./helpers/filterJSON.js";
import { runTaskGenerationModel } from "./models/openTaskGenerator.js";
const corsHandler = cors({ origin: true });
import admin from "firebase-admin";
import { sendEmail } from "./helpers/sendEmail.js";
import * as functions from "firebase-functions";
import { runInfoExtractorModel } from "./models/openInfoExtractor.js";

export const getContentFromPdf = https.onRequest(async (request, response) => {
  configDotenv({ path: "../.env" });

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: process.env.TYPE,
        project_id: process.env.PROJECT_ID,
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: process.env.PRIVATE_KEY.replace(/\\n/gm, "\n"),
        client_email: process.env.CLIENT_EMAIL,
        client_id: process.env.CLIENT_ID,
        auth_uri: process.env.AUTH_URI,
        token_uri: process.env.TOKEN_URI,
        auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
      }),
      databaseURL: "https://noz-ifsp-default-rtdb.firebaseio.com",
    });
  }

  corsHandler(request, response, async () => {
    var firestore = admin.firestore();

    try {
      log("Running content interpreter model", {
        structuredData: true,
      });

      log(`req body: ${JSON.stringify(request.body)}`);

      const {
        url: notice_url,
        notice_content,
        user_uid,
        file_name,
        notice_name,
        file_hash,
      } = request.body;

      log(`Notice url: ${notice_url}`, {
        structuredData: true,
      });

      log(`Notice content: ${notice_content}`, {
        structuredData: true,
      });

      if (!notice_url) {
        response.json({
          error: "Nenhuma URL fornecida.",
        });
        return;
      }

      let alreadyExists = false;

      const pastNotices = await firestore
        .collection("notices")
        .where("file_hash", "==", file_hash)
        .get();

      if (!pastNotices.empty) {
        alreadyExists = true;
        const existingNotices = pastNotices.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        log(
          `Found ${existingNotices.length} notices with the same file_hash (e.g: ${existingNotices[0].file_name})`,
          {
            structuredData: true,
          }
        );

        const noticeRef = await firestore.collection("notices").add({
          name: notice_name,
          file_name: file_name,
          url: notice_url,
          user_uid: user_uid,
          processed: true,
          created_at: new Date().toISOString(),
          file_hash: file_hash,
        });

        const notice_id = noticeRef.id;

        const subjectsSnap = await firestore
          .collection("subjects")
          .where("notice_id", "==", existingNotices[0]?.id)
          .get();

        const subjects = subjectsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        for (const subject of subjects) {
          await firestore.collection("subjects").add({
            name: subject.name,
            contents: subject.contents,
            notice_id,
          });
        }

        if (user_uid) {
          const userDocRef = firestore.doc(`users/${user_uid}`);
          await userDocRef.set(
            {
              has_notice: true,
              notice_name: notice_name,
            },
            { merge: true }
          );

          const user_email = userDocRef.get().then((doc) => doc.data().email);
          const owner_name = userDocRef
            .get()
            .then((doc) => doc.data().full_name);

          await firestore.collection("notifications").add({
            title: "Novo Edital",
            description: "Seu edital foi enviado para a sua área de estudo",
            notice_id,
            user_uid,
            user_email,
            owner_name,
            created_at: new Date().toISOString(),
          });
        }

        response.json(subjects);
      }

      if (!alreadyExists) {
        let buffer;

        if (!notice_content) {
          log("No notice content was provided, fetching PDF");

          const urlResponse = await fetch(notice_url);
          buffer = await urlResponse.arrayBuffer();

          log(`buffer was received: ${buffer ? "yes" : "no"}`);
        }

        const knowledge = notice_content
          ? notice_content
          : await readPDF(buffer);

        if (knowledge) {
          log("Found knowledge, running filter");

          const filteredText = filterKnowledge(knowledge);

          if (filteredText.length > 25000) {
            log(
              "The knowledge is too long, please try again with a shorter notice"
            );
            response.json({
              error:
                "Parece que o conteúdo do edital é muito longo, por favor, tente novamente com um edital mais curto, ou insira o conteúdo manualmente.",
            });

            return;
          }

          log("Filtered knowledge, running model");
          const processedContent = await runContentInterpreterModel(
            filteredText
          );

          if (processedContent.error) throw new Error(processedContent.error);

          log("Building JSON object");

          const jsonObject = filterJSON(processedContent);

          // Add the notice to Firestore
          const noticeRef = await firestore.collection("notices").add({
            name: notice_name,
            file_name: file_name,
            url: notice_url,
            user_uid: user_uid,
            processed: true,
            created_at: new Date().toISOString(),
            file_hash: file_hash,
          });

          const notice_id = noticeRef.id;

          // Store related subjects in Firestore
          for (const subject of jsonObject?.subjects || []) {
            await firestore.collection("subjects").add({
              ...subject,
              notice_id,
            });
          }

          if (user_uid) {
            const userDocRef = firestore.doc(`users/${user_uid}`);
            await userDocRef.set(
              {
                has_notice: true,
                notice_name: notice_name,
              },
              { merge: true }
            );
          }

          await firestore.collection("notifications").add({
            title: "Novo Edital",
            description: "Seu edital foi enviado para a sua área de estudo",
            notice_id,
            user_uid,
            created_at: new Date().toISOString(),
          });

          response.json(jsonObject);
        } else {
          response.json({
            error: "Não foi encontrado nenhum conteúdo programático.",
          });
        }
        alreadyExists = false;
      }
    } catch (error) {
      const text = `Houve um erro ao processar o conteúdo: ${error}`;

      log(text);
      response.status(400).json({
        error: text,
      });
    }
  });
});

export const generateTasks = https.onRequest(async (request, response) => {
  configDotenv();

  corsHandler(request, response, async () => {
    try {
      log("Running task generation", {
        structuredData: true,
      });

      log(`req body: ${JSON.stringify(request.body)}`);

      const { hours, notice_content, subjects } = request.body;

      log(`Hours: ${hours}`, {
        structuredData: true,
      });

      log(`Notice content: ${notice_content}`, {
        structuredData: true,
      });

      log("Running model");
      const processedContent = await runTaskGenerationModel({
        hours,
        notice_content,
        subjects,
      });

      if (processedContent.error) throw new Error(processedContent.error);

      log("Building JSON object");

      const jsonObject = filterJSON(processedContent);

      response.json(jsonObject);
    } catch (error) {
      const text = `Houve um erro ao processar o conteúdo: ${error}`;

      log(text);
      response.status(400).json({
        error: text,
      });
    }
  });
});

export const extractInfos = https.onRequest(async (request, response) => {
  configDotenv();

  corsHandler(request, response, async () => {
    try {
      log("Running info extraction", {
        structuredData: true,
      });

      log(`req body: ${JSON.stringify(request.body)}`);

      const { text } = request.body;

      log(`Text: ${text}`, {
        structuredData: true,
      });

      log("Running model");
      const processedContent = await runInfoExtractorModel({
        text,
      });

      if (processedContent.error) throw new Error(processedContent.error);

      log("Building JSON object");

      const jsonObject = filterJSON(processedContent);

      response.json({
        infos: jsonObject,
      });
    } catch (error) {
      const text = `Houve um erro ao extrair o conteúdo: ${error}`;

      log(text);
      response.status(400).json({
        error: text,
      });
    }
  });
});

export const scheduleNoticeReminder = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    configDotenv({ path: "../.env" });

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          type: process.env.TYPE,
          project_id: process.env.PROJECT_ID,
          private_key_id: process.env.PRIVATE_KEY_ID,
          private_key: process.env.PRIVATE_KEY.replace(/\\n/gm, "\n"),
          client_email: process.env.CLIENT_EMAIL,
          client_id: process.env.CLIENT_ID,
          auth_uri: process.env.AUTH_URI,
          token_uri: process.env.TOKEN_URI,
          auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
          client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
        }),
        databaseURL: "https://noz-ifsp-default-rtdb.firebaseio.com",
      });
    }

    const firestore = admin.firestore();
    const today = dayjs().startOf("day");
    const targetDate = today.add(10, "days").toDate(); // 10 days from today

    try {
      log("Running daily notice reminder check");

      const noticesSnapshot = await firestore
        .collection("notices")
        .where("date", ">=", targetDate)
        .where("date", "<", dayjs(targetDate).endOf("day").toDate())
        .get();

      if (noticesSnapshot.empty) {
        log("No notices found for 10-day reminder");
        return null;
      }

      const batch = firestore.batch(); // use a batch for multiple writes
      noticesSnapshot.forEach((noticeDoc) => {
        const noticeData = noticeDoc.data();

        const notificationRef = firestore.collection("notifications").doc();
        batch.set(notificationRef, {
          title: "Upcoming Notice Deadline",
          description: `A reminder: the deadline for ${noticeData.name} is approaching in 10 days.`,
          notice_id: noticeDoc.id,
          user_uid: noticeData.user_uid,
          created_at: new Date().toISOString(),
        });
      });

      await batch.commit();
      log("Daily notice reminders created successfully");

      return null;
    } catch (error) {
      log(`Error creating daily reminders: ${error}`);
      return null;
    }
  });

export const onNotificationCreate = functions.firestore
  .document("notifications/{notificationId}")
  .onCreate(async (snapshot) => {
    configDotenv();

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
      to,
      subject,
      text,
      html,
      snapshot,
    };

    await sendEmail(email);
  });

export const onUserCreate = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snapshot) => {
    configDotenv();

    const user = {
      id: snapshot.id,
      ...snapshot.data(),
    };

    const app_link = "https://studyflow-three.vercel.app";

    const subject = "Bem vindo ao StudyFlow!";
    const to = user.email;
    const text = "Bem vindo ao StudyFlow!";
    const html =
      "<h2>Olá, " +
      user.full_name +
      "!</h2><br />" +
      "<p>Estamos felizes em ter você aqui!</p>" +
      '<p>Você pode acessar a plataforma clicando <a href="' +
      app_link +
      '">aqui</a>.</p>' +
      "<p>Obrigado por utilizar nosso serviço!</p>";

    const email = {
      to,
      subject,
      text,
      html,
      snapshot,
    };

    await sendEmail(email);
  });
