require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

//middleware
app.use(express.json());
app.use("/public", express.static("public"));
app.use(morgan("dev"));
app.use(cors());

//DB connecttion
mongoose.connect(
	process.env.DB,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	},
	() => console.log("DB connected!")
);

//import routes
const userRoute = require("./routes/user");
const grantRoute = require("./routes/grant");
const announcementRoute = require("./routes/announcement");
const postRoute = require("./routes/post");

//routes middleware
app.use("/api/user", userRoute);
app.use("/api/grant", grantRoute);
app.use("/api/announcement", announcementRoute);
app.use("/api/post", postRoute);

app.listen(process.env.PORT, () =>
	console.log("Server is up and running on port: " + process.env.PORT)
);
