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
          expect(body.topics).to.be.an("array");
          expect(body.topics).to.eql([
            {
              description: "The man, the Mitch, the legend",
              slug: "mitch"
            },
            {
              description: "Not dogs",
              slug: "cats"
            },
            {
              description: "what books are made of",
              slug: "paper"
            }
          ]);
        });
    });
  });

  describe("/api/articles", () => {
    it("GET status:200", () => {
      return request
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an("array");
          expect(body.articles).to.deep.include({
            article_id: 1,
            comment_count: "13",
            created_at: "2018-11-15T12:21:54.171Z",
            title: "Living in the shadow of a great man",
            author: "butter_bridge",
            topic: "mitch",
            votes: 100
          });
        });
    });
    it("author query which filters the articles by the username value specified in the query", () => {
      return request
        .get("/api/articles?author=icellusedkars")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an("array");
          expect(body.articles.length).to.equal(6);
          expect(
            body.articles.every(article => {
              return (article.author = "icellusedkars");
            })
          ).to.be.true;
        });
    });
    it("topic which filters the articles by the topic value specified in the query", () => {
      return request
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an("array");
          expect(body.articles.length).to.equal(11);
          expect(
            body.articles.every(article => {
              return (article.topic = "mitch");
            })
          ).to.be.true;
        });
    });

    it("sort_by, which sorts the articles by any vali100d column (defaults to date)", () => {
      return request
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an("array");
          expect(body.articles[0].votes).to.equal(100);
        });
    });

    it(" order, which can be set to asc or desc for ascending or descending (defaults to descending)", () => {
      return request
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body }) => {
          100;
          expect(body.articles).to.be.an("array");
          expect(body.articles[0].votes).to.equal(0);
        });
    });
  });
  describe("/api/articles", () => {
    it("GET status:200", () => {});
  });
});
