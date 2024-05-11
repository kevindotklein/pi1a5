import { https } from "firebase-functions";
import { readPDF } from "./helpers/pdfReader.js";
import { runModel } from "./models/contentInterpreter.js";
import { config as configDotenv } from "dotenv";
import { log } from "firebase-functions/logger";

import cors from "cors";
import { filterKnowledge } from "./helpers/filterKnowledge.js";
import { filterJSON } from "./helpers/filterJSON.js";
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
          error: "No URL was provided",
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

        log("Filtered knowledge, running model");
        const processedContent = await runModel(filteredText);

        if (processedContent.error) throw new Error(processedContent.error);

        log("Building JSON object");

        const jsonObject = filterJSON(processedContent);

        response.json(jsonObject);
      } else {
        response.json({
          error: "No knowledge found",
        });
      }
    } catch (error) {
      const text = `An error occurred while processing the content: ${error}`;

      log(text);
      response.status(400).json({
        error: text,
      });
    }
  });
});
