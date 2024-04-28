import { https } from "firebase-functions";
import { readPDF } from "./helpers/pdfReader.js";
import { runModel } from "./models/contentInterpreter.js";
import { config as configDotenv } from "dotenv";
import { log } from "firebase-functions/logger";

export const getContentFromPdf = https.onRequest(async (request, response) => {
  configDotenv();

  try {
    log("Running content interpreter model", {
      structuredData: true,
    });

    log(`req body: ${JSON.stringify(request.body)}`);

    const { url: notice_url } = request.body;

    log(`Notice url: ${notice_url}`, {
      structuredData: true,
    });

    if (!notice_url) {
      response.send("No notice url found");
      return;
    }

    const urlResponse = await fetch(notice_url);
    const buffer = await urlResponse.arrayBuffer();

    log(`buffer was received: ${buffer ? "yes" : "no"}`);

    const knowledge = await readPDF(buffer);

    if (knowledge) {
      log("Found knowledge, running model");
      const processedContent = await runModel(knowledge);

      response.json({
        content: processedContent,
      });
    } else {
      response.send("No knowledge found");
    }
  } catch (error) {
    console.error("An error occurred:", error);
    response.send("An error occurred");
  }
});
