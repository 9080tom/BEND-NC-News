process.env.NODE_ENV = "test";

const { expect } = require("chai");
const supertest = require("supertest");

const app = require("../app");
const connection = require("../db/connection");

const request = supertest(app);

describe("/", () => {
  beforeEach(() => connection.seed.run());
  after(() => connection.destroy());

  describe("/api", () => {
    it("GET status:200", () => {
      return request
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          expect(body.ok).to.equal(true);
        });
    });
  });

  describe("/api/topics", () => {
    it("GET status:200", () => {
      return request
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          expect(body.topic).to.be.an("array");
          expect(body.topic).to.equal([
            {
              description: "Code is love, code is life",
              slug: "coding"
            },
            {
              description: "FOOTIE!",
              slug: "football"
            },
            {
              description: "Hey good looking, what you got cooking?",
              slug: "cooking"
            }
          ]);
        });
    });
  });
});
