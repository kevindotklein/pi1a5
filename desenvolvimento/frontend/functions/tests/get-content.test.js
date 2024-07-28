import * as chai from "chai";

const chaiHttp = require("chai-http");

chai.use(chaiHttp);

import functions from "@google-cloud/functions-framework/testing";

functions.getFunction("getContentFromPdf");

describe("getContentFromPdf", () => {
  it("should return error when no URL is provided", (done) => {
    chai
      .request(functions)
      .post("/getContentFromPdf")
      .send({ notice_content: "Some content" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "No URL was provided");
        done();
      });
  });

  it("should return error when content is too long", (done) => {
    const longContent = "a".repeat(25001);
    chai
      .request(functions)
      .post("/getContentFromPdf")
      .send({ url: "http://example.com", notice_content: longContent })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(
          res.body.error,
          "Parece que o conteúdo do edital é muito longo, por favor, tente novamente com um edital mais curto, ou insira o conteúdo manualmente."
        );
        done();
      });
  });

  it("should process valid input correctly", (done) => {
    const validContent = "This is a valid content.";
    chai
      .request(functions)
      .post("/getContentFromPdf")
      .send({ url: "http://example.com", notice_content: validContent })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        done();
      });
  });
});
