const jwt = require("jsonwebtoken");
const Post = require("../models/Post");

module.exports.checkAuth = function (req, res, next) {
  try {
    const { authorization } = req.cookies;
    const token = authorization.split("Bearer ")[1];

    req.user = jwt.verify(token, process.env.secret);
    next();
  } catch (error) {
    return res
      .status(401)
      .send({ error: true, msg: "Prístup zamietnutý, prosím prihláste sa!" });
  }
};

module.exports.isAdmin = function (req, res, next) {
  if (req.user.role === "admin") {
    return next();
  }
  res.status(401).send({ error: true, msg: "Prístup zamietnutý!" });
};

module.exports.isSupervisor = function (req, res, next) {
  if (req.user.role === "admin" || req.user.role === "supervisor") {
    return next();
  }
  res.status(401).send({ error: true, msg: "Prístup zamietnutý!" });
};

module.exports.isOwnPost = async function (req, res, next) {
  const post = await Post.findOne({ _id: req.params.id });
  if (!post) {
<<<<<<< HEAD
    res.status(404).send({ error: true, msg: "Post nebol nájdený." });
=======
    res.status(400).send({ error: true, msg: "Post nebol nájdený." });
>>>>>>> 1373e2ac8cc4a860090e5acb909ee3de5f810344
  }
  if (
    post.userId == req.user._id ||
    req.user.role === "admin" ||
    req.user.role === "supervisor"
  ) {
    req.post = post;
    return next();
  }
  res.status(401).send({ error: true, msg: "Prístup zamietnutý!" });
};

module.exports.isOwnUser = function (req, res, next) {
  if (
    req.user._id === req.params.id ||
    req.user.role === "admin" ||
    req.user.role === "supervisor"
  ) {
    return next();
  }
  res.status(401).send({ error: true, msg: "Prístup zamietnutý!" });
};
