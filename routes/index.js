

const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");



const db = admin.firestore()

function convertToArray(dataArray, doc) {

  return dataArray.push(doc.data());
}

router.get("/", function (req, res) {

  let filter = req.query.filter || "firstName";

  const sessionCookie = req.cookies.session || "";
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {

      db.collection("users").orderBy(filter, "ASC").get().then(function (querySnapshot) {
        let dataArray = [];
        querySnapshot.forEach(function (doc) {

          convertToArray(dataArray, doc);
        });
        db.collection("workshops").get().then(function (querySnapshot) {
          let dataArray2 = [];
          querySnapshot.forEach(function (doc) {

            convertToArray(dataArray2, doc);
          });
          res.render("dashboard.ejs", {
            layout: 'Layout/layout.ejs',
            pagename: "dashboard",
            title: "Dashboard",
            dataArray,
            dataArray2
          });
        });

      });



    })
    .catch((error) => {
      console.log(100, error);
      res.redirect("/login");
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

router.get("/workshops", function (req, res) {


  db.collection("workshops").orderBy("name", "ASC").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });

    console.log(93, dataArray);
    res.render("workshops.ejs", {
      layout: 'Layout/layout.ejs',
      pagename: "workshops",
      title: "workshops",
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

    const currentTeam = dataArray[0].teamName;
    let currentTeamPoints = 0;
    db.collection("teams").where("team", "==", currentTeam).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        currentTeamPoints = doc.data().points;
        const pointsDB = db.collection("teams").doc(currentTeam);
        pointsDB.update({
          points: req.body.points + currentTeamPoints,
        })
      });
    });



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

router.post("/registerWorkshop", (req, res) => {
  console.log(req.body);





  db.collection("users").where("email", "==", req.body.userEmail).get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });

    let currentUserUID = dataArray[0].uid;
    console.log(dataArray[0]);
   

    const currentDB = db.collection("users").doc(currentUserUID);
    currentDB.update({
      workshops: [
        ...dataArray[0].workshops,
        req.body.selectedWorkshop
      ]
    })

    db.collection("workshops").doc(req.body.selectedWorkshop).update({
      attendees: admin.firestore.FieldValue.arrayUnion(`${dataArray[0].firstName} ${dataArray[0].lastName}`)
     });
  });

 




});







module.exports = router;
