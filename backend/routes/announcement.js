const router = require('express').Router();
const fs = require('fs');

const { announcementValidation } = require('../validation');
const Announcement = require('../models/Announcement');
const Grant = require('../models/Grant');

const verify = require('../middleware/verifyToken');
const { upload } = require('../handlers/upload');

router.get('/', verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
		try {
			const announcements = await Announcement.find().populate('issuedBy', 'firstName lastName').populate('grants', 'url').sort({updatedAt: -1});
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

router.post('/mass', verify, upload.array('files', 5), async (req, res) => {
	const url = req.protocol + '://' + req.get('host');
	const user = req.user[0];

	if (user.role === "admin" || user.role === "supervisor") {
		try {
			const {error} = announcementValidation(req.body);
			if (error) return res.status(400).send({error: error.details[0].message});

			const reqFiles = [];
			for (var i = 0; i < req.files.length; i++) {
				const reqFile = {};
				reqFile.url = url + '/public/documents/' + req.files[i].filename;
				reqFile.path = 'public/documents/' + req.files[i].filename;
				reqFile.name = req.files[i].filename.slice(37, req.files[i].filename.length);
				reqFiles.push(reqFile);
			}

			const announcement = new Announcement ({
				name: req.body.name,
				content: req.body.content,
				issuedBy: user._id,
				files: reqFiles
			});

			const newAnnouncement = await announcement.save();

			if (!newAnnouncement) return res.status(500).send({error: "Nový oznam sa nevytvoril, kontaktujte IT oddelenie!"});

			if (req.body.type === "ALL") {
				const grantUpdate = await Grant.updateMany(
					{},
					{$push: {announcements: newAnnouncement}}
				);	
			
				if (!grantUpdate) return res.status(400).send({error: "Nový oznam nebolo možné priradiť k vybraným grantom, kontaktujte IT oddelenie!!"})
			} else {
				const grantUpdate = await Grant.updateMany(
					{type: req.body.type},
					{$push: {announcements: newAnnouncement}}
				);	
			
				if (!grantUpdate) return res.status(400).send({error: "Nový oznam nebolo možné priradiť k vybraným grantom, kontaktujte IT oddelenie!!"});
			}
			
			res.status(200).send({msg: "Oznam bol pridaný."});
		} catch(err) {
			res.status(500).send({error: err.message});
		}
	} else {
		res.status(401).send({error: "Prístup zamietnutý!"});
	}
});
	
router.put('/:id', verify, upload.array('files', 5), async (req, res) => {
	const url = req.protocol + '://' + req.get('host');
	const user = req.user[0];

	if (user.role === "admin" || user.role === "supervisor") {
		try {
			const {error} = announcementValidation(req.body);
			if (error) return res.status(400).send({error: error.details[0].message});

			const reqFiles = [];
			for (var i = 0; i < req.files.length; i++) {
				const reqFile = {};
				reqFile.url = url + '/public/documents/' + req.files[i].filename;
				reqFile.path = 'public/documents/' + req.files[i].filename;
				reqFile.name = req.files[i].filename.slice(37, req.files[i].filename.length);
				reqFiles.push(reqFile);
			}

			const announcement = await Announcement.findOne({_id: req.params.id});
			if (!announcement) return res.status(400).send({error: "Oznam nebol nájdený!"});

			announcement.name = req.body.name;
			announcement.content = req.body.content;
			announcement.issuedBy = user._id;
			announcement.files = announcement.files.concat(reqFiles);

			const update = await announcement.save();		
			res.status(200).send({msg: "Oznam bol aktualizovaný", announcement: update});
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
			
			announcement.files.forEach(file => fs.unlinkSync(file.path));
			await announcement.remove();
			
			res.status(200).send({msg: "Oznam bol odstránený."});
		} catch(err) {
			res.status(500).send({error: err.message});
		}
	} else {
		res.status(401).send({error: "Prístup zamietnutý!"});
	}
});

router.delete('/:id/file/:file_id', verify, async (req, res) => {
	const user = req.user[0];

	if (user.role === "admin" || user.role === "supervisor") {	
		const announcement = await Announcement.findOne({_id: req.params.id});
		if (!announcement) return res.status(400).send({error: "Oznam nebol nájdený!"});

		try {
			const file = announcement.files.id(req.params.file_id);
			fs.unlinkSync(file.path);
			await file.remove();
			const update = await announcement.save();
			res.status(200).send({msg: "Dokument bol vymazaný.", announcement: update});
		} catch (err) {
			res.status(500).send({error: err.message});
		}
	} else {
		res.status(401).send({error: "Prístup zamietnutý!"});
	}
});

module.exports = router;
