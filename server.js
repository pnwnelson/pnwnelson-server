const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const app = express();
const router = express.Router();
const cors = require("cors");
const request = require("request");

// app.use(cors()); // this causes a "204 No Content" network response
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + "../public"));

/* ---------------- STARTED middleware to log all traffic ----------------*/
app.use(function(req, res, next) {
	console.log("CORS headers are happening");
	res.header("Access-Control-Allow-Origin", "*");
	//res.header("Access-Control-Allow-Credentials", true);
	res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next(); // goes to the next route
});

/* ---------------- STOPPED middleware for all traffic ----------------*/

/* ---------------- STARTED initial load ----------------*/
app.get("/", function(req, res, next) {
	res.json({ message: "Server is ready to fetch from contact page" });
	console.log("Ready to fetch");
});
/* ---------------- STOPPED initial load ----------------*/

/* ---------------- STARTED api to send email with nodemailer ----------------*/
app.post("/sendmail", cors(), function(req, res) {
	//Recaptcha stuff : BEGIN
	if (
		req.body.captcha === undefined ||
		req.body.captcha === '' ||
		req.body.captcha === null
		) {
			return res.json({"success": false, "msg": "Please check the box"})
	}
	// Secret Key
	const secretKey = '6LfAwSgTAAAAAEWtfueiMzYr4VFCFOePeYFb3zDB';

	// Verify Google URL
	const verifyURL = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`;

	// Make request to verify URL
	request(verifyURL, (err, response, body) => {
		body = JSON.parse(body);

		// if not successful
		if (body.success !== undefined && !body.success) {
			return res.json({"success": false, "msg": "failed captcha verification"})
		}

		// if successful
		return res.json({"success": true, "msg": "captcha passed"})
	})

	//Recaptcha stuff : END

	console.log("fetch received by server: " + req);
	// nodemailer code here. This code successfully sends email when placed outside of a function.
	let transporter = nodemailer.createTransport({
		host: "mail.name.com",
		auth: {
			user: "kelly@pnwnelson.com",
			pass: "Solo1234"
		}
	});
	console.log("email creds sent");

	let mailOptions = {
		from: req.body.email,
		to: "nelson20@gmail.com",
		subject: "Kelly Nelson Photography Contact",
		text: req.body.name + " says " + req.body.message
	};
	//console.log("email contents built: " + mailOptions);

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		} else {
			console.log(info);
			res.json("success");
		}
		transporter.close();
		return res.end();
	});
});

/* ---------------- STOPPED api to send email with nodemailer ----------------*/

app.set("port", process.env.PORT || 3001);

app.listen(app.get("port"), () => {
	console.log(`Find the server at: http://localhost:${app.get("port")}/`);
});

console.log("The express server is running");
