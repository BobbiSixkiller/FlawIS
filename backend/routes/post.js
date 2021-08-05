const router = require("express").Router();
const { NotFoundError, UserInputError } = require("../middlewares/error");

const Post = require("../models/Post");
const { checkAuth, isOwnPost } = require("../middlewares/auth");
const validate = require("../middlewares/validation");
const { postSchema } = require("../util/validation");

router.get("/api/search", checkAuth, async (req, res) => {
  const posts = await Post.find(
    { $text: { $search: req.query.q } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });

  res.status(200).send({ posts, query: req.query.q });
});

router.get("/", checkAuth, async (req, res) => {
  const pageSize = parseInt(req.query.size || 9);
  const page = parseInt(req.query.page || 1);

  const authorFilter = req.query.author
    ? { author: { $in: req.query.author } }
    : {};
  const tagsFilter = req.query.tag ? { tags: { $in: req.query.tag } } : {};

  const [posts, total] = await Promise.all([
    Post.find({ ...authorFilter, ...tagsFilter })
      .skip(page * pageSize - pageSize)
      .limit(pageSize)
      .sort({ updatedAt: -1 }),
    Post.countDocuments({ ...authorFilter, ...tagsFilter }),
  ]);

  res.status(200).send({ posts, pages: Math.ceil(total / pageSize) });
});

router.get("/:id", checkAuth, async (req, res, next) => {
  const post = await Post.findOne({ _id: req.params.id });
  if (!post) return next(new NotFoundError("Post nebol nájdený!"));

  res.status(200).send(post);
});

router.post("/", checkAuth, validate(postSchema), async (req, res) => {
  const post = new Post({
    ...req.body,
    author: req.user.name,
    userId: req.user._id,
  });

  await post.save();

  res
    .status(200)
    .send({ success: "true", message: "Nový post pridaný!", post });
});

router.put(
  "/:id",
  checkAuth,
  isOwnPost,
  validate(postSchema),
  async (req, res, next) => {
    const { post } = req;

    post.name = req.body.name;
    post.body = req.body.body;
    post.tags = req.body.tags;

    await post.save();

    res
      .status(200)
      .send({ success: true, message: "Post bol aktualizovaný!", post });
  }
);

router.delete("/:id", checkAuth, isOwnPost, async (req, res) => {
  const { post } = req;

  await post.remove();

  res.status(200).send({ success: true, message: "Post bol zmazaný!", post });
});

module.exports = router;
