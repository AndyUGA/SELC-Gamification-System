const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const express = require("express");
const admin = require("firebase-admin");
const expressLayouts = require('express-ejs-layouts');

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.databaseURL,
});

const csrfMiddleware = csrf({ cookie: true });

const PORT = process.env.PORT || 3000;
const app = express();



app.engine("html", require("ejs").renderFile);
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);

app.all("*", (req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});






app.use("/", require("./routes/index"));
app.use("/", require("./routes/users"));



app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
