import { log } from "firebase-functions/logger";
import { config as configDotenv } from "dotenv";
import OpenAI from "openai";

const runInfoExtractorModel = async ({ text }) => {
  configDotenv();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  log(`Starting model with: ${text}`);

  try {
    log("Generating content with parts");

    const prompt = `
      Responda a seguinte pergunta sem nenhum texto extra, apenas com JSON (e sem \`\`\`json ou \`\`\`):

      Baseado no seguinte texto de um edital de um concurso, retire todas as informacoes que julgar importantes para o usuario que ira realizar a prova, e gere um json, onde a chave é o nome da váriavel em ingles, e o valor da chave é um objeto com as chaves label, que é o nome da informação em portugues, e value, que é o valor daquela informação:

      Exemplo do json:
      {
        "start_registration": {
          "label": "Início das inscrições",
          "value": "10/10/2024"
        },
        "end_registration": {
          "label": "Final das inscrições",
          "value": "28/10/2024"
        },
        "exam_date": {
          "label": "Provas",
          "value": "15/12/2024"
        }
      }

      Não extrair informações que não estiverem no contexto de uma prova de um concurso.
      Caso não houver informações importantes, retorne um json vazio.

      Texto:
      ${text}
    `;

    const params = {
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
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

export { runInfoExtractorModel };
