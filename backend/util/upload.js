const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { UserInputError } = require("../middlewares/error");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "public/documents");
  },
  filename(req, file, cb) {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + fileName);
  },
});

module.exports.upload = multer({
  storage: storage,
  onError: function (err, next) {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      next(
        new UserInputError("Bad user input", [
          {
            path: "files",
            message: "Maximalne je mozne nahrat 5 suborov sucasne!",
          },
        ])
      );
    } else {
      next(err);
    }
  },
  fileFilter(req, file, cb) {
    if (
      file.mimetype == "application/pdf" ||
      file.mimetype ==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new UserInputError("Bad user input", [
          { path: "files", message: "Povolene typy suborov: PDF, Word!" },
        ])
      );
    }
  },
});
