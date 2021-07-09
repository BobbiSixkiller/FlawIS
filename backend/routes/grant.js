const router = require("express").Router();

const Grant = require("../models/Grant");
const Announcement = require("../models/Announcement");

const {
  grantValidation,
  memberValidation,
  budgetValidation,
  announcementValidation,
} = require("../handlers/validation");
const { checkAuth, isSupervisor, isAdmin } = require("../middlewares/auth");
const { upload } = require("../handlers/upload");

router.get("/", checkAuth, isSupervisor, async (req, res) => {
  const page = req.query.page || 1;
  const pageSize = req.query.size || 5;

  const [grants, total] = await Promise.all([
    Grant.find()
      .skip(page * pageSize - pageSize)
      .limit(pageSize)
      .sort({ updatedAt: -1 }),
    Grant.countDocuments(),
  ]);

  res.status(200).send({ pages: Math.ceil(total / pageSize), grants });
});

router.get("/api/search", checkAuth, isSupervisor, async (req, res) => {
  const grants = await Grant.find(
    { $text: { $search: req.query.q } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });

  res.status(200).send({ grants, query: req.query.q });
});

router.post("/", checkAuth, isSupervisor, async (req, res) => {
  const { error } = await grantValidation(req.body);
  if (error) return res.status(400).send({ error: error.details[0].message });

  const grant = new Grant({
    name: req.body.name,
    idNumber: req.body.idNumber,
    type: req.body.type,
    start: req.body.start,
    end: req.body.end,
    budget: req.body.budget,
  });

  try {
    const newGrant = await grant.save();
    res.status(200).send(newGrant);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post(
  "/:id/announcement",
  checkAuth,
  isSupervisor,
  upload.array("files", 5),
  async (req, res) => {
    console.log("FIRE");
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

    const announcement = new Announcement({
      name: req.body.name,
      content: req.body.content,
      issuedBy: req.user._id,
      files: reqFiles,
    });

    await announcement.save();

    await Grant.updateOne(
      { _id: req.params.id },
      { $push: { announcements: announcement } }
    );

    res.status(200).send({ msg: "Oznam bol pridaný." });
  }
);

router.post(
  "/:grant_id/addBudget",
  checkAuth,
  isSupervisor,
  async (req, res) => {
    const { error } = await budgetValidation(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const grant = await Grant.findById(req.params.grant_id);
    if (!grant) return res.status(404).send({ error: "Grant nebol nájdený!" });

    //some porovna items v poli proti nejakej funkcii a vrati boolean
    if (
      grant.budget.some(
        (budget) =>
          new Date(budget.year).getFullYear() ===
          new Date(req.body.year).getFullYear()
      )
    ) {
      return res
        .status(400)
        .send({ error: "Pre daný rok môže byť vytvorený iba jeden rozpočet!" });
    }

    const budget = {
      year: req.body.year,
      travel: req.body.travel,
      material: req.body.material,
      services: req.body.services,
      indirect: req.body.indirect,
      salaries: req.body.salaries,
      members: req.body.members,
    };

    grant.budget = grant.budget.concat(budget);

    try {
      const newBudget = await grant.save();
      res.status(200).send(newBudget);
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  }
);

router.post(
  "/:grant_id/budget/:budget_id/addMember",
  checkAuth,
  isSupervisor,
  async (req, res) => {
    const { error } = await membersValidation(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const grant = await Grant.findOne({
      _id: req.params.grant_id,
      "budget._id": req.params.budget_id,
    });
    if (!grant)
      return res
        .status(404)
        .send({ error: "Grant alebo rozpočet nebol nájdený" });

    const member = {
      member: req.body.member,
      role: req.body.role,
      hours: req.body.hours,
    };

    const budget = grant.budget.id(req.params.budget_id);
    budget.members = budget.members.concat(member);

    try {
      const updatedGrant = await grant.save();
      res.status(200).send({ msg: "Bol pridaný nový riešiteľ." });
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  }
);

router.get("/:id", checkAuth, async (req, res) => {
  const grant = await Grant.findOne({ _id: req.params.id })
    .populate("budget.members.member")
    .populate({ path: "announcements", populate: { path: "issuedBy" } });
  if (!grant)
    return res.status(404).send({ error: true, msg: "Grant nebol nájdený!" });

  res.status(200).send(grant);
});
//nepouzivane, nakolko vykonavam mensie updaty v ramci properties grant objektu
router.put("/:id", checkAuth, isSupervisor, async (req, res) => {
  const { error } = await grantValidation(req.body);
  if (error) return res.status(400).send({ error: error.details[0].message });

  try {
    const update = await Grant.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (update === null)
      return res.status(404).send({ error: "Grant nebol nájdený!" });
    res.status(200).send(update);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.put(
  "/:grant_id/budget/:budget_id",
  checkAuth,
  isSupervisor,
  async (req, res) => {
    const { error } = await budgetUpdateValidation(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    try {
      let grant = await Grant.findOne({
        _id: req.params.grant_id,
        "budget._id": req.params.budget_id,
      });
      if (!grant)
        return res
          .status(404)
          .send({ error: "Grant alebo rozpočet nebol nájdený" });

      if (
        grant.budget.some(
          (budget) =>
            new Date(budget.year).getFullYear() ===
            new Date(req.body.year).getFullYear()
        )
      ) {
        return res.status(400).send({
          error: "Pre daný rok môže byť vytvorený iba jeden rozpočet!",
        });
      }
      //pri budget update menim len konkretne polozky budgetu
      let result = await Grant.findByIdAndUpdate(
        req.params.grant_id,
        {
          $set: {
            //"budget.$[inner].year": req.body.year,
            "budget.$[inner].travel": req.body.travel,
            "budget.$[inner].material": req.body.material,
            "budget.$[inner].services": req.body.services,
            "budget.$[inner].indirect": req.body.indirect,
            "budget.$[inner].salaries": req.body.salaries,
            //"budget.$[inner].members": req.body.members
          },
        },
        {
          arrayFilters: [{ "inner._id": req.params.budget_id }],
          new: true,
        }
      );
      if (result === null)
        return res.status(404).send({ error: "Grant nebol nájdený!" });
      res.status(200).send({ msg: "Rozpočet bol aktualizovaný." });
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  }
);

router.put(
  "/:grant_id/budget/:budget_id/member/:member_id",
  checkAuth,
  isSupervisor,
  async (req, res) => {
    const { error } = await membersValidation(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    try {
      const result = await Grant.findOneAndUpdate(
        {
          _id: req.params.grant_id,
          "budget._id": req.params.budget_id,
          "budget.members._id": req.params.member_id,
        },
        {
          $set: {
            "budget.$[budget].members.$[member].hours": req.body.hours,
            "budget.$[budget].members.$[member].active": req.body.active,
            "budget.$[budget].members.$[member].role": req.body.role,
            "budget.$[budget].members.$[member].member": req.body.member,
          },
        },
        {
          arrayFilters: [
            { "budget._id": req.params.budget_id },
            { "member._id": req.params.member_id },
          ],
          new: true,
        }
      );
      //zdeaktivuje konkretneho clena grantu vo vsetkych budgetoch v ramci daneho grantu
      if (!req.body.active) {
        const result2 = await Grant.findOneAndUpdate(
          {
            _id: req.params.grant_id,
            "budget._id": req.params.budget_id,
            "budget.members._id": req.params.member_id,
          },
          {
            $set: {
              "budget.$[].members.$[member].active": req.body.active,
            },
          },
          {
            arrayFilters: [{ "member.member": req.body.member }],
            multi: true,
          }
        );
        if (!result2)
          return res
            .status(404)
            .send({ error: "Grant, rozpočet alebo riešiteľ nebol nájdený!" });
        return res.status(200).send({ msg: "Riešiteľ bol aktualizovaný." });
      }
      if (!result)
        return res
          .status(404)
          .send({ error: "Grant, rozpočet alebo riešiteľ nebol nájdený!" });
      return res.status(200).send({ msg: "Riešiteľ bol aktualizovaný." });
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  }
);

router.delete("/:id", checkAuth, isSupervisor, async (req, res) => {
  try {
    const match = await Grant.findByIdAndDelete(req.params.id);
    if (match === null)
      return res.status(404).send({ error: "Grant nebol nájdený!" });
    res.status(200).send({ msg: "Grant bol zmazaný!" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.delete(
  "/:grant_id/budget/:budget_id",
  checkAuth,
  isSupervisor,
  async (req, res) => {
    const grant = await Grant.findOne({
      _id: req.params.grant_id,
      "budget._id": req.params.budget_id,
    });
    if (!grant)
      return res
        .status(404)
        .send({ error: "Grant alebo rozpočet nebol nájdený" });

    try {
      const match = await Grant.findByIdAndUpdate(
        req.params.grant_id,
        {
          $pull: { budget: { _id: req.params.budget_id } },
        },
        { new: true }
      );
      if (match === null)
        return res.status(404).send({ error: "Grant nebol nájdený!" });
      res.status(200).send(match);
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  }
);

router.delete(
  "/:grant_id/budget/:budget_id/member/:member_id",
  checkAuth,
  isSupervisor,
  async (req, res) => {
    const grant = await Grant.findOne({
      _id: req.params.grant_id,
      "budget._id": req.params.budget_id,
      "budget.members._id": req.params.member_id,
    });
    if (!grant)
      return res
        .status(404)
        .send({ error: "Grant, rozpočet alebo riešiteľ nebol nájdený!" });
    try {
      await grant.budget
        .id(req.params.budget_id)
        .members.id(req.params.member_id)
        .remove();
      const updatedGrant = await grant.save();
      res.status(200).send({ msg: "Riešiteľ bol odobratý." });
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  }
);

module.exports = router;
