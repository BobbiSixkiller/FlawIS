const router = require("express").Router();
const User = require("../models/User");
const mail = require("../handlers/mail");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  registerValidation,
  loginValidation,
  userUpdateValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../handlers/validation");
const { checkAuth, isAdmin, isSupervisor } = require("../middlewares/auth");

router.post("/register", async (req, res) => {
  const { error } = await registerValidation(req.body);
  if (error) return res.status(400).send({ error: error.details[0].message });

  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist)
    return res
      .status(400)
      .send({ error: true, msg: "Zadaný email je už zaregistrovaný!" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const init = await User.find({});

  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashedPassword,
    role: `${init.length === 0 ? "admin" : "basic"}`,
  });
  await user.save();

  const token = jwt.sign(
    {
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    },
    process.env.SECRET,
    {
      expiresIn: "1h",
    }
  );

  res
    .cookie("authorization", `Bearer ${token}`, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: "strict",
    })
    .status(200)
    .send({
      msg: `Vitajte ${user.fullName}!`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
});

router.post("/", checkAuth, isSupervisor, async (req, res) => {
  //validation
  const { error } = await registerValidation(req.body);
  if (error) return res.status(400).send({ error: error.details[0].message });

  //check for duplicates
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist)
    return res
      .status(400)
      .send({ error: "Zadaný email je už zaregistrovaný!" });

  //password hashing
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //create a new user
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashedPassword,
    role: req.body.role,
  });

  await user.save();
  res.status(200).send({ msg: `Používateľ ${user.fullName} bol pridaný.` });
});

router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error)
    return res.status(400).send({ error: true, msg: error.details[0].message });

  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res
      .status(400)
      .send({ error: true, msg: "Email alebo heslo sú nesprávne!" });

  const passwordExists = await bcrypt.compare(req.body.password, user.password);
  if (!passwordExists)
    return res
      .status(400)
      .send({ error: true, msg: "Email alebo heslo sú nesprávne!" });

  const token = jwt.sign(
    {
      _id: user._id,
      name: user.fullName,
      email: user.email,
      role: user.role,
    },
    process.env.SECRET,
    {
      expiresIn: "1h",
    }
  );

  res
    .cookie("authorization", `Bearer ${token}`, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: "strict",
    })
    .status(200)
    .send({
      msg: `Vitajte ${user.fullName}!`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
});

router.post("/forgotPassword", async (req, res) => {
  const { error } = forgotPasswordValidation(req.body);
  if (error) return res.status(400).send({ error: error.details[0].message });

  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res
      .status(400)
      .send({ error: "So zadaným emailom nie je spojený žiadny používateľ." });

  const token = jwt.sign({ _id: user._id }, process.env.SECRET, {
    expiresIn: "1h",
  });

  const resetURL = `https://flawis.flaw.uniba.sk/resetPassword/${token}`;

  try {
    await mail.send({
      user,
      subject: "Password Reset",
      html: `<!DOCTYPE html>
				<html>
					<head>
						<title>Reset hesla</title>
					</head>
					<body>
						<h1>Obnovenie hesla FlawIS</h1>
						<p>Pre obnovenie hesla prosim kliknite na nasledujuci link:</p>
						<a href=${resetURL} target="_blank">Prejst do FlawIS</a>
						<p>Pokial si nezelate obnovit Vase heslo, prosim ignorujte tento email</p>
					</body>
				</html>`,
      text:
        "Pre obnovenie hesla prosim skopirujte do Vasho weboveho prehliadaca nasledujuci link:\n\n" +
        resetURL +
        "\n\n" +
        "Ak si nezelate zmenit Vase heslo, ignorujte tento email.\n",
    });
    res.status(200).send({
      msg: "Link na obnovenie hesla bol zaslaný na zadanú emailovú adresu.",
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post("/reset/:token", async (req, res) => {
  const id = jwt.verify(
    req.params.token,
    process.env.SECRET,
    function (err, decoded) {
      if (err) {
        if (err.message === "jwt expired") {
          return res.status(401).send({
            error: {
              ...err,
              message: "Autorizačný token expiroval, prihláste sa prosím!",
            },
          });
        }
        res.status(401).send({ error: err });
      } else {
        return decoded;
      }
    }
  );

  const user = await User.findOne({ _id: id });
  if (!user) {
    return res
      .status(404)
      .send({ error: true, msg: "Používateľ nebol nájdený!" });
  }

  const { error } = resetPasswordValidation(req.body);
  if (error) return res.status(400).send({ error: error.details[0].message });

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);

  user.password = password;
  await user.save();

  res.status(200).send({ msg: "Vaše heslo bolo zmenené!" });
});

router.get("/logout", (req, res) => {
  res
    .cookie("authorization", "", { httpOnly: true, expires: new Date(0) })
    .status(200)
    .send({ msg: "Boli ste odhlásený." });
});

router.get("/", checkAuth, isSupervisor, async (req, res) => {
  try {
    const aggregate = await User.getUsers();
    //const aggregate = await User.getUsersGrantsAggregation();
    //const users = await User.find().populate({path: 'grants', populate:{path: 'members.member'}});
    res.status(200).send(aggregate);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//util endpoint for grant members
router.get("/names", checkAuth, async (req, res) => {
  const users = await User.find().select("firstName lastName");

  res.status(200).send(users);
});

router.get("/:id/:year", checkAuth, async (req, res) => {
  try {
    const match = await User.getUserGrantsAggregation(
      req.params.id,
      req.params.year
    );
    console.log(match);
    if (match.length !== 0) {
      res.status(200).send(match[0]);
    } else {
      res.status(404).send({
        error: true,
        msg: "Používateľove granty pre zadaný rok neboli nájdené!",
      });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/me", checkAuth, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id }).select("-password");
  if (!user) {
    return res
      .status(404)
      .send({ error: true, msg: "Používateľ nebol nájdený!" });
  }

  res.status(200).send({ msg: `Vitajte ${user.fullName}!`, user });
});

router.get("/:id", checkAuth, isSupervisor, async (req, res) => {
  try {
    const match = await User.findOne({ _id: req.params.id }).populate({
      path: "grants",
      populate: { path: "members.member" },
    });
    if (match) {
      res.status(200).send(match);
    } else {
      res.status(404).send({ error: true, msg: "Používateľ nebol nájdený!" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

//prerobit update aby pocital s repeatpass ale neukladal to do DB
router.put("/:id", checkAuth, isSupervisor, async (req, res) => {
  const { error } = userUpdateValidation(req.body);
  if (error)
    return res.status(400).send({ error: true, msg: error.details[0].message });

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  try {
    const userAct = await User.findOne({ _id: req.params.id });
    if (userAct.email !== req.body.email) {
      const emailExist = await User.findOne({ email: req.body.email });
      if (emailExist)
        return res
          .status(400)
          .send({ error: true, msg: "Zadaný email je už zaregistrovaný!" });

      const update = await User.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { new: true }
      );
      return res
        .status(200)
        .send({ msg: `Používateľ ${update.fullName} aktualizovaný.` });
    } else {
      const update = await User.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { new: true }
      );
      return res
        .status(200)
        .send({ msg: `Používateľ ${update.fullName} aktualizovaný.` });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.delete("/:id", checkAuth, isAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user)
      return res
        .status(404)
        .send({ error: true, msg: "Používateľ nebol nájdený!" });

    await user.remove();

    res.status(200).send({ msg: "Používateľ vymazaný!" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
