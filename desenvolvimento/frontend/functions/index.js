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

export const getContentFromPdf = https.onRequest(async (request, response) => {
  configDotenv();

  corsHandler(request, response, async () => {
    try {
      log("Running content interpreter model", {
        structuredData: true,
      });

      log(`req body: ${JSON.stringify(request.body)}`);

      const { url: notice_url, notice_content } = request.body;

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

      let buffer;

      if (!notice_content) {
        log("No notice content was provided, fetching PDF");

        const urlResponse = await fetch(notice_url);
        buffer = await urlResponse.arrayBuffer();

        log(`buffer was received: ${buffer ? "yes" : "no"}`);
      }

      const knowledge = notice_content ? notice_content : await readPDF(buffer);

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
        const processedContent = await runContentInterpreterModel(filteredText);

        if (processedContent.error) throw new Error(processedContent.error);

        log("Building JSON object");

        const jsonObject = filterJSON(processedContent);

        response.json(jsonObject);
      } else {
        response.json({
          error: "Não foi encontrado nenhum conteúdo programático.",
        });
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
