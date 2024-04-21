import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const runModel = async (knowledge) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    baseado nesse texto, 
    identifique quais são as matérias que serão cobradas no concurso:
    ${knowledge}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return text;
};

export { runModel };
