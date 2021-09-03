const router = require("express").Router();

const { checkAuth, isSupervisor } = require("../middlewares/auth");
const { upload } = require("../util/upload");

router.post(
	"/upload",
	checkAuth,
	isSupervisor,
	upload.single("file"),
	(req, res, next) => {
		console.log(req.file);
		res.send("FILE UPLOAD");
	}
);

module.exports = router;
