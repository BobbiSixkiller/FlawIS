const router = require("express").Router();

const Post = require("../models/Post");
const { checkAuth, isOwnPost } = require("../middlewares/auth");
const { postValidation } = require("../handlers/validation");

router.get("/api/search", checkAuth, async (req, res) => {
	const pageSize = parseInt(req.query.size || 9);
	const page = parseInt(req.query.page || 1);

	const [posts, total] = await Promise.all([
		Post.find(
			{ $text: { $search: req.query.q } },
			{ score: { $meta: "textScore" } }
		)
			.sort({ score: { $meta: "textScore" } })
			.skip(page * pageSize - pageSize)
			.limit(pageSize),
		Post.countDocuments(),
	]);

	res
		.status(200)
		.send({ posts, pages: Math.ceil(total / pageSize), query: req.query.q });
});

router.get("/", checkAuth, async (req, res) => {
	const pageSize = parseInt(req.query.size || 9);
	const page = parseInt(req.query.page || 1);

	const [posts, total] = await Promise.all([
		Post.find()
			.skip(page * pageSize - pageSize)
			.limit(pageSize)
			.sort({ updatedAt: -1 }),
		Post.countDocuments(),
	]);

	res.status(200).send({ posts, pages: Math.ceil(total / pageSize) });
});

router.get("/user/:id", checkAuth, async (req, res) => {
	const pageSize = parseInt(req.query.size || 9);
	const page = parseInt(req.query.page || 1);

	const [posts, total] = await Promise.all([
		Post.find({ userId: req.params.id })
			.skip(page * pageSize - pageSize)
			.limit(pageSize)
			.sort({ updatedAt: -1 }),
		Post.countDocuments(),
	]);
	if (posts.length === 0) {
		return res
			.status(200)
			.send({ msg: "Zadaný používateľ nemá žiadne posty." });
	}

	res.status(200).send({ posts, pages: Math.ceil(total / pageSize) });
});

router.get("/:id", checkAuth, async (req, res) => {
	const post = await Post.findOne({ _id: req.params.id });
	if (!post) {
		return res.status(400).send({ error: "Post nebol nájdený." });
	}

	res.status(200).send(post);
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
