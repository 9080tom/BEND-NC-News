exports.timeStapConverter = (arr, key) => {
  let newArr = JSON.parse(JSON.stringify(arr));
  newArr.forEach(element => {
    const date = new Date(element[key]);
    element[key] = date.toISOString();
  });
  return newArr;
};

exports.swapCreatedByWithAuthor = arr => {
  let newArr = JSON.parse(JSON.stringify(arr));
  newArr.forEach(element => {
    element.author = element.created_by;
    delete element.created_by;
  });
  return newArr;
};

exports.swapBelongsToWithArticleId = function(articles, comments) {
  const articleAndIds = {};
  articles.forEach(article => {
    articleAndIds[article.title] = article.article_id;
  });
  const newComments = JSON.parse(JSON.stringify(comments));

  newComments.forEach(comment => {
    comment.article_id = articleAndIds[comment.belongs_to];
    delete comment.belongs_to;
  });
  return newComments;
};
