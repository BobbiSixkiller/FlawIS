const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");

//middleware function pre auth-token check
module.exports = async function (req, res, next) {
	const token = req.header("authToken");
	if (!token)
		return res
			.status(401)
			.send({ error: "Prístup zamietnutý, prosím prihláste sa!" });

	try {
		//vrati rozhashovane user._id
		const id = jwt.verify(token, process.env.SECRET);
		req.user = await User.find({ _id: id, "tokens.token": token });
		req.token = token;
		next();
	} catch (err) {
		res.status(401).send({ error: err.message });
	}
};
