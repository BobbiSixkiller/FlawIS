const router = require("express").Router();

const Post = require("../models/Post");
const { checkAuth } = require("../middleware/auth");

router.get("/", checkAuth, async (req, res) => {});

module.exports = router;
