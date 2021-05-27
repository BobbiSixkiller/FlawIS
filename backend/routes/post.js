const router = require("express").Router();

const Post = require("../models/Post");
const { checkAuth, isOwnPost } = require("../middlewares/auth");
const { postValidation } = require("../handlers/validation");

router.get("/", checkAuth, async (req, res) => {
	const posts = await Post.find();

	res.status(200).send(posts);
});

router.get("/:id", checkAuth, async (req, res) => {
	const post = await Post.findOne({ _id: req.params.id });
	if (!post) {
		return res.status(400).send({ error: "Post nebol nájdený." });
	}

	res.status(200).send(post);
});

router.get("/user/:id", checkAuth, async (req, res) => {
	const posts = await Post.find({ userId: req.params.id });
	if (posts.length === 0) {
		return res
			.status(200)
			.send({ msg: "Zadaný používateľ nemá žiadne posty." });
	}

	res.status(200).send(posts);
});

router.post("/add", checkAuth, async (req, res) => {
	const { error } = postValidation(req.body);
	if (error) {
		return res.status(400).send({ error });
	}

	const post = new Post({
		...req.body,
		author: req.user.fullName,
		userId: req.user._id,
	});
	await post.save();

	res.status(200).send({ msg: "Nový post pridaný.", post });
});

router.put("/:id", checkAuth, isOwnPost, async (req, res) => {
	const { error } = postValidation(req.body);
	if (error) {
		return res.status(400).send({ error });
	}

	const post = await Post.findOne({ _id: req.params.id });
	if (!post) {
		return res.status(400).send({ error: "Post nebol nájdený." });
	}

	post.name = req.body.name;
	post.body = req.body.body;
	post.tags = req.body.tags;

	await post.save();

	res.status(200).send({ msg: "Post bol aktualizovaný.", post });
});

router.delete("/:id", checkAuth, isOwnPost, async (req, res) => {
	const post = await Post.findOne({ _id: req.params.id });
	if (!post) {
		return res.status(400).send({ error: "Post nebol nájdený." });
	}

	await post.remove();

	res.status(200).send({ msg: "Post bol zmazaný." });
});

module.exports = router;
