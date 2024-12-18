import { log } from "firebase-functions/logger";
import { config as configDotenv } from "dotenv";
import OpenAI from "openai";

const runTaskGenerationModel = async ({
  hours,
  notice_content,
  subjects,
  reviewTasks,
}) => {
  configDotenv();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  log(`Starting model with: ${notice_content}`);

  try {
    log("Generating content with parts");

    const subjectsToSend = JSON.stringify(subjects);

    const prompt = `
      Responda a seguinte pergunta sem nenhum texto extra, apenas com JSON (e sem \`\`\`json ou \`\`\`):
      Baseado nas seguintes matérias e conteúdos, gere um JSON com tarefas para estudar em ${hours} horas, seguindo a seguinte estrutura JSON:
      {
        "tasks": [
          {
            "subject" : "Português",
            "content" : "Gramática",
            "title" : "Gramática",
            "description" : "Estude a gramática do português...",
            "hours" : 2,
          },
          ...
        ]
      }

      O campo description deve conter um guia simples do que o usuário deve estudar.
      As horas das tarefas devem ser em número inteiros, e somadas em um total de ${hours} horas.
      Gere tarefas para as seguintes matérias e conteúdos, baseado na estrutura do JSON fornecido:
      
      ${subjectsToSend}

      ${
        reviewTasks
          ? `
      Além disso, crie tarefas de revisão para os seguintes conteúdos: 
      
      ${reviewTasks}
      `
          : ""
      }
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

export { runTaskGenerationModel };
