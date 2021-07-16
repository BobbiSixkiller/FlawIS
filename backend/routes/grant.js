const router = require("express").Router();
const { ErrorResponse } = require("../middlewares/error");

const Grant = require("../models/Grant");

const {
  grantSchema,
  grantValidation,
  memberValidation,
  budgetValidation,
} = require("../util/validation");
const { checkAuth, isSupervisor, isAdmin } = require("../middlewares/auth");
const validate = require("../middlewares/validation");

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

router.post(
  "/",
  checkAuth,
  isSupervisor,
  validate(grantSchema),
  async (req, res, next) => {
    // const { error } = await grantValidation(req.body);
    // if (error) return res.status(400).send({ error });

    try {
      //await grantValidationSchema.validate(req.body);

      const grant = new Grant({
        name: req.body.name,
        idNumber: req.body.idNumber,
        type: req.body.type,
        start: req.body.start,
        end: req.body.end,
        budget: req.body.budget,
      });

      const newGrant = await grant.save();
      res.status(200).send(newGrant);
    } catch (err) {
      //next(err);
      res.send(err);
    }
  }
);

router.post(
  "/:grantId/addBudget",
  checkAuth,
  isSupervisor,
  async (req, res) => {
    const { error } = await budgetValidation(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const grant = await Grant.findById(req.params.grantId);
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
  "/:grantId/budget/:budgetId",
  checkAuth,
  isSupervisor,
  async (req, res) => {
    const { error } = await memberValidation(req.body);
    if (error)
      return res
        .status(400)
        .send({ error: true, msg: error.details[0].message });

    const grant = await Grant.findOne({
      _id: req.params.grantId,
    });
    if (!grant)
      return res.status(404).send({ error: true, msg: "Grant nebol nájdený!" });

    const budget = grant.budget.id(req.params.budgetId);
    if (!budget)
      return res
        .status(404)
        .send({ error: true, msg: "Rozpočet nebol nájdený!" });

    const member = {
      member: req.body.member,
      role: req.body.role,
      hours: req.body.hours,
    };
    budget.members.push(member);

    await grant.save();

    res.status(200).send({ msg: "Bol pridaný nový riešiteľ." });
  }
);

router.get("/:id", checkAuth, async (req, res) => {
  console.log("FIRED GET GRANT");
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
  "/:grantId/budget/:budgetId",
  checkAuth,
  isSupervisor,
  async (req, res) => {
    const { error } = await budgetValidation(req.body);
    if (error)
      return res
        .status(400)
        .send({ error: true, msg: error.details[0].message });

    let update = await Grant.findOneAndUpdate(
      { _id: req.params.grantId },
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
        arrayFilters: [{ "inner._id": req.params.budgetId }],
        new: true,
      }
    );
    if (!update)
      return res.status(404).send({ error: true, msg: "Grant nebol nájdený!" });

    res.status(200).send({ msg: "Rozpočet bol aktualizovaný." });
  }
);

router.put(
  "/:grantId/budget/:budgetId/member/:memberId",
  checkAuth,
  isSupervisor,
  async (req, res) => {
    const { error } = memberValidation(req.body);
    if (error)
      return res
        .status(400)
        .send({ error: true, msg: error.details[0].message });

    const result = await Grant.findOneAndUpdate(
      {
        _id: req.params.grantId,
        "budget._id": req.params.budgetId,
        "budget.members._id": req.params.memberId,
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
          { "budget._id": req.params.budgetId },
          { "member._id": req.params.memberId },
        ],
        new: true,
      }
    );

    if (!result)
      return res.status(404).send({
        error: true,
        msg: "Grant, rozpočet alebo riešiteľ nebol nájdený!",
      });

    res.status(200).send({ msg: "Riešiteľ bol aktualizovaný." });
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
  "/:grantId/budget/:budgetId",
  checkAuth,
  isSupervisor,
  async (req, res) => {
    const grant = await Grant.findOne({
      _id: req.params.grantId,
      "budget._id": req.params.budgetId,
    });
    if (!grant)
      return res
        .status(404)
        .send({ error: "Grant alebo rozpočet nebol nájdený" });

    try {
      const match = await Grant.findByIdAndUpdate(
        req.params.grantId,
        {
          $pull: { budget: { _id: req.params.budgetId } },
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
  "/:grantId/budget/:budgetId/member/:memberId",
  checkAuth,
  isSupervisor,
  async (req, res) => {
    const grant = await Grant.findOne({
      _id: req.params.grantId,
    });
    if (!grant)
      return res.status(404).send({
        error: true,
        msg: "Grant nebol nájdený!",
      });

    const budget = grant.budget.id(req.params.budgetId);
    if (!budget)
      return res
        .status(404)
        .send({ error: true, msg: "Rozpočet nebol nájdený!" });

    const member = budget.members.id(req.params.memberId);
    if (!member)
      return res
        .status(404)
        .send({ error: true, msg: "Riešiteľ nebol nájdený!" });

    await member.remove();
    await grant.save();

    res.status(200).send({ msg: "Riešiteľ bol odobratý." });
  }
);

module.exports = router;
