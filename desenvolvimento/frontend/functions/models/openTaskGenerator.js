import { log } from "firebase-functions/logger";
import { config as configDotenv } from "dotenv";
import OpenAI from 'openai';

const runModel = async (knowledge) => {
  configDotenv();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  log(`Starting model with knowledge: ${knowledge}`);

  try {
    log("Generating content with parts");

    const prompt = `
      Quais são as matérias e os conteudos desse texto? Responda em JSON (materias como subjects, e conteudo das materias como contents) Exemplo: { "subjects": [{"name": "Português", "contents": ["Gramática", "Interpretação de texto"]}, {"name": "Matemática", "contents": ["Álgebra", "Geometria"]}] }

      ${knowledge}
    `;

    const params = {
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    };

    const chatCompletion = await openai.chat.completions.create(params);

    const response = chatCompletion.choices[0].message.content;

    log("Finished generating content");

    log(response);

    return response;
  } catch (error) {
    log(`An error occurred while running the model: ${error}`);

    return {
      error: error.message,
    };
  }
};

export { runModel };
