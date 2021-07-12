const router = require("express").Router();
const fs = require("fs");

const { announcementValidation } = require("../handlers/validation");
const Announcement = require("../models/Announcement");
const Grant = require("../models/Grant");

const { checkAuth, isSupervisor } = require("../middlewares/auth");
const { upload } = require("../handlers/upload");

router.get("/", checkAuth, isSupervisor, async (req, res) => {
  const page = req.query.page || 1;
  const pageSize = req.query.size || 5;

  const [announcements, total] = await Promise.all([
    Announcement.find()
      .populate("issuedBy", "firstName lastName")
      .skip(page * pageSize - pageSize)
      .limit(pageSize)
      .sort({ updatedAt: -1 }),
    Announcement.countDocuments(),
  ]);

  res.status(200).send({ announcements, total: Math.ceil(total / pageSize) });
});

router.get("/:id", checkAuth, isSupervisor, async (req, res) => {
  const announcement = await Announcement.findOne({
    _id: req.params.id,
  })
    .populate("issuedBy", "firstName lastName")
    .populate("grants", "url");

  if (!announcement)
    return res.status(404).send({ error: true, msg: "Oznam nebol nájdený!" });

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
  async (req, res) => {
    const url = "https://" + req.get("host");

    const { error } = announcementValidation(req.body);
    if (error)
      return res
        .status(404)
        .send({ error: true, msg: error.details[0].message });

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

    res.status(200).send({ msg: "Oznam bol pridaný." });
  }
);

router.put(
  "/:id",
  checkAuth,
  isSupervisor,
  upload.array("files", 5),
  async (req, res) => {
    const url = "https://" + req.get("host");

    const { error } = announcementValidation(req.body);
    if (error)
      return res
        .status(400)
        .send({ error: true, msg: error.details[0].message });

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
    if (!announcement)
      return res.status(404).send({ error: true, msg: "Oznam nebol nájdený!" });

    announcement.name = req.body.name;
    announcement.content = req.body.content;
    announcement.issuedBy = req.user._id;
    announcement.files = announcement.files.concat(reqFiles);
    //announcement.files.push(reqFiles);

    await announcement.save();

    res.status(200).send({ msg: "Oznam bol aktualizovaný" });
  }
);

router.delete("/:id", checkAuth, isSupervisor, async (req, res) => {
  const announcement = await Announcement.findOne({ _id: req.params.id });
  if (!announcement)
    return res.status(404).send({ error: true, msg: "Oznam nebol nájdený!" });

  announcement.files.forEach((file) =>
    fs.unlink(file.path, (err) => console.log(err))
  );
  await announcement.remove();

  res.status(200).send({ msg: "Oznam bol odstránený." });
});

router.delete(
  "/:id/file/:file_id",
  checkAuth,
  isSupervisor,
  async (req, res) => {
    const announcement = await Announcement.findOne({ _id: req.params.id });
    if (!announcement)
      return res.status(400).send({ error: true, msg: "Oznam nebol nájdený!" });

    const file = announcement.files.id(req.params.file_id);
    if (!file)
      return res
        .status(404)
        .send({ error: true, msg: "Dokument nebol nájdený!" });

    fs.unlink(file.path, (err) => console.log(err));
    await file.remove();

    await announcement.save();

    res.status(200).send({ msg: "Dokument bol vymazaný." });
  }
);

module.exports = router;
