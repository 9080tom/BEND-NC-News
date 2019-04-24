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
    it("GET status:200 and recives all topics as an array", () => {
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
    it("GET status:200 and recives all articles as an array", () => {
      return request
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an("array");
          expect(body.articles.length).to.equal(12);
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

    it("sort_by, which sorts the articles by any vali1d column (defaults to date)", () => {
      return request
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an("array");
          expect(body.articles[0].votes).to.equal(100);
        });
    });

    it("order, which can be set to asc or desc for ascending or descending (defaults to descending)", () => {
      return request
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an("array");
          expect(body.articles[0].votes).to.equal(0);
        });
    });
  });
  describe("/api/articles/:article_id", () => {
    it("GET status:200 and recives the chosen article as an object", () => {
      return request
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          expect(body.article).to.be.an("object");
          expect(body.article).to.eql({
            article_id: 1,
            comment_count: "13",
            body: "I find this existence challenging",
            created_at: "2018-11-15T12:21:54.171Z",
            title: "Living in the shadow of a great man",
            author: "butter_bridge",
            body: "I find this existence challenging",
            topic: "mitch",
            votes: 100
          });
        });
    });
  });
  describe("/api/articles/:article_id", () => {
    it("PATCH status:200 and recives the chosen article as an object with updated values", () => {
      return request
        .patch("/api/articles/1")
        .send({ inc_votes: 1 })
        .expect(200)
        .then(({ body }) => {
          expect(body.article).to.be.an("object");
          expect(body.article).to.eql({
            article_id: 1,
            comment_count: "13",
            created_at: "2018-11-15T12:21:54.171Z",
            title: "Living in the shadow of a great man",
            body: "I find this existence challenging",
            author: "butter_bridge",
            topic: "mitch",
            votes: 101
          });
        });
    });
  });
  describe("/api/articles/:article_id/comments", () => {
    it("get status:200 and recives the chosen comment as an array", () => {
      return request
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.article).to.be.an("array");
          expect(body.article.length).to.equal(13);
        });
    });
    it("can sort_by which can be set to any column name", () => {
      return request
        .get("/api/articles/1/comments?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.article).to.be.an("array");
          expect(body.article[0].votes).to.equal(100);
        });
    });
    it("can order which can be set to asc or desc for ascending or descending", () => {
      return request
        .get("/api/articles/1/comments?order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.article).to.be.an("array");
          expect(body.article[0].created_at).to.equal(
            "2000-11-26T12:36:03.389Z"
          );
        });
    });
  });

  describe("POST /api/articles/:article_id/comments", () => {
    it("POST status:201 and returns the posted comment as an object", () => {
      return request
        .post("/api/articles/1/comments")
        .send({
          username: "butter_bridge",
          body: "mitch is love, mitch is life"
        })
        .expect(201)
        .then(({ body }) => {
          expect(body.article).to.be.an("object");
          expect(body.article.comment_id).to.eql(19);
          expect(body.article.author).to.equal("butter_bridge");
          expect(body.article.body).to.eql("mitch is love, mitch is life");
        });
    });
  });
  describe("PATCH /api/comments/:comment_id", () => {
    it("PATCH status:200 and returns the updated comment as an object", () => {
      return request
        .patch("/api/comments/10")
        .send({ inc_votes: 2 })
        .expect(200)
        .then(({ body }) => {
          expect(body.article).to.be.an("object");
          expect(body.article.votes).to.eql(2);
          expect(body.article.body).to.eql("git push origin master");
        });
    });
  });
  describe("DELETE /api/comments/:comment_id", () => {
    it("DELETE status:204 and returns nothing", () => {
      return request
        .delete("/api/comments/10")
        .expect(204)
        .then(({ body }) => {});
    });
  });
});
