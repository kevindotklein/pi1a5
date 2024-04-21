import { https } from "firebase-functions";
import { readPDF } from "./helpers/pdfReader.js";
import { runModel } from "./models/contentInterpreter.js";
import { config as configDotenv } from "dotenv";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
export const getContentFromPdf = https.onRequest(async (request, response) => {
  configDotenv();

  try {
    functions.logger.info("Running content interpreter model", {
      structuredData: true,
    });

    // get buffer from bucket here
    const buffer = Buffer.from("test");

    const knowledge = await readPDF(buffer);

    if (knowledge) {
      functions.logger.info("Found knowledge, running model");
      const processedContent = await runModel(knowledge);

      response.send(processedContent);
    } else {
      response.send("No knowledge found");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
});
