const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports.checkAuth = async function (req, res, next) {
	const token = req.header("authorization");
	if (!token)
		return res
			.status(401)
			.send({ error: "Prístup zamietnutý, prosím prihláste sa!" });

	try {
		const id = jwt.verify(token, process.env.SECRET);
		req.user = await User.findOne({ _id: id, "tokens.token": token })
			.select("-tokens -password")
			.populate("posts");
		req.token = token;
		next();
	} catch (err) {
		res.status(401).send({ error: err.message });
	}
};

module.exports.isAdmin = async function (req, res, next) {
	if (req.user.role === "admin") {
		return next();
	}
	res.status(401).send({ error: "Prístup zamietnutý!" });
};

module.exports.isSupervisor = async function (req, res, next) {
	if (req.user.role === "admin" || req.user.role === "supervisor") {
		return next();
	}
	res.status(401).send({ error: "Prístup zamietnutý!" });
};

module.exports.isOwnPost = async function (req, res, next) {
	if (
		req.user.posts.some((post) => post._id == req.params.id) ||
		req.user.role === "admin" ||
		req.user.role === "supervisor"
	) {
		return next();
	}
	res.status(401).send({ error: "Prístup zamietnutý!" });
};
