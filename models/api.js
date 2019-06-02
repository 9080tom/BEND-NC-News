exports.getApiInfo = () => {
  return {
    "GET /api": {
      description:
        "returns up a json representation of all the available endpoints of the api"
    },
    "GET /api/topics": {
      description: "returns an array of all topics",
      queries: [],
      exampleResponse: {
        topics: [
          {
            slug: "coding",
            description: "Code is love, code is life"
          }
        ]
      }
    },
    "GET /api/articles": {
      description:
        "returns an array of all articles and the total count of articles before limiting",
      queries: ["author", "topic", "sort_by", "order", "limit", "p"],
      exampleResponse: {
        articles: {
          articles: [
            {
              author: "weegembump",
              title: "Seafood substitutions are increasing",
              article_id: 33,
              topic: "cooking",
              created_at: "2018-05-30T15:59:13.341Z",
              votes: 0,
              comment_count: "0"
            }
          ],
          total_count: 1
        }
      }
    },
    "POST /api/articles": {
      description: "posts a new article and responds with the new article",
      queries: [],
      exampleBody: {
        "req.body": {
          title: "string",
          body: "string",
          topic: "valid topic in database",
          author: "valid autor in database"
        }
      },
      exampleResponse: {
        article: {
          article_id: 42,
          author: "jessjelly",
          created_at: "2018-05-30T15:59:13.341Z",
          title: "New cooking article",
          topic: "cooking",
          votes: 0,
          comment_count: "0"
        }
      }
    },
    "GET /api/articles/:article_id": {
      description: "returns an single article coresponding to the id",
      queries: [],
      exampleResponse: {
        article: {
          author: "jessjelly",
          title: "Running a Node App",
          article_id: 1,
          topic: "coding",
          created_at: "2016-08-18T12:07:52.389Z",
          votes: 0,
          body:
            "This is part two of a series on how to get up and running with Systemd and Node.js. This part dives deeper into how to successfully run your app with systemd long-term, and how to set it up in a production environment.",
          comment_count: "0"
        }
      }
    },
    "PATCH /api/articles/:article_id": {
      description:
        "increments article votes by inc_votes and returns updated article",
      queries: [],
      exampleBody: {
        "req.body": { inc_votes: "Int" }
      },
      exampleResponse: {
        article: {
          article_id: 1,
          title: "Running a Node App",
          body:
            "This is part two of a series on how to get up and running with Systemd and Node.js. This part dives deeper into how to successfully run your app with systemd long-term, and how to set it up in a production environment.",
          votes: 1,
          topic: "coding",
          author: "jessjelly",
          created_at: "2016-08-18T12:07:52.389Z",
          comment_count: "8"
        }
      }
    },
    "DELETE /api/articles/:article_id": {
      description: "deletes an article and returns no response",
      queries: [],
      exampleResponse: {}
    },
    "GET /api/articles/:article_id/comments": {
      description: "returns an array of comments for an article",
      queries: ["sort_by", "order", "limit", "p"],
      exampleResponse: {
        comments: [
          {
            comment_id: 44,
            author: "grumpy19",
            body:
              "Error est qui id corrupti et quod enim accusantium minus. Deleniti quae ea magni officiis et qui suscipit non.",
            created_at: "2017-11-20T08:58:48.322Z",
            votes: 4
          }
        ]
      }
    },
    "POST /api/articles/:article_id/comments": {
      description:
        "posts a new comment for article and returns the new comment",
      queries: [],
      exampleBody: {
        body: { username: "string", body: "string" }
      },
      exampleResponse: {
        comment: {
          comment_id: 301,
          body: "example",
          votes: 0,
          article_id: 1,
          author: "grumpy19",
          created_at: "2019-04-24T14:56:07.710Z"
        }
      }
    },
    "PATCH /api/comments/:comment_id": {
      description:
        "increments comment votes by inc_votes and returns updated comment",
      queries: [],
      exampleBody: {
        body: { inc_votes: "integer" }
      },
      exampleResponse: {
        comment: {
          comment_id: 301,
          body: "example",
          votes: 1,
          article_id: 1,
          author: "grumpy19",
          created_at: "2019-04-24T14:56:07.710Z"
        }
      }
    },
    "DELETE /api/comments/:comment_id": {
      description: "deletes comment and returns no response",
      queries: [],
      exampleResponse: {}
    },
    "GET /api/users/:username": {
      description: "returns a user object",
      queries: [],
      exampleResponse: {
        user: {
          username: "jessjelly",
          avatar_url:
            "https://s-media-cache-ak0.pinimg.com/564x/39/62/ec/3962eca164e60cf46f979c1f57d4078b.jpg",
          name: "Jess Jelly"
        }
      }
    }
  };
};
