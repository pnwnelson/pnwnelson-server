const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const app = express();
const router = express.Router();
const cors = require("cors");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + "../public"));

/* ---------------- STARTED middleware to log all traffic ----------------*/
app.use(function(req, res, next) {
	console.log("Something is happening");
	res.header("Access-Control-Allow-Origin", "http://localhost:3000");
	//res.header("Access-Control-Allow-Credentials", true);
	res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next(); // goes to the next route
});

// FINISH BUILDING THE REDIRECT!!!
// app.get("/success", function(req, res) {
// 	res.redirect("/thankyou");
// });
/* ---------------- STOPPED middleware for all traffic ----------------*/

/* ---------------- STARTED initial load ----------------*/
app.get("/", function(req, res, next) {
	res.json({ message: "Server is ready to fetch from contact page" });
	console.log("Ready to fetch");
});
/* ---------------- STOPPED initial load ----------------*/

/* ---------------- STARTED api to send email with nodemailer ----------------*/
app.post("/sendmail", function(req, res) {
	console.log("fetch received by server");
	// nodemailer code here. This code successfully sends email when placed outside of a function.
	let transporter = nodemailer.createTransport({
		host: "mail.name.com",
		auth: {
			user: "kelly@pnwnelson.com",
			pass: "Solo1234"
		}
	});

	let mailOptions = {
		from: req.body.email,
		to: "nelson20@gmail.com",
		subject: "Website Contact Form",
		text: req.body.name + " says " + req.body.message
	};

	transporter.sendMail(mailOptions, (error, info) => {
		res.writeHead(200, { "Content-Type": "application/json" });
		res.write(JSON.stringify({ status: "success" }));
		if (error) {
			return console.log(error);
		} else {
			console.log("Message %s sent: %s", info.messageId, response);
			response.json(res.message);
		}
		transporter.close();
		//res.render("index");
		return res.end();
	});
});

/* ---------------- STOPPED api to send email with nodemailer ----------------*/

app.set("port", process.env.PORT || 3001);

app.listen(app.get("port"), () => {
	console.log(`Find the server at: http://localhost:${app.get("port")}/`);
});

console.log("The express server is running");
