process.env.NODE_ENV = "test";

const { expect } = require("chai");
const supertest = require("supertest");

const app = require("../app");
const connection = require("../db/connection");

const request = supertest(app);

describe("/", () => {
  beforeEach(() => connection.seed.run());
  after(() => connection.destroy());
  describe("/*** route-not found", () => {
    it('* - status 404 - returns message "route not found"', () => {
      return request
        .get("/api/notaroute")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal("Route Not Found");
        });
    });
  });
  describe("/api", () => {
    it("PATCH / PUT / POST / DELETE on /api/ - status 405 - method not found", () => {
      return request
        .post("/api")
        .expect(405)
        .then(({ body }) => {
          expect(body.msg).to.equal("Method Not Allowed");
        });
    });
    it("GET - status:200", () => {
      return request
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          expect(body.ok).to.equal(true);
        });
    });
    describe("/topics", () => {
      it("PATCH / PUT / POST / DELETE on /api/topics/ - status 405 - method not found", () => {
        return request
          .post("/api/topics")
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).to.equal("Method Not Allowed");
          });
      });
      it("GET - status: 200 - returns all topics in a topic object", () => {
        return request
          .get("/api/topics/")
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
    describe("/articles", () => {
      it("PATCH / PUT / POST / DELETE on /api/articles/ - status 405 - method not found", () => {
        return request
          .post("/api")
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).to.equal("Method Not Allowed");
          });
      });
      it("GET - status 200 - returns an array of article objects", () => {
        return request
          .get("/api/articles/")
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.an("array");
            expect(body.articles).to.deep.include({
              author: "butter_bridge",
              title: "Living in the shadow of a great man",
              article_id: 1,
              topic: "mitch",
              created_at: "2018-11-15T12:21:54.171Z",
              votes: 100,
              comment_count: "13"
            });
          });
      });
      it("GET - status 200 - filters articles by author specified in the query", () => {
        return request
          .get("/api/articles?author=rogersop")
          .expect(200)
          .then(({ body }) => {
            expect(body.articles.length).to.equal(3);
            expect(body.articles[0]).to.contain.keys(
              "author",
              "title",
              "article_id",
              "topic",
              "created_at",
              "votes",
              "comment_count"
            );
            expect(
              body.articles.every(article => {
                return article.author === "rogersop";
              })
            ).to.be.true;
          });
      });
      it("GET - status 200 - filters articles by topic specified in the query", () => {
        return request.get("/api/articles?topic=mitch").then(({ body }) => {
          expect(body.articles.length).to.equal(11);
          expect(
            body.articles.every(article => {
              return article.topic === "mitch";
            })
          ).to.be.true;
        });
      });
      it("GET - status 200 - sorts the articles by date (desc) as default", () => {
        return request.get("/api/articles").then(({ body }) => {
          expect(body.articles[0].created_at).to.equal(
            "2018-11-15T12:21:54.171Z"
          );
        });
      });
      it("GET - status 200 - sorts the articles (desc) by other valid columns", () => {
        return request
          .get("/api/articles?sort_by=comment_count")
          .then(({ body }) => {
            expect(body.articles[1].comment_count).to.equal("2");
            expect(body.articles[0].comment_count).to.equal("13");
          });
      });
      it("GET - status 200 - can specify order of sort as ascending", () => {
        return request
          .get("/api/articles?sort_by=votes&&order=asc")
          .then(({ body }) => {
            expect(body.articles[0].votes).to.equal(0);
            expect(body.articles[11].votes).to.equal(100);
            expect(body.articles[0].comment_count).to.equal("0");
          });
      });
      it("GET - status 200 - sorts articles by default (date) in default order (desc) if the sort_by query is a column that doesn't exist", () => {
        return request.get("/api/articles?sort_by=invalid").then(({ body }) => {
          expect(body.articles[0].created_at).to.equal(
            "2018-11-15T12:21:54.171Z"
          );
        });
      });
      it("GET - status 200 - sorts articles in default order (desc) if the 'order' query is not 'asc' or 'desc'", () => {
        return request.get("/api/articles?order=invalid").then(({ body }) => {
          expect(body.articles[0].created_at).to.equal(
            "2018-11-15T12:21:54.171Z"
          );
        });
      });
      it("GET - status 404 - returns message 'Not a username' for the query of a username that is not in the database", () => {
        return request
          .get("/api/articles?username=notausername")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal("Username not found");
          });
      });
      it("GET - status 404 - returns message 'Not a topic' for the query of a topic that is not in the database", () => {
        return request
          .get("/api/articles?topic=notatopic")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal("Topic not found");
          });
      });
      it("GET - status 200 - returns an empty array for a username that exists but does not have any articles associated with it", () => {
        return request
          .get("/api/articles?author=lurker")
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.eql([]);
          });
      });
      describe("/articles/:article_id", () => {
        it("PUT / POST / DELETE on /api/articles/ - status 405 - method not found", () => {
          return request
            .post("/api/articles/:article_id")
            .expect(405)
            .then(({ body }) => {
              expect(body.msg).to.equal("Method Not Allowed");
            });
        });
        it("GET - status 200 - returns a single article based on article_id parameter", () => {
          return request.get("/api/articles/1").then(({ body }) => {
            expect(body.article).to.eql({
              author: "butter_bridge",
              title: "Living in the shadow of a great man",
              article_id: 1,
              topic: "mitch",
              created_at: "2018-11-15T12:21:54.171Z",
              votes: 100,
              comment_count: "13",
              body: "I find this existence challenging"
            });
          });
        });
        it("PATCH - status 200 - updates an article's votes when passed an object with a positive number", () => {
          const newVotes = {
            inc_votes: 10
          };
          return request
            .patch("/api/articles/1")
            .send(newVotes)
            .expect(200)
            .then(({ body }) => {
              expect(body.article.votes).to.equal(110);
            });
        });
        it("PATCH - status 200 - updates an article's votes when passed an object with a negative number", () => {
          const newVotes = {
            inc_votes: -10
          };
          return request
            .patch("/api/articles/1")
            .send(newVotes)
            .expect(200)
            .then(({ body }) => {
              expect(body.article.votes).to.equal(90);
            });
        });
        it("GET - status 400 - returns 'Invalid Id' if article_id is invalid", () => {
          return request
            .get("/api/articles/dog/")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Invalid Id");
            });
        });
        it("GET - status 404 - returns 'Not found' if article_id is valid but not found", () => {
          return request
            .get("/api/articles/99999/")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal("Article_id not found");
            });
        });
        it("PATCH - status 400 - returns 'Not valid patch body' if there is no 'inc_votes' key on patch body", () => {
          const malformedVotes = {
            NOT_inc_votes: 10
          };
          return request
            .patch("/api/articles/1")
            .send(malformedVotes)
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Not valid patch body");
            });
        });
        it("PATCH - status 400 - returns 'inc_votes must be an integer' if 'inc_votes' is not an integer", () => {
          const malformedVotes = {
            inc_votes: "cat"
          };
          return request
            .patch("/api/articles/1")
            .send(malformedVotes)
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("inc_votes must be an integer");
            });
        });
        it("PATCH - status 400 - returns 'Not valid patch body' if there is a property on the request body that is not inc_votes", () => {
          const malformedVotes = { inc_votes: 10, name: "Mitch" };
          return request
            .patch("/api/articles/1")
            .send(malformedVotes)
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Not valid patch body");
            });
        });
        it("PATCH - status 200 - ignore a patch request with no iinformation on the body and send the unchanged article", () => {
          const malformedVotes = {};
          return request
            .patch("/api/articles/1")
            .send(malformedVotes)
            .expect(200)
            .then(({ body }) => {
              expect(body.article).to.eql({
                author: "butter_bridge",
                title: "Living in the shadow of a great man",
                article_id: 1,
                topic: "mitch",
                created_at: "2018-11-15T12:21:54.171Z",
                votes: 100,
                comment_count: "13",
                body: "I find this existence challenging"
              });
            });
        });
        describe("/articles/:article_id/comments", () => {
          it("PATCH / PUT / DELETE on /api/articles/:article_id/comments - status 405 - method not found", () => {
            return request
              .delete("/api/articles/:article_id/comments")
              .expect(405)
              .then(({ body }) => {
                expect(body.msg).to.equal("Method Not Allowed");
              });
          });
          it("GET - status 200 - returns an array of comments for the given article_id", () => {
            return request
              .get("/api/articles/1/comments")
              .expect(200)
              .then(({ body }) => {
                expect(body.comments.length).to.equal(13);
              });
          });
          it("POST - status 200 - returns the posted comment when passed a comment object", () => {
            const newComment = {
              username: "rogersop",
              body: "Hello, this is a comment"
            };
            return request
              .post("/api/articles/1/comments")
              .send(newComment)
              .expect(201)
              .then(({ body }) => {
                expect(body.comment).to.contain.keys(
                  "comment_id",
                  "author",
                  "body",
                  "votes",
                  "article_id",
                  "created_at"
                );
                expect(body.comment.comment_id).to.equal(19);
                expect(body.comment.author).to.equal("rogersop");
                expect(body.comment.body).to.equal("Hello, this is a comment");
                expect(body.comment.votes).to.equal(0);
                expect(body.comment.article_id).to.equal(1);
              });
          });
          it("GET - status 200 - sorts the comments by created_at (desc) as default", () => {
            return request.get("/api/articles/1/comments").then(({ body }) => {
              expect(body.comments[0].created_at).to.equal(
                "2016-11-22T12:36:03.389Z"
              );
            });
          });
          it("GET - status 200 - can sort by other valid columns", () => {
            return request
              .get("/api/articles/1/comments?sort_by=votes")
              .then(({ body }) => {
                expect(body.comments[0].votes).to.equal(100);
              });
          });
          it("GET - status 200 - can specify order of sort as ascending", () => {
            return request
              .get("/api/articles/1/comments?sort_by=votes&&order=asc")
              .then(({ body }) => {
                expect(body.comments[0].votes).to.equal(-100);
              });
          });
          it("GET - status 400 - returns 'Invalid Id' if article_id is invalid", () => {
            return request
              .get("/api/articles/dog/comments")
              .expect(400)
              .then(({ body }) => {
                expect(body.msg).to.equal("Invalid Id");
              });
          });
          it("GET - status 404 - returns 'Not found' if article_id is valid but not found", () => {
            return request
              .get("/api/articles/99999/comments")
              .expect(404)
              .then(({ body }) => {
                expect(body.msg).to.equal("Article_id not found");
              });
          });
          it("GET - status 200 - serve an empty array when the article exists but has no comments", () => {
            return request
              .get("/api/articles/3/comments")
              .expect(200)
              .then(({ body }) => {
                expect(body.comments).to.eql([]);
              });
          });
          it("POST - status 400 - returns 'Not valid POST body' if article_id is valid but the request body does not have the correct keys", () => {
            const invalidComment = {
              invalid: "rogersop",
              alsoNotValid: "Hello, this is a comment"
            };
            return request
              .post("/api/articles/1/comments")
              .send(invalidComment)
              .expect(400)
              .then(({ body }) => {
                expect(body.msg).to.equal("Not valid POST body");
              });
          });
          it("POST - status 400 - returns 'Invalid Id' if article_id is invalid", () => {
            const validComment = {
              username: "rogersop",
              body: "Hello, this is a comment"
            };
            return request
              .post("/api/articles/cat/comments")
              .send(validComment)
              .expect(400)
              .then(({ body }) => {
                expect(body.msg).to.equal("Invalid Id");
              });
          });
          it("POST - status 404 - returns 'Article_id is valid but does not exist' if article_id is valid but not found (POST body is valid)", () => {
            const validComment = {
              username: "rogersop",
              body: "Hello, this is a comment"
            };
            return request
              .post("/api/articles/99999/comments")
              .send(validComment)
              .expect(404)
              .then(({ body }) => {
                expect(body.msg).to.equal(
                  "Article_Id is valid but does not exist"
                );
              });
          });
          it("POST - status 400 - returns 'Not valid POST body' if POST body's key values are the incorrect type", () => {
            const invalidComment = {
              username: 2,
              body: 2
            };
            return request
              .post("/api/articles/1/comments")
              .send(invalidComment)
              .expect(400)
              .then(({ body }) => {
                expect(body.msg).to.equal("Not valid POST body");
              });
          });
          it("POST - status 404 - returns 'Username not found' if POST body's user key is not a username", () => {
            const invalidComment = {
              username: "ImNotAUser",
              body: "Hello, this is a comment"
            };
            return request
              .post("/api/articles/1/comments")
              .send(invalidComment)
              .expect(404)
              .then(({ body }) => {
                expect(body.msg).to.equal("Username not found");
              });
          });
        });
      });
      describe("/comments/:comment_id", () => {
        it("GET / PUT / POST on /api/articles/ - status 405 - method not found", () => {
          return request
            .post("/api/comments/:comment_id")
            .expect(405)
            .then(({ body }) => {
              expect(body.msg).to.equal("Method Not Allowed");
            });
        });
        it("PATCH - status 200 - increments the comment's vote property when passed an object", () => {
          const newVotes = { inc_votes: 1 };
          return request
            .patch("/api/comments/1")
            .send(newVotes)
            .expect(200)
            .then(({ body }) => {
              expect(body.comment.body).to.equal(
                "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
              );
              expect(body.comment.votes).to.equal(17);
            });
        });
        it("PATCH - status 200 - decreases the comment's vote property when passed an object", () => {
          const newVotes = { inc_votes: -1 };
          return request
            .patch("/api/comments/1")
            .send(newVotes)
            .expect(200)
            .then(({ body }) => {
              expect(body.comment.body).to.equal(
                "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
              );
              expect(body.comment.votes).to.equal(15);
            });
        });
        it("DELETE - status 204 - returns no content", () => {
          return request.delete("/api/comments/1").expect(204);
        });
        it("PATCH - status 400 - returns 'Not valid patch body' if there is no 'inc_votes' key on patch body", () => {
          const malformedVotes = {
            NOT_inc_votes: 10
          };
          return request
            .patch("/api/comments/1")
            .send(malformedVotes)
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Not valid patch body");
            });
        });
        it("PATCH - status 400 - returns 'inc_votes must be an integer' if 'inc_votes' is not an integer", () => {
          const malformedVotes = {
            inc_votes: "cat"
          };
          return request
            .patch("/api/comments/1")
            .send(malformedVotes)
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("inc_votes must be an integer");
            });
        });
        it("PATCH - status 400 - returns 'Not valid patch body' if there is a property on the request body that is not inc_votes", () => {
          const malformedVotes = { inc_votes: 10, name: "Mitch" };
          return request
            .patch("/api/comments/1")
            .send(malformedVotes)
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Not valid patch body");
            });
        });
        it("PATCH - status 200 - returns the comment if the patch body is empty", () => {
          const malformedVotes = {};
          return request
            .patch("/api/comments/1")
            .send(malformedVotes)
            .expect(200)
            .then(({ body }) => {
              expect(body.comment).to.eql({
                comment_id: 1,
                author: "butter_bridge",
                article_id: 9,
                votes: 16,
                created_at: "2017-11-22T12:36:03.389Z",
                body:
                  "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
              });
            });
        });
        it("PATCH - status 404 - returns 'Not found' when PATCH has a valid comment_id that does not exist", () => {
          const newVotes = { inc_votes: 1 };
          return request
            .patch("/api/comments/9999")
            .send(newVotes)
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal("Id valid but not found");
            });
        });
        it('DELETE - status 400 - returns "Invalid Id" if comment Id is invalid', () => {
          return request
            .delete("/api/comments/dog")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Invalid Id");
            });
        });
        it('DELETE - status 404 - returns "Id valid but not found" when DELETE has a valid comment_id that does not exist', () => {
          return request
            .delete("/api/comments/99999")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal("Id valid but not found");
            });
        });
      });
      describe("/users/:username", () => {
        it("PATCH / PUT / POST / DELETE on /api/users/:username - status 405 - method not found", () => {
          return request
            .post("/api/users/:username")
            .expect(405)
            .then(({ body }) => {
              expect(body.msg).to.equal("Method Not Allowed");
            });
        });
        it("GET - status 200 - returns a user object", () => {
          return request
            .get("/api/users/butter_bridge")
            .expect(200)
            .then(({ body }) => {
              expect(body.user).to.eql({
                username: "butter_bridge",
                avatar_url:
                  "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
                name: "jonny"
              });
            });
        });
        it('GET - status 404 - returns "Username does not exist" if username does not exist', () => {
          return request
            .get("/api/users/notAUsername")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal("Username does not exist");
            });
        });
      });
    });
  });
});
