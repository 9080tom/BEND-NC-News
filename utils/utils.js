exports.timeStapConverter = (arr, key) => {
  return arr.map(element => {
    const date = new Date(element[key]);
    element[key] = date.toISOString();
    return element;
  });
};

exports.swapCreatedByWithAuthor = arr => {
  return arr.map(element => {
    let newElement = { ...element };
    newElement.author = newElement.created_by;
    delete newElement.created_by;
    return newElement;
  });
};

exports.swapBelongsToWithArticleId = function(articles, comments) {
  const articleAndIds = {};
  articles.forEach(article => {
    articleAndIds[article.title] = article.article_id;
  });
  return comments.map(element => {
    let newElement = { ...element };
    newElement.article_id = articleAndIds[newElement.belongs_to];
    delete newElement.belongs_to;
    return newElement;
  });
};
