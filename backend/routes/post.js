const router = require("express").Router();

const Post = require("../models/Post");
const { checkAuth } = require("../middlewares/auth");
const { postValidation } = require("../handlers/validation");

router.get("/", checkAuth, async (req, res) => {
	const posts = await Post.find();

	res.status(200).send(posts);
});

router.post("/add", checkAuth, async (req, res) => {
	const { error } = postValidation(req.body);
	if (error) {
		res.status(400).send({ error });
	}
	res.status(200).send(validation);
});

module.exports = router;
