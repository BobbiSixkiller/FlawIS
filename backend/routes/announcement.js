const router = require('express').Router();
const mongoose = require('mongoose');

const { announcementValidation } = require('../validation');
const Announcement = require('../models/Announcement');
const Grant = require('../models/Grant');

const verify = require('../middleware/verifyToken');

router.get('/', verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
		try {
			const announcements = await Announcement.find().populate('issuedBy', 'firstName lastName').populate('grants', 'url').sort({updatedAt: 1});
			res.status(200).send(announcements);
		} catch(err) {
			res.status(500).send({error: err.message});
		}
	} else {
		res.status(401).send({error: "Prístup zamietnutý!"});
	}
});

router.get('/:id', verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
		try {
			const announcement = await Announcement.findOne({_id: req.params.id});
			if (!announcement) return res.status(400).send({error: "Oznam nebol nájdený!"});
			
			res.status(200).send(announcement);
		} catch(err) {
			res.status(500).send({error: err.message});
		}
	} else {
		res.status(401).send({error: "Prístup zamietnutý!"});
	}
});

router.post('/mass', verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
		try {
			const {error} = await announcementValidation(req.body);
			if (error) return res.status(400).send({error: error.details[0].message});

			const announcement = new Announcement ({
				name: req.body.name,
				content: req.body.content,
				issuedBy: user._id
			});

			const newAnnouncement = await announcement.save();

			if (!newAnnouncement) return res.status(500).send({error: "Nový oznam sa nevytvoril, kontaktujete IT oddelenie!"});

			const grantUpdate = await Grant.updateMany(
				{type: req.body.type},
				{$push: {announcements: newAnnouncement}}
			);

			if (!grantUpdate) return res.status(400).send({error: "Typ grantu neexistuje!"})
			
			res.status(200).send({msg: "Oznam bol pridaný."});
		} catch(err) {
			res.status(500).send({error: err.message});
		}
	} else {
		res.status(401).send({error: "Prístup zamietnutý!"});
	}
});
	
router.delete('/:id', verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
		try {
			const announcement = await Announcement.findOne({_id: req.params.id});
			if (!announcement) return res.status(400).send({error: "Oznam nebol nájdený!"});
			
			await announcement.remove();
			
			res.status(200).send({msg: "Oznam bol odstránený."});
		} catch(err) {
			res.status(500).send({error: err.message});
		}
	} else {
		res.status(401).send({error: "Prístup zamietnutý!"});
	}
});

router.put('/:id', verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
		try {
			const {error} = await announcementValidation(req.body);
			if (error) return res.status(400).send({error: error.details[0].message});

			const update = await Announcement.findOneAndUpdate({_id: req.params.id}, {$set: req.body}, {new: true});
			if (!update) return res.status(400).send({error: "Ozanm nebol nájdený!"});
			
			res.status(200).send({msg: "Oznam bol aktualizovaný"});
		} catch(err) {
			res.status(500).send({error: err.message});
		}
	} else {
		res.status(401).send({error: "Prístup zamietnutý!"});
	}
});

module.exports = router;
