const router = require("express").Router();
const fs = require("fs");

const { checkAuth, isSupervisor } = require("../middlewares/auth");
const { upload } = require("../util/upload");

router.post(
  "/upload",
  checkAuth,
  isSupervisor,
  upload.single("file"),
  (req, res, next) => {
    console.log(req.file);
    if (!req.file) {
      return next(new Error("File upload failed!"));
    }
    const { originalname: name, filename, path } = req.file;
    const url = "https://" + req.get("host") + "/public/documents/" + filename;

    res.status(200).send({
      success: true,
      uploadedFile: { name, url, path },
    });
  }
);

router.delete("/file", checkAuth, isSupervisor, (req, res, next) => {
  fs.unlink(req.body.path, (err) => console.log(err));
  res.status(200).send({ success: true });
});

module.exports = router;
