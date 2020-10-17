
require('dotenv').config()
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");



const db = admin.firestore()

function convertToArray(dataArray, doc) {

  return dataArray.push(doc.data());
}

router.get("/", function (req, res) {


  db.collection("users").orderBy("firstName", "ASC").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });
    db.collection("workshops").get().then(function (querySnapshot) {
      let dataArray2 = [];
      querySnapshot.forEach(function (doc) {

        convertToArray(dataArray2, doc);
      });
      console.log(31, dataArray2);
      console.log(32, dataArray2[0].attendees.length);
      res.render("dashboard.ejs", {
        layout: 'Layout/layout.ejs',
        pagename: "dashboard",
        title: "Dashboard",
        dataArray,
        dataArray2
      });
    });

  });


});

router.get("/leaderboard", function (req, res) {


  db.collection("users").orderBy("points", "DESC").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });
    res.render("leaderboard.ejs", {
      layout: 'Layout/layout.ejs',
      pagename: "leaderboard",
      title: "Leaderboard",
      dataArray,
    });
  });


});


router.get("/test", function (req, res) {


  db.collection("users").orderBy("points").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });
    
    console.log(77, dataArray);
    res.render("test.ejs", {
      layout: 'Layout/layout.ejs',
      pagename: "test",
      title: "test",
      dataArray,
    });
  });


});

router.get("/pointsForm", function (req, res) {

  const sessionCookie = req.cookies.session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {

      db.collection("users").orderBy('firstName').get().then(function (querySnapshot) {
        let dataArray = [];
        querySnapshot.forEach(function (doc) {
          convertToArray(dataArray, doc);
        });
        console.log(81, dataArray);
        res.render("pointsForm.ejs", {
          layout: 'Layout/layout.ejs',
          dataArray,
          pagename: "pointsForm",
          title: "Modify Points",
        });
      });



    })
    .catch((error) => {
      console.log(100, error);
      res.redirect("/");
    });


});

router.get("/teamForm", function (req, res) {

  const sessionCookie = req.cookies.session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {

      db.collection("users").get().then(function (querySnapshot) {
        let dataArray = [];
        querySnapshot.forEach(function (doc) {
          convertToArray(dataArray, doc);
        });
        //console.log(125, dataArray);
        res.render("teamForm.ejs", {
          layout: 'Layout/layout.ejs',
          dataArray,
          pagename: "pointsForm",
          title: "Modify Team",
        });
      });



    })
    .catch((error) => {
      console.log(100, error);
      res.redirect("/");
    });


});

router.post("/modifyPoints", function (req, res) {


  let currentUser = req.body.currentUser;

  let startIndexOfEmail = currentUser.indexOf("(");
  let endIndexOfEmail = currentUser.indexOf(")");

  let userEmail = currentUser.substring((startIndexOfEmail + 1), endIndexOfEmail);


  db.collection("users").where("email", "==", userEmail).get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });

    let currentUserUID = dataArray[0].uid;
    let currentUserPoints = dataArray[0].points;

    const currentDB = db.collection("users").doc(currentUserUID);
    currentDB.update({
      points: req.body.points + currentUserPoints,
    })

  });

  res.redirect(301, "/");


});

router.post("/modifyTeam", function (req, res) {


  let currentUser = req.body.currentUser;

  let startIndexOfEmail = currentUser.indexOf("(");
  let endIndexOfEmail = currentUser.indexOf(")");

  let userEmail = currentUser.substring((startIndexOfEmail + 1), endIndexOfEmail);


  db.collection("users").where("email", "==", userEmail).get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });

    let currentUserUID = dataArray[0].uid;

    const currentDB = db.collection("users").doc(currentUserUID);
    currentDB.update({
      teamName: req.body.teamName,
    })

  });

  res.redirect(301, "/");


});



module.exports = router;
