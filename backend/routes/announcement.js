const router = require("express").Router();
const fs = require("fs");
const { NotFoundError } = require("../middlewares/error");

const { announcementSchema } = require("../util/validation");
const Announcement = require("../models/Announcement");
const Grant = require("../models/Grant");

const { checkAuth, isSupervisor } = require("../middlewares/auth");
const validate = require("../middlewares/validation");
const { upload } = require("../util/upload");

router.get("/", checkAuth, isSupervisor, async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const pageSize = parseInt(req.query.size) || 5;

	const [announcements, total] = await Promise.all([
		Announcement.find(
			{},
			{},
			{ skip: page * pageSize - pageSize, limit: pageSize, sort: "-updatedAt" }
		).populate("issuedBy", "firstName lastName"),
		Announcement.countDocuments(),
	]);

	res.status(200).send({ announcements, total: Math.ceil(total / pageSize) });
});

router.get("/:id", checkAuth, isSupervisor, async (req, res, next) => {
	const announcement = await Announcement.findOne({
		_id: req.params.id,
	})
		.populate("issuedBy", "firstName lastName")
		.populate("grants", "url");

	if (!announcement) return next(new NotFoundError("Oznam nebol nájdený!"));

	res.status(200).send(announcement);
});

router.get("/api/search", checkAuth, isSupervisor, async (req, res) => {
	const announcements = await Announcement.find(
		{ $text: { $search: req.query.q } },
		{ score: { $meta: "textScore" } }
	).sort({ score: { $meta: "textScore" } });

	res.status(200).send({ announcements, query: req.query.q });
});

router.post(
	"/",
	checkAuth,
	isSupervisor,
	upload.array("files", 5),
	validate(announcementSchema),
	async (req, res) => {
		const url = "https://" + req.get("host");

		const reqFiles = [];
		for (var i = 0; i < req.files.length; i++) {
			const reqFile = {};

			reqFile.url = url + "/public/documents/" + req.files[i].filename;
			reqFile.path = "public/documents/" + req.files[i].filename;
			reqFile.name = req.files[i].filename.slice(
				37,
				req.files[i].filename.length
			);

			reqFiles.push(reqFile);
		}

		const announcement = new Announcement({
			name: req.body.name,
			content: req.body.content,
			issuedBy: req.user._id,
			files: reqFiles,
		});

		await announcement.save();

		if (req.body.grantId) {
			await Grant.updateOne(
				{ _id: req.body.grantId },
				{ $push: { announcements: announcement } }
			);
		} else if (req.body.scope === "ALL") {
			await Grant.updateMany({}, { $push: { announcements: announcement } });
		} else {
			await Grant.updateMany(
				{ type: req.body.type },
				{ $push: { announcements: announcement } }
			);
		}

		res
			.status(200)
			.send({ success: true, message: "Oznam bol pridaný.", announcement });
	}
);

router.put(
	"/:id",
	checkAuth,
	isSupervisor,
	upload.array("files", 5),
	validate(announcementSchema),
	async (req, res, next) => {
		const url = "https://" + req.get("host");

		const reqFiles = [];
		for (var i = 0; i < req.files.length; i++) {
			const reqFile = {};
			reqFile.url = url + "/public/documents/" + req.files[i].filename;
			reqFile.path = "public/documents/" + req.files[i].filename;
			reqFile.name = req.files[i].filename.slice(
				37,
				req.files[i].filename.length
			);
			reqFiles.push(reqFile);
		}

		const announcement = await Announcement.findOne({ _id: req.params.id });
		if (!announcement) return next(new NotFoundError("Oznam nebol nájdený!"));

		announcement.name = req.body.name;
		announcement.content = req.body.content;
		announcement.issuedBy = req.user._id;
		announcement.files = announcement.files.concat(reqFiles);

		await announcement.save();

		res.status(200).send({
			success: true,
			message: "Oznam bol aktualizovaný.",
			announcement,
		});
	}
);

router.delete("/:id", checkAuth, isSupervisor, async (req, res, next) => {
	const announcement = await Announcement.findOne({ _id: req.params.id });
	if (!announcement)
		return next(new NotFoundError("Oznam nebol nájdený!", 404));

	announcement.files.forEach((file) =>
		fs.unlink(file.path, (err) => console.log(err))
	);
	await announcement.remove();

	res.status(200).send({ success: true, message: "Oznam bol odstránený." });
});

router.delete(
	"/:id/file/:file_id",
	checkAuth,
	isSupervisor,
	async (req, res, next) => {
		const announcement = await Announcement.findOne({ _id: req.params.id });
		if (!announcement)
			return next(new NotFoundError("Oznam nebol nájdený!", 404));

		const file = announcement.files.id(req.params.file_id);
		if (!file) return next(new NotFoundError("Dokument nebol nájdený!", 404));

		fs.unlink(file.path, (err) => console.log(err));

		await file.remove();
		await announcement.save();

		res
			.status(200)
			.send({ success: true, message: "Dokument bol vymazaný.", announcement });
	}
);

module.exports = router;
