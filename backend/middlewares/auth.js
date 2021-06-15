const jwt = require("jsonwebtoken");
const Post = require("../models/Post");

module.exports.checkAuth = function (req, res, next) {
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
};

module.exports.isAdmin = function (req, res, next) {
	if (req.user.role === "admin") {
		return next();
	}
	res.status(401).send({ error: "Prístup zamietnutý!" });
};

module.exports.isSupervisor = function (req, res, next) {
	if (req.user.role === "admin" || req.user.role === "supervisor") {
		return next();
	}
	res.status(401).send({ error: "Prístup zamietnutý!" });
};

module.exports.isOwnPost = async function (req, res, next) {
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
};
