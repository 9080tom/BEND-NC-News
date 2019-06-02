# BEND-NC-NEWS

## Available Scripts

Create development and test databases locally:

Clone the project

```bash
git clone https://github.com/9080tom/BEND-NC-News
```

Install dependencies

```bash
npm install
```

Setup databases

```bash
npm run setup-dbs
```

Create a new migration file:

```bash
npm run migrate-make <filename>
```

Run all migrations:

```bash
npm run migrate-latest
```

Rollback all migrations:

```bash
npm run migrate-rollback
```

Run tests:

```bash
npm test
```

Rollback, migrate latest, then insert data into the database:

```bash
npm run seed
```

Run the server with `nodemon`, for hot reload:

```bash
npm run dev
```

Run the server with `node`:

```bash
npm start
```

The app should now be running on http://localhost:9090

## Using the API

The following endpoints are available:

```http
GET /api
```

### Responds with

- returns up a json representation of all the available endpoints in the api

---

```http
GET /api/topics
```

### Responds with

- an array of topic objects, each of which has the following properties:
  - `slug`
  - `description`

---

```http
POST /api/topics
```

### Request body accepts

- an object with the following properties:
  - `slug`
  - `description`

### Responds with

- the posted topic which has the following properties:
  - `slug`
  - `description`

---

```http
GET /api/articles
```

### Responds with

an object that contains:

- an `articles` object with an array of article objects, each of which has the following properties:
  - `author`
  - `title`
  - `article_id`
  - `topic`
  - `created_at`
  - `votes`
  - `comment_count`
- a `total_count` property which is the total matched number of articles ingnoring the limit query

### Accepts queries

- `author`, which only resoponds with articles which match the author in the query
- `topic`, which only resoponds with articles which match the topic in the query
- `sort_by`, which sorts the articles by any valid column (defaulting to `created_at`)
- `order`, which can be set to `asc` or `desc` for ascending or descending (defaulting to `desc`)
- `limit`, which limits the number of articles returned (defaulting to `10`)
- `p`, which specifies what page of results to return (defaulting to `10`)

---

```http
POST /api/articles
```

### Request body accepts

- an object with the following properties:
  - `title`
  - `body`
  - `topic`
  - `author`

### Responds with

- the posted article with the following properties:
  - `author`
  - `title`
  - `article_id`
  - `body`
  - `topic`
  - `created_at`
  - `votes`
  - `comment_count`

---

```http
GET /api/articles/:article_id
```

### Responds with

- an article object, which should has the following properties:
  - `author`
  - `title`
  - `article_id`
  - `body`
  - `topic`
  - `created_at`
  - `votes`
  - `comment_count`

---

```http
PATCH /api/articles/:article_id
```

### Request body accepts

- an object in the form `{ inc_votes: newVote }`

  - `newVote` indicates how much the `votes` property in the database will be updated by

  - `{ inc_votes : 1 }` increments the current article's vote property by 1

  - it also excepts negatives such as `{ inc_votes : -1 }` decrements the current article's vote property by 1

### Responds with

- the updated article which should has the following properties:
  - `author`
  - `title`
  - `article_id`
  - `body`
  - `topic`
  - `created_at`
  - `votes`
  - `comment_count`

---

```http
DELETE /api/articles/:article_id
```

### Result

- delete article with id = `article_id`

### Responds with

- status 204, no content

---

```http
GET /api/articles/:article_id/comments
```

### Responds with

- an object containing an array of comments for the given `article_id` of which each comment has the following properties:
  - `comment_id`
  - `votes`
  - `created_at`
  - `author`
  - `body`

### Accepts queries

- `sort_by`, which sorts the comments by any valid column (defaults to created_at)
- `order`, which can be set to `asc` or `desc` for ascending or descending (defaults to `desc`)
- `limit`, which limits the number of articles returned (defaults to `10`)
- `p`, which specifies what page of results to return (defaults to `10`)

---

```http
POST /api/articles/:article_id/comments
```

Request body accepts

- an object with the following properties:
  - `username`
  - `body`

### Responds with

- the comment which is an object which has the following properties:
  - `comment_id`
  - `votes`
  - `created_at`
  - `author`
  - `body`

---

```http
PATCH /api/comments/:comment_id
```

### Request body accepts

- an object in the form `{ inc_votes: newVote }`

  - `newVote` indicates how much the `votes` property in the database will be updated by

  - `{ inc_votes : 1 }` increments the current article's vote property by 1

  - it also excepts negatives such as `{ inc_votes : -1 }` decrements the current article's vote property by 1

### Responds with

- the updated comment which has the following properties:
  - `comment_id`
  - `votes`
  - `created_at`
  - `author`
  - `body`

---

```http
DELETE /api/comments/:comment_id
```

### Result

- delete comment with id = `comment_id`

### Responds with

- status 204 and no content

---

```http
GET /api/users/:username
```

### Responds with

- a user object which has the following properties:
  - `username`
  - `avatar_url`
  - `name`

---

## Prerequisites

- [Node.JS](https://nodejs.org)
- [Heroku account](https://signup.heroku.com/signup/dc)
- [Heroku CLI](https://cli.heroku.com/)

## Built With

- [Node.JS](https://nodejs.org)
- [Express](https://expressjs.com/)
- [Knex.js](https://knexjs.org)
- [PostgreSQL](https://www.postgresql.org/)
- [Chai](https://www.chaijs.com/)
- [Mocha](https://mochajs.org/)
- [SuperTest](https://github.com/visionmedia/supertest)
- [Nodemon](https://nodemon.io/)
