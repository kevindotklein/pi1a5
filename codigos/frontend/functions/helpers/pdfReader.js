/* eslint-disable require-jsdoc */
import { PdfReader } from "pdfreader";

function groupRows(rows) {
  let text = "";
  const list = Object.keys(rows) // => array of y-positions (type: float)
    .sort((y1, y2) => parseFloat(y1) - parseFloat(y2));

  for (const row of list) {
    text += rows[row].join("") + "\n";
  }

  return text;
}

const readPDF = (buffer) => {
  return new Promise((resolve, reject) => {
    let i = 0;
    let rows = {}; // indexed by y-position
    let knowledge = "";
    const textByPage = {};
    let foundContent = false;

    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(err);
        return;
      }

      if (item === undefined) {
        resolve(knowledge);
      }

      if (item?.page) {
        const pageText = groupRows(rows);
        textByPage[i] = pageText;

        if (foundContent && pageText) {
          if (pageText.includes("ANEXO")) {
            foundContent = false;
          } else {
            knowledge += pageText;
          }
        }

        if (
          !foundContent &&
          pageText &&
          pageText.includes("CONHECIMENTOS BÁSICOS")
        ) {
          knowledge += pageText;
          foundContent = true;
        }

        rows = {};
        i++;
      } else if (item?.text) {
        (rows[item.y] = rows[item.y] || []).push(item.text);
      }
    });
  });
};

export { readPDF };
