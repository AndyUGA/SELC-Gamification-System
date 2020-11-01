

const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();

var currentUserEmail;




function convertToArray(dataArray, doc) {

  return dataArray.push(doc.data());
}

function getCurrentUserData(email) {

  db.collection("users").where("email", "==", email).get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {


      return doc.data();
    });
  });
}

function getEmail(fullname) {
  let currentEmail;
  db.collection("users").where("fullname", "==", fullname).get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });
    console.log(36, "Returning " + dataArray[0].email);
    currentEmail =  dataArray[0].email;

  });
  return currentEmail;
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

router.get("/register-workshops", function (req, res) {


  let currentUserInfo = [];
  let dataArray = [];

  db.collection("users").where("email", "==", currentUserEmail).get().then(function (querySnapshot) {

    querySnapshot.forEach(function (doc) {

      convertToArray(currentUserInfo, doc);
    });

  }).then(function () {
    db.collection("workshops").orderBy("identifier", "ASC").get().then(function (querySnapshot) {

      querySnapshot.forEach(function (doc) {

        convertToArray(dataArray, doc);

      });

      let tempWorkshops = [...dataArray];
      let userCurrentWorkshops = currentUserInfo[0].workshops;
      let registeredWorkshopNumber = currentUserInfo[0].workshops.length;


      for (let i = 0; i < userCurrentWorkshops.length; i++) {

        for (let j = 0; j < dataArray.length; j++) {

          if (userCurrentWorkshops[i] == dataArray[j].name) {
            tempWorkshops[j].show = false;
          }
        }
      }



      res.render("register-workshops.ejs", {
        layout: 'Layout/layout.ejs',
        pagename: "register-workshops",
        title: "Register for Workshops!",
        dataArray: tempWorkshops,
        registeredWorkshopNumber,
      });
    });
  });




});


router.get("/workshop/:workshopName", function (req, res) {


  let workshopName = req.params.workshopName;

  db.collection("workshops").where("name", "==", workshopName).get().then(function (querySnapshot) {
    let dataArray = [];
    let currentEmails = [];

    let columnHeader = ['Name'];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });

    // for (let i = 0; i < dataArray[0].attendees.length; i++) {
    //   let tempEmail;
    //   console.log(178, dataArray[0].attendees[i]);
    //   tempEmail = getEmail(dataArray[0].attendees[i]);
    //   console.log(183, tempEmail);
    // }

    // console.log(186, dataArray);
    // console.log(187, currentEmails);

    res.render("workshop.ejs", {
      layout: 'Layout/table-layout.ejs',
      pagename: "workshop",
      title: workshopName,
      columnHeader,
      workshopName,
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


  db.collection("users").where("email", "==", req.body.userEmail).get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });

    let currentUserUID = dataArray[0].uid;



    const currentDB = db.collection("users").doc(currentUserUID);
    currentDB.update({
      workshops: [
        ...dataArray[0].workshops,
        req.body.workshopName
      ]
    }).then(() => {
      console.log("Added workshop to profile!");
    })


    db.collection("workshops").doc(req.body.selectedWorkshop).update({
      attendees: admin.firestore.FieldValue.arrayUnion(`${dataArray[0].firstName} ${dataArray[0].lastName}`)
    }).then(function () {
      console.log("Successfully registered for workshop!");

      res.redirect("/Workshops")
    });
  });






});


router.post("/saveUserEmail", function (req, res) {

  console.log(350, req.body.userEmail);
  currentUserEmail = req.body.userEmail;
  console.log(352, currentUserEmail);
});





module.exports = router;
