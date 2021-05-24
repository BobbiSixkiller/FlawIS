const jwt = require("jsonwebtoken");
const User = require("../models/User");

//middleware function pre auth-token check
module.exports.checkAuth = async function (req, res, next) {
	const token = req.header("authToken");
	if (!token)
		return res
			.status(401)
			.send({ error: "Prístup zamietnutý, prosím prihláste sa!" });

	try {
		//vrati rozhashovane user._id
		const id = jwt.verify(token, process.env.SECRET);
		req.user = await User.findOne({ _id: id, "tokens.token": token });
		req.token = token;
		next();
	} catch (err) {
		res.status(401).send({ error: err.message });
	}
};

module.exports.isAdmin = async function (req, res, next) {
	if (!req.user.role === "ADMIN") {
		res.status(401).send({ error: "Prístup zamietnutý, prosím prihláste sa!" });
	}
	next();
};

module.exports.isSupervisor = async function (req, res, next) {
	if (req.user.role === "ADMIN" || req.user.role === "SUPERVISOR") {
		next();
	}
	res.status(401).send({ error: "Prístup zamietnutý, prosím prihláste sa!" });
};
