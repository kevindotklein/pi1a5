import { GoogleGenerativeAI } from "@google/generative-ai";
import { log } from "firebase-functions/logger";
import { config as configDotenv } from "dotenv";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const runModel = async (knowledge) => {
  configDotenv();

  log(`Starting model with knowledge: ${knowledge}`);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Quais são as matérias e os conteudos desse texto? Responda em JSON (materias como subjects, e conteudo das materias como contents) Exemplo: { "subjects": [{"name": "Português", "contents": ["Gramática", "Interpretação de texto"]}, {"name": "Matemática", "contents": ["Álgebra", "Geometria"]}] }

      ${knowledge}
    `;
  
    log("Generating content with parts");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    log("Finished generating content");
  
    return text;
  } catch (error) {
    log(`An error occurred while running the model: ${error}`);
    
    return {
      error: error.message,
    };
  }
};

export { runModel };
