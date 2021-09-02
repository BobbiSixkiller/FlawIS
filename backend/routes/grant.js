const router = require("express").Router();
const Yup = require("yup");
const { NotFoundError, UserInputError } = require("../middlewares/error");

const Grant = require("../models/Grant");

const {
	grantSchema,
	memberSchema,
	budgetSchema,
} = require("../util/validation");
const { checkAuth, isSupervisor, isAdmin } = require("../middlewares/auth");
const validate = require("../middlewares/validation");

router.get("/", checkAuth, isSupervisor, async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const pageSize = parseInt(req.query.size) || 5;

	const [grants, total] = await Promise.all([
		Grant.find()
			.sort({ updatedAt: -1 })
			.skip(page * pageSize - pageSize)
			.limit(pageSize),
		Grant.countDocuments(),
	]);

	res.status(200).send({ pages: Math.ceil(total / pageSize), grants });
});

router.get("/:id", checkAuth, async (req, res) => {
	const grant = await Grant.findOne({ _id: req.params.id })
		.populate("budget.members.member")
		.populate({ path: "announcements", populate: { path: "issuedBy" } });
	if (!grant) return next(new NotFoundError("Grant nebol nájdený!"));

	res.status(200).send(grant);
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
		const grantExists = await Grant.findOne({ idNumber: req.body.idNumber });
		if (grantExists)
			return next(
				new UserInputError("Bad user input!", [
					{ path: "idNumber", message: "Grant so zadaným ID uz existuje!" },
				])
			);

		const grant = new Grant({
			name: req.body.name,
			idNumber: req.body.idNumber,
			type: req.body.type,
			start: req.body.start,
			end: req.body.end,
			budget: req.body.budget,
		});

		await grant.save();

		res.status(200).send({
			success: true,
			message: `Grant: ${grant.name} bol vytvorený!`,
			grant,
		});
	}
);

router.post(
	"/:grantId/addBudget",
	checkAuth,
	isSupervisor,
	validate(budgetSchema),
	async (req, res, next) => {
		const grant = await Grant.findById(req.params.grantId);
		if (!grant) return next(new NotFoundError("Grant nebol nájdený!"));

		//some porovna items v poli proti nejakej funkcii a vrati boolean
		if (
			grant.budget.some(
				(budget) =>
					new Date(budget.year).getFullYear() ===
					new Date(req.body.year).getFullYear()
			)
		) {
			return next(
				new UserInputError("Bad user input!", [
					"Pre daný rok môže byť vytvorený iba jeden rozpočet!",
				])
			);
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
		await grant.save();

		res.status(200).send({
			success: true,
			message: `Rozpočet na rok ${budget.year} pridaný!`,
			grant,
		});
	}
);

router.post(
	"/:grantId/budget/:budgetId",
	checkAuth,
	isSupervisor,
	validate(memberSchema),
	async (req, res, next) => {
		const grant = await Grant.findOne({
			_id: req.params.grantId,
		});
		if (!grant) return next(new NotFoundError("Grant nebol nájdený!"));

		const budget = grant.budget.id(req.params.budgetId);
		if (!budget) return next(new NotFoundError("Rozpočet nebol nájdený!"));

		const member = {
			member: req.body.member,
			role: req.body.role,
			hours: req.body.hours,
		};
		budget.members.push(member);

		await grant.save();

		res
			.status(200)
			.send({ success: true, message: "Bol pridaný nový riešiteľ!", grant });
	}
);

//universal update, temporarily used for later grant END update
router.put(
	"/:id",
	checkAuth,
	isSupervisor,
	validate(Yup.object({ end: Yup.date().required() })),
	async (req, res, next) => {
		const grant = await Grant.findOneAndUpdate(
			{ _id: req.params.id },
			{ $set: req.body },
			{ new: true }
		);
		if (!grant) return next(new NotFoundError("Grant nebol nájdený!"));

		res.status(200).send({
			success: true,
			message: `Grant: ${grant.name} bol aktualizovaný!`,
			grant,
		});
	}
);

router.put(
	"/:grantId/budget/:budgetId",
	checkAuth,
	isSupervisor,
	validate(budgetSchema),
	async (req, res, next) => {
		const grant = await Grant.findOne({ _id: req.params.grantId });
		if (!grant) return next(new NotFoundError("Grant nebol nájdený!"));

		const budget = grant.budget.id(req.params.budgetId);
		if (!budget) return next(new NotFoundError("Budget nebol nájdený!"));

		budget.travel = req.body.travel;
		budget.material = req.body.material;
		budget.services = req.body.services;
		budget.indirect = req.body.indirect;
		budget.salaries = req.body.salaries;

		await grant.save();

		res.status(200).send({
			success: true,
			message: `Rozpočet ${new Date(
				budget.year
			).getFullYear()} bol aktualizovaný!`,
			grant,
		});
	}
);

router.put(
	"/:grantId/budget/:budgetId/member/:memberId",
	checkAuth,
	isSupervisor,
	validate(memberSchema),
	async (req, res, next) => {
		const grant = await Grant.findOne({ _id: req.params.grantId });
		if (!grant) return next(new NotFoundError("Grant nebol nájdený!"));

		const budget = grant.budget.id(req.params.budgetId);
		if (!budget) return next(new NotFoundError("Budget nebol nájdený!"));

		const member = budget.members.id(req.params.memberId);
		if (!member) return next(new NotFoundError("Riešiteľ nebol nájdený!"));

		member.hours = req.body.hours;
		member.active = req.body.active;
		member.role = req.body.role;

		await grant.save();

		res
			.status(200)
			.send({ success: true, message: "Riešiteľ bol aktualizovaný!", grant });
	}
);

router.delete("/:grantId", checkAuth, isSupervisor, async (req, res, next) => {
	const grant = await Grant.findOne({ _id: req.params.grantId });
	if (!grant) return next(new NotFoundError("Grant nebol nájdený!"));

	await grant.remove();

	res.status(200).send({
		success: true,
		message: `Grant ${grant.name} bol zmazaný!`,
		grant,
	});
});

router.delete(
	"/:grantId/budget/:budgetId",
	checkAuth,
	isSupervisor,
	async (req, res) => {
		const grant = await Grant.findOne({ _id: req.params.grantId });
		if (!grant) return next(new NotFoundError("Grant nebol nájdený!"));

		const budget = grant.budget.id(req.params.budgetId);
		if (!budget) return next(new NotFoundError("Budget nebol nájdený!"));

		budget.remove();
		await grant.save();

		res.status(200).send({
			success: true,
			message: `Rozpočet ${new Date(budget.year).getFullYear()} bol zmazaný!`,
			grant,
		});
	}
);

router.delete(
	"/:grantId/budget/:budgetId/member/:memberId",
	checkAuth,
	isSupervisor,
	async (req, res, next) => {
		const grant = await Grant.findOne({ _id: req.params.grantId });
		if (!grant) return next(new NotFoundError("Grant nebol nájdený!"));

		const budget = grant.budget.id(req.params.budgetId);
		if (!budget) return next(new NotFoundError("Budget nebol nájdený!"));

		const member = budget.members.id(req.params.memberId);
		if (!member) return next(new NotFoundError("Riešiteľ nebol nájdený!"));

		await member.remove();
		await grant.save();

		res
			.status(200)
			.send({ success: true, message: "Riešiteľ  bol zmazaný!", grant });
	}
);

module.exports = router;
