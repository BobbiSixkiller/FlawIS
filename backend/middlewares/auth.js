const jwt = require("jsonwebtoken");
const { AuthError, NotFoundError } = require("./error");
const Post = require("../models/Post");

module.exports.checkAuth = function (req, res, next) {
<<<<<<< HEAD
	const token = req.header("authorization");
	if (!token)
		return res
			.status(401)
			.send({ error: "Prístup zamietnutý, prosím prihláste sa!" });

	try {
		req.user = jwt.verify(token, process.env.SECRET);
		next();
	} catch (err) {
		res.status(401).send({ error: err.message });
	}
=======
  try {
    const { authorization } = req.cookies;
    const token = authorization.split("Bearer ")[1];

    req.user = jwt.verify(token, process.env.secret);
    next();
  } catch (error) {
    next(new AuthError("Invalid user session, please log in!"));
  }
>>>>>>> dev
};

module.exports.isAdmin = function (req, res, next) {
  if (req.user.role === "admin") {
    return next();
  }
  next(new AuthError("Access denied!"));
};

module.exports.isSupervisor = function (req, res, next) {
  if (req.user.role === "admin" || req.user.role === "supervisor") {
    return next();
  }
  next(new AuthError("Access denied!"));
};

module.exports.isOwnPost = async function (req, res, next) {
<<<<<<< HEAD
	const post = await Post.findOne({ _id: req.params.id });
	if (!post) {
		return res.status(400).send({ error: "Post nebol nájdený." });
	}
	if (
		post.userId === req.params.id ||
		req.user.role === "admin" ||
		req.user.role === "supervisor"
	) {
		req.post = post;
		return next();
	}
	res.status(401).send({ error: "Prístup zamietnutý!" });
=======
  const post = await Post.findOne({ _id: req.params.id });
  if (!post) {
    return next(new NotFoundError("Post nebol nájdený!"));
  }
  if (
    post.userId == req.user._id ||
    req.user.role === "admin" ||
    req.user.role === "supervisor"
  ) {
    req.post = post;
    return next();
  }
  next(new AuthError("Access denied!"));
};

module.exports.isOwnUser = function (req, res, next) {
  if (
    req.user._id === req.params.id ||
    req.user.role === "admin" ||
    req.user.role === "supervisor"
  ) {
    return next();
  }
  next(new AuthError("Access denied!"));
>>>>>>> dev
};
