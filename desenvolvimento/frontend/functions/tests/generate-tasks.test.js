import chaiHttp from "chai-http";

import { use, assert } from "chai";
const chai = use(chaiHttp);

import functions from "@google-cloud/functions-framework/testing";

functions.getFunction("generateTasks");

describe("generateTasks", () => {
  it("should return error when no content is provided", (done) => {
    chai
      .request(functions)
      .post("/generateTasks")
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 400);
        assert.include(
          res.body.error,
          "An error occurred while processing the content"
        );
        done();
      });
  });

  it("should generate tasks with valid input", (done) => {
    chai
      .request(functions)
      .post("/generateTasks")
      .send({
        hours: 5,
        notice_content: "Some valid content",
        subjects: ["Math", "Science"],
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        done();
      });
  });

  it("should return error if model processing fails", (done) => {
    chai
      .request(functions)
      .post("/generateTasks")
      .send({
        hours: 5,
        notice_content: "Invalid content",
        subjects: ["Math", "Science"],
      })
      .end((err, res) => {
        assert.equal(res.status, 400);
        assert.include(
          res.body.error,
          "An error occurred while processing the content"
        );
        done();
      });
  });
});
