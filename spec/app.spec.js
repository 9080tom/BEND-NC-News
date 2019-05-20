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
        .get("/api/articles?limit=20")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.articles).to.be.an("array");
          expect(body.articles.articles.length).to.equal(12);
          expect(body.articles.articles).to.deep.include({
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
          expect(body.articles.articles).to.be.an("array");
          expect(body.articles.articles.length).to.equal(6);
          expect(
            body.articles.articles.every(article => {
              return (article.author = "icellusedkars");
            })
          ).to.be.true;
        });
    });
    it("topic which filters the articles by the topic value specified in the query", () => {
      return request
        .get("/api/articles?topic=mitch&limit=20")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.articles).to.be.an("array");
          expect(body.articles.articles.length).to.equal(11);
          expect(
            body.articles.articles.every(article => {
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
          expect(body.articles.articles).to.be.an("array");
          expect(body.articles.articles[0].votes).to.equal(100);
        });
    });

    it("order, which can be set to asc or desc for ascending or descending (defaults to descending)", () => {
      return request
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.articles).to.be.an("array");
          expect(body.articles.articles[0].votes).to.equal(0);
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
  describe("GET /api/articles/:article_id/comments", () => {
    it("get status:200 and recives the chosen comment as an array", () => {
      return request
        .get("/api/articles/1/comments?limit=20")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).to.be.an("array");
          expect(body.comments.length).to.equal(13);
        });
    });
    it("can sort_by which can be set to any column name", () => {
      return request
        .get("/api/articles/1/comments?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).to.be.an("array");
          expect(body.comments[0].votes).to.equal(100);
        });
    });
    it("can order which can be set to asc or desc for ascending or descending", () => {
      return request
        .get("/api/articles/1/comments?order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).to.be.an("array");
          expect(body.comments[0].created_at).to.equal(
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
          expect(body.comment).to.be.an("object");
          expect(body.comment.comment_id).to.eql(19);
          expect(body.comment.author).to.equal("butter_bridge");
          expect(body.comment.body).to.eql("mitch is love, mitch is life");
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
          expect(body.comment).to.be.an("object");
          expect(body.comment.votes).to.eql(2);
          expect(body.comment.body).to.eql("git push origin master");
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
            expect(body.articles.articles[0]).to.eql({
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
            expect(body.articles.articles[0]).to.eql({
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
      it("can detect an no inc_votes on body and instead sends the article", () => {
        return request
          .patch("/api/articles/1")
          .send({})
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
    describe("GET /api/articles/:article_id/comments", () => {
      it("Bad article_id", () => {
        return request
          .get("/api/articles/cheese/comments")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.eql("invalid id");
          });
      });
      it("Well formed article_id that doesn't exist in the database", () => {
        return request
          .get("/api/articles/99/comments")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.eql("id not found");
          });
      });
      it("can detect an incorrect order query and return to default", () => {
        return request
          .get("/api/articles/1/comments?order=bacon")
          .expect(200)
          .then(({ body }) => {
            expect(body.msg).to.eql(undefined);
            expect(body.comments[0]).to.eql({
              body:
                "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
              comment_id: 2,
              created_at: "2016-11-22T12:36:03.389Z",
              votes: 14,
              author: "butter_bridge"
            });
          });
      });
      it("can detect an incorrect sort_by query and return to default", () => {
        return request
          .get("/api/articles/1/comments?sort_by=bacon")
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.an("array");
            expect(body.comments[0].created_at).to.equal(
              "2016-11-22T12:36:03.389Z"
            );
          });
      });
    });
    describe("POST /api/articles/:article_id/comments", () => {
      it("body doesnt have the corect keys", () => {
        return request
          .post("/api/articles/1/comments")
          .send({})
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal("incorect keys on body");
          });
      });
      it("invalid article id", () => {
        return request
          .post("/api/articles/bacon/comments")
          .send({
            username: "butter_bridge",
            body: "mitch is love, mitch is life"
          })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal("invalid id");
          });
      });
      it("article id is vaild but doesnt exist", () => {
        return request
          .post("/api/articles/99/comments")
          .send({
            username: "butter_bridge",
            body: "mitch is love, mitch is life"
          })
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal("id is not present");
          });
      });
      it("username is not in users", () => {
        return request
          .post("/api/articles/1/comments")
          .expect(404)
          .send({
            username: "butter_bad",
            body: "mitch is love, mitch is life"
          })
          .then(({ body }) => {
            expect(body.msg).to.equal("username not found");
          });
      });
      it("body is a string", () => {
        return request
          .post("/api/articles/1/comments")
          .expect(400)
          .send({
            username: "butter_bridge",
            body: 8
          })
          .then(({ body }) => {
            expect(body.msg).to.equal("body must be a string");
          });
      });
    });

    describe("PATCH /api/comments/:comment_id", () => {
      it("can detect an no inc_votes on body and return the comment", () => {
        return request
          .patch("/api/comments/1")
          .send({})
          .expect(200)
          .then(({ body }) => {
            expect(body.comment).to.be.an("object");
            expect(body.comment).to.eql({
              article_id: 9,
              author: "butter_bridge",
              body:
                "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
              comment_id: 1,
              created_at: "2017-11-22T12:36:03.389Z",
              votes: 16
            });
          });
      });
      it("can detect an invaild id", () => {
        return request
          .patch("/api/comments/1")
          .send({ inc_votes: "cat" })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.eql("inc_votes must be an integer");
          });
      });
      it("can detect an invaild key on the body", () => {
        return request
          .patch("/api/comments/1")
          .send({ inc_votes: 1, potato: 1 })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.eql(
              "inc_votes must be the only key on the body"
            );
          });
      });
      it("comment_id is vaild but doesnt exist", () => {
        return request
          .patch("/api/comments/99")
          .send({ inc_votes: 1 })

          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.eql("id not found");
          });
      });
    });
    describe("DELETE /api/comments/:comment_id", () => {
      it("invalid comment_id", () => {
        return request
          .delete("/api/comments/hsvbjv")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.eql("invalid id");
          });
      });
      it("comment_id is vaild but doesnt exist", () => {
        return request
          .delete("/api/comments/99")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.eql("id not found");
          });
      });
    });
    describe("GET /api/users/:username", () => {
      it("username but doesnt exist", () => {
        return request
          .get("/api/users/hsvbjv")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.eql("id not found");
          });
      });
    });
    describe("post /api/articles/", () => {
      it("POST - status 201 - returns the new article when passed a comment object", () => {
        const newArticle = {
          username: "rogersop",
          title: "Article Title",
          topic: "mitch",
          body: "Hello, this is an article body"
        };
        return request
          .post("/api/articles/")
          .send(newArticle)
          .expect(201)
          .then(({ body }) => {
            expect(body.article).to.contain.keys(
              "author",
              "title",
              "article_id",
              "topic",
              "created_at",
              "body",
              "votes",
              "comment_count"
            );
            expect(body.article.author).to.equal("rogersop");
            expect(body.article.title).to.equal("Article Title");
            expect(body.article.article_id).to.equal(13);
            expect(body.article.topic).to.equal("mitch");
            expect(body.article.body).to.equal(
              "Hello, this is an article body"
            );
            expect(body.article.votes).to.equal(0);
            expect(body.article.comment_count).to.equal(0);
          });
      });
      it("POST - status 400 - returns 'Not valid POST body' if request body does not have the correct keys", () => {
        const invalidArticle = {
          invalid: "rogersop",
          alsoNotValid: "Article Title",
          notValidEither: "mitch",
          invalidBody: "Hello, this is an article body"
        };
        return request
          .post("/api/articles/")
          .send(invalidArticle)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal("Not valid POST body");
          });
      });
      it("POST - status 400 - returns 'Not valid POST body' if POST body's key values are the incorrect type", () => {
        const invalidArticle = {
          username: "rogersop",
          title: 2,
          topic: "mitch",
          body: 2
        };
        return request
          .post("/api/articles/")
          .send(invalidArticle)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal("Not valid POST body");
          });
      });
      it("POST - status 404 - returns 'Username not found' if POST body is valid but user key is not a username", () => {
        const validArticle = {
          username: "notAUser",
          title: "Article Title",
          topic: "mitch",
          body: "Hello, this is an article body"
        };
        return request
          .post("/api/articles/")
          .send(validArticle)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal("Username not found");
          });
      });
      it("POST - status 404 - returns 'Topic not found' if POST body is valid but topic key is not a topic", () => {
        const validArticle = {
          username: "rogersop",
          title: "Article Title",
          topic: "notATopic",
          body: "Hello, this is an article body"
        };
        return request
          .post("/api/articles/")
          .send(validArticle)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal("Topic not found");
          });
      });
    });
  });
});
// describe("/", () => {
//   beforeEach(() => connection.seed.run());
//   after(() => connection.destroy());
//   describe("/*** route-not found", () => {
//     it('* - status 404 - returns message "route not found"', () => {
//       return request
//         .get("/api/notaroute")
//         .expect(404)
//         .then(({ body }) => {
//           expect(body.msg).to.equal("Route Not Found");
//         });
//     });
//   });
//   describe("/api", () => {
//     it("PATCH / PUT / POST / DELETE on /api/ - status 405 - method not found", () => {
//       return request
//         .post("/api")
//         .expect(405)
//         .then(({ body }) => {
//           expect(body.msg).to.equal("Method Not Allowed");
//         });
//     });
//     it("GET - status:200", () => {
//       return request
//         .get("/api")
//         .expect(200)
//         .then(({ body }) => {
//           expect(body.ok).to.equal(true);
//         });
//     });
//     describe("/topics", () => {
//       it("PATCH / PUT / POST / DELETE on /api/topics/ - status 405 - method not found", () => {
//         return request
//           .post("/api/topics")
//           .expect(405)
//           .then(({ body }) => {
//             expect(body.msg).to.equal("Method Not Allowed");
//           });
//       });
//       it("GET - status: 200 - returns all topics in a topic object", () => {
//         return request
//           .get("/api/topics/")
//           .expect(200)
//           .then(({ body }) => {
//             expect(body.topics).to.be.an("array");
//             expect(body.topics).to.eql([
//               {
//                 description: "The man, the Mitch, the legend",
//                 slug: "mitch"
//               },
//               {
//                 description: "Not dogs",
//                 slug: "cats"
//               },
//               {
//                 description: "what books are made of",
//                 slug: "paper"
//               }
//             ]);
//           });
//       });
//     });
//     describe("/articles", () => {
//       it("PATCH / PUT / POST / DELETE on /api/articles/ - status 405 - method not found", () => {
//         return request
//           .post("/api")
//           .expect(405)
//           .then(({ body }) => {
//             expect(body.msg).to.equal("Method Not Allowed");
//           });
//       });
//       it("GET - status 200 - returns an array of article objects", () => {
//         return request
//           .get("/api/articles/")
//           .expect(200)
//           .then(({ body }) => {
//             expect(body.articles).to.be.an("array");
//             expect(body.articles).to.deep.include({
//               author: "butter_bridge",
//               title: "Living in the shadow of a great man",
//               article_id: 1,
//               topic: "mitch",
//               created_at: "2018-11-15T12:21:54.171Z",
//               votes: 100,
//               comment_count: "13"
//             });
//           });
//       });
//       it("GET - status 200 - filters articles by author specified in the query", () => {
//         return request
//           .get("/api/articles?author=rogersop")
//           .expect(200)
//           .then(({ body }) => {
//             expect(body.articles.length).to.equal(3);
//             expect(body.articles[0]).to.contain.keys(
//               "author",
//               "title",
//               "article_id",
//               "topic",
//               "created_at",
//               "votes",
//               "comment_count"
//             );
//             expect(
//               body.articles.every(article => {
//                 return article.author === "rogersop";
//               })
//             ).to.be.true;
//           });
//       });
//       it("GET - status 200 - filters articles by topic specified in the query", () => {
//         return request.get("/api/articles?topic=mitch").then(({ body }) => {
//           expect(body.articles.length).to.equal(11);
//           expect(
//             body.articles.every(article => {
//               return article.topic === "mitch";
//             })
//           ).to.be.true;
//         });
//       });
//       it("GET - status 200 - sorts the articles by date (desc) as default", () => {
//         return request.get("/api/articles").then(({ body }) => {
//           expect(body.articles[0].created_at).to.equal(
//             "2018-11-15T12:21:54.171Z"
//           );
//         });
//       });
//       it("GET - status 200 - sorts the articles (desc) by other valid columns", () => {
//         return request
//           .get("/api/articles?sort_by=comment_count")
//           .then(({ body }) => {
//             expect(body.articles[1].comment_count).to.equal("2");
//             expect(body.articles[0].comment_count).to.equal("13");
//           });
//       });
//       it("GET - status 200 - can specify order of sort as ascending", () => {
//         return request
//           .get("/api/articles?sort_by=votes&&order=asc")
//           .then(({ body }) => {
//             expect(body.articles[0].votes).to.equal(0);
//             expect(body.articles[11].votes).to.equal(100);
//             expect(body.articles[0].comment_count).to.equal("0");
//           });
//       });
//       it("GET - status 200 - sorts articles by default (date) in default order (desc) if the sort_by query is a column that doesn't exist", () => {
//         return request.get("/api/articles?sort_by=invalid").then(({ body }) => {
//           expect(body.articles[0].created_at).to.equal(
//             "2018-11-15T12:21:54.171Z"
//           );
//         });
//       });
//       it("GET - status 200 - sorts articles in default order (desc) if the 'order' query is not 'asc' or 'desc'", () => {
//         return request.get("/api/articles?order=invalid").then(({ body }) => {
//           expect(body.articles[0].created_at).to.equal(
//             "2018-11-15T12:21:54.171Z"
//           );
//         });
//       });
//       it("GET - status 404 - returns message 'Not a username' for the query of a username that is not in the database", () => {
//         return request
//           .get("/api/articles?username=notausername")
//           .expect(404)
//           .then(({ body }) => {
//             expect(body.msg).to.equal("Username not found");
//           });
//       });
//       it("GET - status 404 - returns message 'Not a topic' for the query of a topic that is not in the database", () => {
//         return request
//           .get("/api/articles?topic=notatopic")
//           .expect(404)
//           .then(({ body }) => {
//             expect(body.msg).to.equal("Topic not found");
//           });
//       });
//       it("GET - status 200 - returns an empty array for a username that exists but does not have any articles associated with it", () => {
//         return request
//           .get("/api/articles?author=lurker")
//           .expect(200)
//           .then(({ body }) => {
//             expect(body.articles).to.eql([]);
//           });
//       });
//       describe("/articles/:article_id", () => {
//         it("PUT / POST / DELETE on /api/articles/ - status 405 - method not found", () => {
//           return request
//             .post("/api/articles/:article_id")
//             .expect(405)
//             .then(({ body }) => {
//               expect(body.msg).to.equal("Method Not Allowed");
//             });
//         });
//         it("GET - status 200 - returns a single article based on article_id parameter", () => {
//           return request.get("/api/articles/1").then(({ body }) => {
//             expect(body.article).to.eql({
//               author: "butter_bridge",
//               title: "Living in the shadow of a great man",
//               article_id: 1,
//               topic: "mitch",
//               created_at: "2018-11-15T12:21:54.171Z",
//               votes: 100,
//               comment_count: "13",
//               body: "I find this existence challenging"
//             });
//           });
//         });
//         it("PATCH - status 200 - updates an article's votes when passed an object with a positive number", () => {
//           const newVotes = {
//             inc_votes: 10
//           };
//           return request
//             .patch("/api/articles/1")
//             .send(newVotes)
//             .expect(200)
//             .then(({ body }) => {
//               expect(body.article.votes).to.equal(110);
//             });
//         });
//         it("PATCH - status 200 - updates an article's votes when passed an object with a negative number", () => {
//           const newVotes = {
//             inc_votes: -10
//           };
//           return request
//             .patch("/api/articles/1")
//             .send(newVotes)
//             .expect(200)
//             .then(({ body }) => {
//               expect(body.article.votes).to.equal(90);
//             });
//         });
//         it("GET - status 400 - returns 'Invalid Id' if article_id is invalid", () => {
//           return request
//             .get("/api/articles/dog/")
//             .expect(400)
//             .then(({ body }) => {
//               expect(body.msg).to.equal("Invalid Id");
//             });
//         });
//         it("GET - status 404 - returns 'Not found' if article_id is valid but not found", () => {
//           return request
//             .get("/api/articles/99999/")
//             .expect(404)
//             .then(({ body }) => {
//               expect(body.msg).to.equal("Article_id not found");
//             });
//         });
//         it("PATCH - status 400 - returns 'Not valid patch body' if there is no 'inc_votes' key on patch body", () => {
//           const malformedVotes = {
//             NOT_inc_votes: 10
//           };
//           return request
//             .patch("/api/articles/1")
//             .send(malformedVotes)
//             .expect(400)
//             .then(({ body }) => {
//               expect(body.msg).to.equal("Not valid patch body");
//             });
//         });
//         it("PATCH - status 400 - returns 'inc_votes must be an integer' if 'inc_votes' is not an integer", () => {
//           const malformedVotes = {
//             inc_votes: "cat"
//           };
//           return request
//             .patch("/api/articles/1")
//             .send(malformedVotes)
//             .expect(400)
//             .then(({ body }) => {
//               expect(body.msg).to.equal("inc_votes must be an integer");
//             });
//         });
//         it("PATCH - status 400 - returns 'Not valid patch body' if there is a property on the request body that is not inc_votes", () => {
//           const malformedVotes = { inc_votes: 10, name: "Mitch" };
//           return request
//             .patch("/api/articles/1")
//             .send(malformedVotes)
//             .expect(400)
//             .then(({ body }) => {
//               expect(body.msg).to.equal("Not valid patch body");
//             });
//         });
//         it("PATCH - status 200 - ignore a patch request with no iinformation on the body and send the unchanged article", () => {
//           const malformedVotes = {};
//           return request
//             .patch("/api/articles/1")
//             .send(malformedVotes)
//             .expect(200)
//             .then(({ body }) => {
//               expect(body.article).to.eql({
//                 author: "butter_bridge",
//                 title: "Living in the shadow of a great man",
//                 article_id: 1,
//                 topic: "mitch",
//                 created_at: "2018-11-15T12:21:54.171Z",
//                 votes: 100,
//                 comment_count: "13",
//                 body: "I find this existence challenging"
//               });
//             });
//         });
//         describe("/articles/:article_id/comments", () => {
//           it("PATCH / PUT / DELETE on /api/articles/:article_id/comments - status 405 - method not found", () => {
//             return request
//               .delete("/api/articles/:article_id/comments")
//               .expect(405)
//               .then(({ body }) => {
//                 expect(body.msg).to.equal("Method Not Allowed");
//               });
//           });
//           it("GET - status 200 - returns an array of comments for the given article_id", () => {
//             return request
//               .get("/api/articles/1/comments")
//               .expect(200)
//               .then(({ body }) => {
//                 expect(body.comments.length).to.equal(13);
//               });
//           });
//           it("POST - status 200 - returns the posted comment when passed a comment object", () => {
//             const newComment = {
//               username: "rogersop",
//               body: "Hello, this is a comment"
//             };
//             return request
//               .post("/api/articles/1/comments")
//               .send(newComment)
//               .expect(201)
//               .then(({ body }) => {
//                 expect(body.comment).to.contain.keys(
//                   "comment_id",
//                   "author",
//                   "body",
//                   "votes",
//                   "article_id",
//                   "created_at"
//                 );
//                 expect(body.comment.comment_id).to.equal(19);
//                 expect(body.comment.author).to.equal("rogersop");
//                 expect(body.comment.body).to.equal("Hello, this is a comment");
//                 expect(body.comment.votes).to.equal(0);
//                 expect(body.comment.article_id).to.equal(1);
//               });
//           });
//           it("GET - status 200 - sorts the comments by created_at (desc) as default", () => {
//             return request.get("/api/articles/1/comments").then(({ body }) => {
//               expect(body.comments[0].created_at).to.equal(
//                 "2016-11-22T12:36:03.389Z"
//               );
//             });
//           });
//           it("GET - status 200 - can sort by other valid columns", () => {
//             return request
//               .get("/api/articles/1/comments?sort_by=votes")
//               .then(({ body }) => {
//                 expect(body.comments[0].votes).to.equal(100);
//               });
//           });
//           it("GET - status 200 - can specify order of sort as ascending", () => {
//             return request
//               .get("/api/articles/1/comments?sort_by=votes&&order=asc")
//               .then(({ body }) => {
//                 expect(body.comments[0].votes).to.equal(-100);
//               });
//           });
//           it("GET - status 400 - returns 'Invalid Id' if article_id is invalid", () => {
//             return request
//               .get("/api/articles/dog/comments")
//               .expect(400)
//               .then(({ body }) => {
//                 expect(body.msg).to.equal("Invalid Id");
//               });
//           });
//           it("GET - status 404 - returns 'Not found' if article_id is valid but not found", () => {
//             return request
//               .get("/api/articles/99999/comments")
//               .expect(404)
//               .then(({ body }) => {
//                 expect(body.msg).to.equal("Article_id not found");
//               });
//           });
//           it("GET - status 200 - serve an empty array when the article exists but has no comments", () => {
//             return request
//               .get("/api/articles/3/comments")
//               .expect(200)
//               .then(({ body }) => {
//                 expect(body.comments).to.eql([]);
//               });
//           });
//           it("POST - status 400 - returns 'Not valid POST body' if article_id is valid but the request body does not have the correct keys", () => {
//             const invalidComment = {
//               invalid: "rogersop",
//               alsoNotValid: "Hello, this is a comment"
//             };
//             return request
//               .post("/api/articles/1/comments")
//               .send(invalidComment)
//               .expect(400)
//               .then(({ body }) => {
//                 expect(body.msg).to.equal("Not valid POST body");
//               });
//           });
//           it("POST - status 400 - returns 'Invalid Id' if article_id is invalid", () => {
//             const validComment = {
//               username: "rogersop",
//               body: "Hello, this is a comment"
//             };
//             return request
//               .post("/api/articles/cat/comments")
//               .send(validComment)
//               .expect(400)
//               .then(({ body }) => {
//                 expect(body.msg).to.equal("Invalid Id");
//               });
//           });
//           it("POST - status 404 - returns 'Article_id is valid but does not exist' if article_id is valid but not found (POST body is valid)", () => {
//             const validComment = {
//               username: "rogersop",
//               body: "Hello, this is a comment"
//             };
//             return request
//               .post("/api/articles/99999/comments")
//               .send(validComment)
//               .expect(404)
//               .then(({ body }) => {
//                 expect(body.msg).to.equal(
//                   "Article_Id is valid but does not exist"
//                 );
//               });
//           });
//           it("POST - status 400 - returns 'Not valid POST body' if POST body's key values are the incorrect type", () => {
//             const invalidComment = {
//               username: 2,
//               body: 2
//             };
//             return request
//               .post("/api/articles/1/comments")
//               .send(invalidComment)
//               .expect(400)
//               .then(({ body }) => {
//                 expect(body.msg).to.equal("Not valid POST body");
//               });
//           });
//           it("POST - status 404 - returns 'Username not found' if POST body's user key is not a username", () => {
//             const invalidComment = {
//               username: "ImNotAUser",
//               body: "Hello, this is a comment"
//             };
//             return request
//               .post("/api/articles/1/comments")
//               .send(invalidComment)
//               .expect(404)
//               .then(({ body }) => {
//                 expect(body.msg).to.equal("Username not found");
//               });
//           });
//         });
//       });
//       describe("/comments/:comment_id", () => {
//         it("GET / PUT / POST on /api/articles/ - status 405 - method not found", () => {
//           return request
//             .post("/api/comments/:comment_id")
//             .expect(405)
//             .then(({ body }) => {
//               expect(body.msg).to.equal("Method Not Allowed");
//             });
//         });
//         it("PATCH - status 200 - increments the comment's vote property when passed an object", () => {
//           const newVotes = { inc_votes: 1 };
//           return request
//             .patch("/api/comments/1")
//             .send(newVotes)
//             .expect(200)
//             .then(({ body }) => {
//               expect(body.comment.body).to.equal(
//                 "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
//               );
//               expect(body.comment.votes).to.equal(17);
//             });
//         });
//         it("PATCH - status 200 - decreases the comment's vote property when passed an object", () => {
//           const newVotes = { inc_votes: -1 };
//           return request
//             .patch("/api/comments/1")
//             .send(newVotes)
//             .expect(200)
//             .then(({ body }) => {
//               expect(body.comment.body).to.equal(
//                 "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
//               );
//               expect(body.comment.votes).to.equal(15);
//             });
//         });
//         it("DELETE - status 204 - returns no content", () => {
//           return request.delete("/api/comments/1").expect(204);
//         });
//         it("PATCH - status 400 - returns 'Not valid patch body' if there is no 'inc_votes' key on patch body", () => {
//           const malformedVotes = {
//             NOT_inc_votes: 10
//           };
//           return request
//             .patch("/api/comments/1")
//             .send(malformedVotes)
//             .expect(400)
//             .then(({ body }) => {
//               expect(body.msg).to.equal("Not valid patch body");
//             });
//         });
//         it("PATCH - status 400 - returns 'inc_votes must be an integer' if 'inc_votes' is not an integer", () => {
//           const malformedVotes = {
//             inc_votes: "cat"
//           };
//           return request
//             .patch("/api/comments/1")
//             .send(malformedVotes)
//             .expect(400)
//             .then(({ body }) => {
//               expect(body.msg).to.equal("inc_votes must be an integer");
//             });
//         });
//         it("PATCH - status 400 - returns 'Not valid patch body' if there is a property on the request body that is not inc_votes", () => {
//           const malformedVotes = { inc_votes: 10, name: "Mitch" };
//           return request
//             .patch("/api/comments/1")
//             .send(malformedVotes)
//             .expect(400)
//             .then(({ body }) => {
//               expect(body.msg).to.equal("Not valid patch body");
//             });
//         });
//         it("PATCH - status 200 - returns the comment if the patch body is empty", () => {
//           const malformedVotes = {};
//           return request
//             .patch("/api/comments/1")
//             .send(malformedVotes)
//             .expect(200)
//             .then(({ body }) => {
//               expect(body.comment).to.eql({
//                 comment_id: 1,
//                 author: "butter_bridge",
//                 article_id: 9,
//                 votes: 16,
//                 created_at: "2017-11-22T12:36:03.389Z",
//                 body:
//                   "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
//               });
//             });
//         });
//         it("PATCH - status 404 - returns 'Not found' when PATCH has a valid comment_id that does not exist", () => {
//           const newVotes = { inc_votes: 1 };
//           return request
//             .patch("/api/comments/9999")
//             .send(newVotes)
//             .expect(404)
//             .then(({ body }) => {
//               expect(body.msg).to.equal("Id valid but not found");
//             });
//         });
//         it('DELETE - status 400 - returns "Invalid Id" if comment Id is invalid', () => {
//           return request
//             .delete("/api/comments/dog")
//             .expect(400)
//             .then(({ body }) => {
//               expect(body.msg).to.equal("Invalid Id");
//             });
//         });
//         it('DELETE - status 404 - returns "Id valid but not found" when DELETE has a valid comment_id that does not exist', () => {
//           return request
//             .delete("/api/comments/99999")
//             .expect(404)
//             .then(({ body }) => {
//               expect(body.msg).to.equal("Id valid but not found");
//             });
//         });
//       });
//       describe("/users/:username", () => {
//         it("PATCH / PUT / POST / DELETE on /api/users/:username - status 405 - method not found", () => {
//           return request
//             .post("/api/users/:username")
//             .expect(405)
//             .then(({ body }) => {
//               expect(body.msg).to.equal("Method Not Allowed");
//             });
//         });
//         it("GET - status 200 - returns a user object", () => {
//           return request
//             .get("/api/users/butter_bridge")
//             .expect(200)
//             .then(({ body }) => {
//               expect(body.user).to.eql({
//                 username: "butter_bridge",
//                 avatar_url:
//                   "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
//                 name: "jonny"
//               });
//             });
//         });
//         it('GET - status 404 - returns "Username does not exist" if username does not exist', () => {
//           return request
//             .get("/api/users/notAUsername")
//             .expect(404)
//             .then(({ body }) => {
//               expect(body.msg).to.equal("Username does not exist");
//             });
//         });
//       });
//     });
//   });
// });
