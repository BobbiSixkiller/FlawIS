const router = require("express").Router();
const fs = require("fs");
const Grant = require("../models/Grant");
const Announcement = require("../models/Announcement");

const mongoose = require("mongoose");

const {
	grantValidation,
	announcementValidation,
	membersValidation,
	budgetValidation,
	budgetUpdateValidation,
} = require("../validation");
const verify = require("../middleware/verifyToken");
const { upload } = require("../handlers/upload");

router.get("/", verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
		try {
			const grants = await Grant.find()
				.sort({ updatedAt: -1 })
				.populate("budget.members.member")
				.populate({ path: "announcements", populate: { path: "issuedBy" } });
			res.status(200).send(grants);
		} catch (err) {
			res.status(500).send({ error: err.message });
		}
	} else {
		res.status(401).send({ error: "Prístup zamietnutý!" });
	}
});

router.post("/add", verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
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
			//Grant.collection.dropIndexes();
			res.status(200).send(newGrant);
		} catch (err) {
			res.status(500).send({ error: err.message });
		}
	} else {
		res.status(401).send({ error: "Prístup zamietnutý!" });
	}
});

router.post("/:grant_id/addBudget", verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
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
	} else {
		res.status(401).send({ error: "Prístup zamietnutý!" });
	}
});

router.post(
	"/:grant_id/budget/:budget_id/addMember",
	verify,
	async (req, res) => {
		const user = req.user[0];
		if (user.role === "admin" || user.role === "supervisor") {
			const { error } = await membersValidation(req.body);
			if (error)
				return res.status(400).send({ error: error.details[0].message });

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
		} else {
			res.status(401).send({ error: "Prístup zamietnutý!" });
		}
	}
);

router.post("/:grant_id/announcement", verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
		const { error } = await announcementValidation(req.body);
		if (error) return res.status(400).send({ error: error.details[0].message });

		const grant = await Grant.findOne({ _id: req.params.grant_id });
		if (!grant) return res.status(400).send({ error: "Grant nebol nájdený!" });

		try {
			const announcement = new Announcement({
				name: req.body.name,
				content: req.body.content,
				issuedBy: user._id,
			});

			await announcement.save();

			grant.announcements = grant.announcements.concat(announcement);

			await grant.save();
			res.status(200).send({ msg: "Oznam bol pridaný." });
		} catch (err) {
			res.status(500).send({ error: err.message });
		}
	} else {
		res.status(401).send({ error: "Prístup zamietnutý!" });
	}
});

router.post(
	"/:grant_id/file",
	verify,
	upload.array("files", 5),
	async (req, res) => {
		const url = req.protocol + "://" + req.get("host");
		const user = req.user[0];

		if (user.role === "admin" || user.role === "supervisor") {
			if (req.files.length === 0)
				return res.status(400).send({ error: "Neboli zaslané žiadne súbory!" });

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

			const grant = await Grant.findOne({ _id: req.params.grant_id });
			if (!grant)
				return res.status(404).send({ error: "Grant nebol nájdený!" });

			grant.files = grant.files.concat(reqFiles);

			try {
				await grant.save();
				if (req.files.length === 1) {
					res.status(200).send({ msg: "Dokument bol úspešne nahraný." });
				} else {
					res.status(200).send({ msg: "Dokumenty boli úspešne nahrané." });
				}
			} catch (err) {
				res.status(500).send({ error: err.message });
			}
		} else {
			res.status(401).send({ error: "Prístup zamietnutý!" });
		}
	}
);

router.get("/:id", verify, async (req, res) => {
	const user = req.user[0];
	if (user) {
		try {
			const match = await Grant.findById(mongoose.Types.ObjectId(req.params.id))
				.populate("budget.members.member")
				.populate({ path: "announcements", populate: { path: "issuedBy" } });
			if (match === null)
				return res.status(404).send({ error: "Grant nebol nájdený!" });
			res.status(200).send(match);
		} catch (err) {
			res.status(500).send({ error: err.message });
		}
	} else {
		res.status(401).send({ error: "Prístup zamietnutý!" });
	}
});
//nepouzivane, nakolko vykonavam mensie updaty v ramci properties of grant object
router.put("/:id", verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
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
	} else {
		return res.status(401).send({ error: "Prístup zamietnutý!" });
	}
});

router.put("/:grant_id/budget/:budget_id", verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
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
	} else {
		res.status(401).send({ error: "Prístup zamietnutý!" });
	}
});

router.put(
	"/:grant_id/budget/:budget_id/member/:member_id",
	verify,
	async (req, res) => {
		const user = req.user[0];
		if (user.role === "admin" || user.role === "supervisor") {
			const { error } = await membersValidation(req.body);
			if (error)
				return res.status(400).send({ error: error.details[0].message });

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
		} else {
			res.status(401).send({ error: "Prístup zamietnutý!" });
		}
	}
);

router.delete("/:id", verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin") {
		try {
			const match = await Grant.findByIdAndDelete(req.params.id);
			if (match === null)
				return res.status(404).send({ error: "Grant nebol nájdený!" });
			res.status(200).send({ msg: "Grant bol zmazaný!" });
		} catch (err) {
			res.status(500).send({ error: err.message });
		}
	} else {
		res.status(401).send({ error: "Prístup zamietnutý!" });
	}
});

router.delete("/:grant_id/budget/:budget_id", verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin") {
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
	} else {
		return res.status(401).send({ error: "Prístup zamietnutý!" });
	}
});

router.delete(
	"/:grant_id/budget/:budget_id/member/:member_id",
	verify,
	async (req, res) => {
		const user = req.user[0];
		if (user.role === "admin" || user.role === "supervisor") {
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
		} else {
			res.status(401).send({ error: "Prístup zamietnutý!" });
		}
	}
);

//endpoint zmaze vsetky files pre daný grant a rovnako aj z documents static folderu
router.delete("/:grant_id/files", verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
		const grant = await Grant.findOne({ _id: req.params.grant_id });
		if (!grant) return res.status(404).send({ error: "Grant nebol nájdený!" });

		try {
			grant.files.forEach((file) =>
				fs.unlink(file.path, (err) => console.log(err))
			);
			grant.files = [];
			await grant.save();
			res.status(200).send({ msg: "Dokumenty grantu boli vymazané." });
		} catch (err) {
			res.status(500).send({ error: err.message });
		}
	} else {
		res.status(401).send({ error: "Prístup zamietnutý!" });
	}
});

router.delete("/:grant_id/file/:file_id", verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
		const grant = await Grant.findOne({ _id: req.params.grant_id });
		if (!grant) return res.status(404).send({ error: "Grant nebol nájdený!" });

		try {
			const file = grant.files.id(req.params.file_id);
			fs.unlink(file.path, (err) => console.log(err));
			await file.remove();
			await grant.save();
			res.status(200).send({ msg: "Dokument bol vymazaný." });
		} catch (err) {
			res.status(500).send({ error: err.message });
		}
	} else {
		res.status(401).send({ error: "Prístup zamietnutý!" });
	}
});

module.exports = router;
