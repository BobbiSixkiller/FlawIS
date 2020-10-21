const router = require('express').Router();
const User = require('../models/User');
const mail = require('../handlers/mail');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const {registerValidation, userAddValidation, loginValidation, userUpdateValidation, forgotPasswordValidation, resetPasswordValidation} = require('../validation');
const verify = require('../middleware/verifyToken');

router.post('/register', async (req, res) => {
	//validation
	const {error} = await registerValidation(req.body);
	if (error) return res.status(400).send({error: error.details[0].message});
	
	//check for duplicates
	const emailExist = await User.findOne({email: req.body.email});
	if (emailExist) return res.status(400).send({error: 'Zadaný email je už zaregistrovaný!'});

	//password hashing
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	const init = await User.find({});

	//create a new user
	const user = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: hashedPassword,
		role: `${init.length === 0 ? ("admin") : ("basic")}`
	});

	try {
		const savedUser = await user.save();
		res.status(200).send({msg: "Registrácia prebehla úspešne."});
	} catch(err) {
		res.status(500).send({error: err.message});
	}
});

router.post('/add', verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
		//validation
		const {error} = await userAddValidation(req.body);
		if (error) return res.status(400).send({error: error.details[0].message});
		
		//check for duplicates
		const emailExist = await User.findOne({email: req.body.email});
		if (emailExist) return res.status(400).send({error: 'Zadaný email je už zaregistrovaný!'});

		//password hashing
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.password, salt);

		//create a new user
		const user = new User({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			password: hashedPassword,
			role: req.body.role
		});
		
		try {
			const savedUser = await user.save();
			res.status(200).send({msg: `Používateľ ${savedUser.fullName} bol pridaný.`});
		} catch(err) {
			res.status(500).send({error: err.message});
		}
	} else {
		res.status(401).send({error: "Prístup zamietnutý!"});
	}
});

router.post('/login', async (req, res) => {
	//validation
	const {error} = await loginValidation(req.body);
	if (error) return res.status(400).send({error: error.details[0].message});

	//check if email exists
	const user = await User.findOne({email: req.body.email});
	if (!user) return res.status(400).send({error: 'Email alebo heslo sú nesprávne!'});

	//check if password is correct
	const passwordExists = await bcrypt.compare(req.body.password, user.password);
	if (!passwordExists) return res.status(400).send({error: 'Email alebo heslo sú nesprávne!'});

	//create webtoken
	const token = jwt.sign({_id: user._id}, process.env.SECRET);
	user.tokens = user.tokens.concat({token});

	try {	
		await user.save();
		res.send({token: token, user: user});
	} catch(err) {
		res.status(500).send({error: err.message});
	}
});

router.post('/forgotPassword', async (req, res) => {
	const {error} = await forgotPasswordValidation(req.body);
	if (error) return res.status(400).send({error: error.details[0].message});

	const user = await User.findOne({email: req.body.email});
	if (!user) return res.status(400).send({error: 'So zadaným emailom nie je spojený žiadny používateľ.'});

	const token = jwt.sign({_id: user._id}, process.env.SECRET, { expiresIn: '1h' });
	user.resetToken = token;

<<<<<<< HEAD
	const resetURL = `http://flawis.flaw.uniba.sk/resetPassword/${token}`;

=======
	const resetURL = `http://localhost:3000/resetPassword/${token}`;
	
>>>>>>> dev
	try {
		await mail.send({
			user,
			subject: 'Password Reset',
			html: 
				`<!DOCTYPE html>
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
				'Pre obnovenie hesla prosim skopirujte do Vasho weboveho prehliadaca nasledujuci link:\n\n'
				+ resetURL + '\n\n'
				+'Ak si nezelate zmenit Vase heslo, ignorujte tento email.\n'
		});
		res.status(200).send({msg: 'Link na obnovenie hesla bol zaslaný na zadanú emailovú adresu.'});
	} catch(err) {
		res.status(500).send({error: err.message});
	}	
});

router.post('/reset/:token', async (req, res) => {
	const id = await jwt.verify(req.params.token, process.env.SECRET, function (err, decoded) {
		if (err) {
			if (err.message === "jwt expired") {
				return res.status(400).send({error: {message: "Token pre reset hesla expiroval!"}});
			}
			res.status(400).send({error: err});
		} else {
			return decoded;
		}
	});

	const {error} = await resetPasswordValidation(req.body);
	if (error) return res.status(400).send({error: error.details[0].message});

	const salt = await bcrypt.genSalt(10);
	req.body.password = await bcrypt.hash(req.body.password, salt);

	try {
		const user = await User.findOne({_id: id});
		user.password = req.body.password;
		await user.save();
		res.status(200).send({msg: 'Vaše heslo bolo zmenené!'});
	} catch(err) {
		res.status(500).send({error: err});
	}
});

router.post('/logout', verify, async (req, res) => {
	const user = req.user[0];
	try {
		user.tokens = user.tokens.filter(token => {
			return token.token !== req.token
		});
		await user.save();
		res.send({msg: `Deleted token: ${req.token}`});
	} catch(err) {
		res.status(500).send({error: err.message});
	}
});

router.post('/logoutall', verify, async (req, res) => {
	const user = req.user[0];
	try {
		user.tokens.splice(0, user.tokens.length);
		await user.save();	
		res.send({msg: "All devices have been logged out"});
	} catch(err) {
		res.status(500).send({error: err.message});
	}
});

router.get('/', verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
		try {
			const aggregate = await User.getUsersGrantsAggregation();			
			//const users = await User.find().populate({path: 'grants', populate:{path: 'members.member'}});	    
			res.status(200).send(aggregate);
		} catch(err) {
			res.status(500).send(err.message);
		}
	} else {
		res.status(401).send({error: "Prístup zamietnutý!"});
	}
});

router.get('/:id/:year', verify, async (req, res) => {
	const user = req.user[0];
	try {
		const match = await User.getUserGrantsAggregation(req.params.id, req.params.year);
		if (match.length !== 0) {
			res.status(200).send(match[0]);
		} else {
			res.status(404).send({error: "Používateľove granty pre zadaný rok neboli nájdené!"});
		}
	} catch(err) {
		res.status(500).send({error: err.message});
	}
});

router.get('/me', verify, async (req, res) => {
	const user = req.user[0];
	try {
		const match = await User.find({_id: user._id});
		if (match.length !== 0) {
			res.status(200).send(match[0]);
		} else {
			res.status(404).send({error: "Používateľ nebol nájdený!"});
		}
	} catch (err) {
		res.status(500).send({error: err.message});
	}
});

router.get('/:id', verify, async (req, res) => {
	try {
		const match = await User.find({_id: req.params.id}).populate({path: 'grants', populate: {path: 'members.member'}});
		if (match.length !== 0) {
			res.status(200).send(match[0]);
		} else {
			res.status(404).send({error: "Používateľ nebol nájdený!"});
		}
	} catch(err) {
		res.status(500).send({error: err.message});
	}
});

//prerobit update aby pocital s repeatpass ale neukladal to do DB
router.put('/:id', verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin" || user.role === "supervisor") {
		const {error} = await userUpdateValidation(req.body);
		if (error) return res.status(400).send({error: error.details[0].message});

		if (req.body.password) {
			const salt = await bcrypt.genSalt(10);
			req.body.password = await bcrypt.hash(req.body.password, salt);
		}

		try {
			const userAct = await User.find({_id: req.params.id});
			if (userAct[0].email !== req.body.email) {
				const emailExist = await User.findOne({email: req.body.email});
				if (emailExist) return res.status(400).send({error: 'Zadaný email je už zaregistrovaný!'});

				const update = await User.findOneAndUpdate({_id: req.params.id}, {$set: req.body}, {new: true});
				return res.status(200).send({msg: `Používateľ ${update.fullName} aktualizovaný.`});
			} else {
				const update = await User.findOneAndUpdate({_id: req.params.id}, {$set: req.body}, {new: true});
				return res.status(200).send({msg: `Používateľ ${update.fullName} aktualizovaný.`});
			}
		} catch(err) {
			res.status(500).send({error: err.message});
		}
	} else {
		res.status(401).send({error: "Prístup zamietnutý!"});
	}
});

router.delete('/:id', verify, async (req, res) => {
	const user = req.user[0];
	if (user.role === "admin") {
		try {
			const user = await User.findOne({_id: req.params.id});
			if (!user) return res.status(404).send({error: "Používateľ nebol nájdený!"});
			
			await user.remove();

			res.status(200).send({msg: "Používateľ vymazaný!"});
		} catch(err) {
			res.status(500).send({error: err.message});
		}
	} else {
		res.status(401).send({error: "Prístup zamietnutý!"});
	}
});

//experimental endpoint
router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("authToken");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.SECRET);
    if (!verified) return res.json(false);

    const user = await User.findById(verified);
    if (!user) return res.json(false);

    return res.json({valid: true, user});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;