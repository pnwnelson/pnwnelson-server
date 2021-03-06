const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const app = express();
const router = express.Router(); // do I need this?
const cors = require("cors");
const request = require("request");
const dotenv = require("dotenv")

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
	console.log(req.body)
	//Recaptcha stuff : BEGIN
	if (
		req.body.captcha === undefined ||
		req.body.captcha === '' ||
		req.body.captcha === null
		) {
			return res.json({"success": false, "msg": "Please check the box"})
	}
	// Secret Key
	const secretKey = process.env.RECAPTCHA_SECRET_KEY;

	// Verify Google URL
	const verifyURL = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`;

	// Make request to verify URL
	request(verifyURL, (err, response, body) => {
		body = JSON.parse(body);
		console.log(body)
		// if not successful
		if (body.success !== undefined && !body.success) {
			return res.json({"success": false, "msg": "failed captcha verification"})
		}

		// if successful
		return res.json("success") //Had to keep it only "success" - the msg was interferring with the TY redirect
	})

	//Recaptcha stuff : END

	console.log("fetch received by server: " + req);
	// nodemailer code here. This code successfully sends email when placed outside of a function.
	const emailPassword = process.env.EMAIL_PW
	const emailFrom = process.env.EMAIL_FROM
	
	let transporter = nodemailer.createTransport({
		host: "mail.name.com",
		auth: {
			user: emailFrom,
			pass: emailPassword
		}
	});

	const emailTo = process.env.EMAIL_TO
	let mailOptions = {
		from: req.body.email,
		to: emailTo,
		subject: "Kelly Nelson Photography Contact",
		text: req.body.name + " says " + req.body.message
	};
	//console.log("email contents built: " + mailOptions);

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return res.json(error) && console.error(error) 
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
