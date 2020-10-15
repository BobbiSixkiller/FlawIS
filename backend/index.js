require('dotenv').config();
require('./handlers/mail');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

//middleware
app.use(express.json());
app.use('/public', express.static('public'));
app.use(morgan('dev'));
app.use(cors());

//DB connecttion
mongoose.connect(
	process.env.DB_DEV,
	{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true },
	() => console.log('DB connected!')
);

//import routes
const userRoute = require('./routes/user');
const grantRoute = require('./routes/grant');
const announcementRoute = require('./routes/announcement');

//routes middleware
app.use('/api/user', userRoute);
app.use('/api/grant', grantRoute);
app.use('/api/announcement', announcementRoute);

app.use(function (err, req, res, next) {
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send({error: err.message});
});

app.listen(process.env.PORT, () => console.log('Server is up and running on port: ' + process.env.PORT));