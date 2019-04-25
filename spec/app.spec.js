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
  describe("GET /api/users/:username", () => {
    it("GET status:200 and returns an object", () => {
      return request
        .get("/api/users/butter_bridge")
        .expect(200)
        .then(({ body }) => {
          expect(body.user.username).to.eql("butter_bridge");
        });
    });
  });
  describe("ERROR testing", () => {
    describe("GET /asdfghjkl", () => {
      it("GET status:404 and returns an error object", () => {
        return request
          .get("/asdfghjkl")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.eql("Route Not Found");
          });
      });
    });
    describe("GET /api/asdfghjkl", () => {
      it("GET status:404 and returns an error object", () => {
        return request
          .get("/api/asdfghjkl")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.eql("Route Not Found");
          });
      });
    });
    describe("PATCH / PUT / POST / DELETE... /api/articles etc", () => {
      it("PATCH / PUT / POST / DELETE on /api/topics", () => {
        return request
          .delete("/api/topics")
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).to.eql("Method Not Allowed");
          });
      });
      it("PATCH / PUT / POST / DELETE on /api/articles", () => {
        return request
          .patch("/api/articles")
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).to.eql("Method Not Allowed");
          });
      });

      it("PUT / POST / DELETE on api/articles/:article_id", () => {
        return request
          .delete("/api/articles/2")
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).to.eql("Method Not Allowed");
          });
      });
      it("PATCH / PUT  / DELETE on api/articles/:article_id/comments", () => {
        return request
          .delete("/api/articles/2/comments")
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).to.eql("Method Not Allowed");
          });
      });
      it("GET / PUT / POST  on /api/comments/:comment_id", () => {
        return request
          .post("/api/comments/2")
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).to.eql("Method Not Allowed");
          });
      });
      it("PATCH / PUT / POST / DELETE on /api/users/butter_bridge", () => {
        return request
          .delete("/api/users/butter_bridge")
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).to.eql("Method Not Allowed");
          });
      });
      it("PATCH / PUT / POST / DELETE on /api", () => {
        return request
          .delete("/api")
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).to.eql("Method Not Allowed");
          });
      });
    });
    describe("GET /api/topics", () => {
      it("can detect an incorrect route", () => {
        return request
          .get("/api/topics/aflknd")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.eql("Route Not Found");
          });
      });
    });

    describe("GET /api/articles", () => {
      it("can detect an incorrect sort_by query and return to default", () => {
        return request
          .get("/api/articles?sort_by=bacon")
          .expect(200)
          .then(({ body }) => {
            expect(body.msg).to.eql(undefined);
            expect(body.articles[0]).to.eql({
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

      it("can detect an incorrect order query and return to default", () => {
        return request
          .get("/api/articles?order=bacon")
          .expect(200)
          .then(({ body }) => {
            expect(body.msg).to.eql(undefined);
            expect(body.articles[0]).to.eql({
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
      it("can detect an invalid author query and return to an error", () => {
        return request
          .get("/api/articles?author=bacon")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.eql("username not found");
          });
      });
      it("can detect an invalid topic query and return to an error", () => {
        return request
          .get("/api/articles?topic=bacon")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.eql("topic not found");
          });
      });
    });
    describe("GET /api/articles/:article_id", () => {
      it("can detect an invaild id", () => {
        return request
          .get("/api/articles/aflknd")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.eql("invalid id");
          });
      });
      it("can detect an id with no article", () => {
        return request
          .get("/api/articles/99")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.eql("id not found");
          });
      });
    });
    describe("PATCH /api/articles/:article_id", () => {
      it("can detect an no inc_votes on body", () => {
        return request
          .patch("/api/articles/1")
          .send({})
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.eql("no inc_votes on body");
          });
      });
      it("can detect an invaild id", () => {
        return request
          .patch("/api/articles/1")
          .send({ inc_votes: "cat" })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.eql("inc_votes must be an integer");
          });
      });
      it("can detect an invaild key on the body", () => {
        return request
          .patch("/api/articles/1")
          .send({ inc_votes: 1, potato: 1 })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.eql(
              "inc_votes must be the only key on the body"
            );
          });
      });
    });
  });
});
