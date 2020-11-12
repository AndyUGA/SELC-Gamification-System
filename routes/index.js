

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
      console.log(22, doc.data());
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

    currentEmail = dataArray[0].email;

  });
  return currentEmail;
}

function isLoggedIn(req) {

  const sessionCookie = req.cookies.session || "";
  let isLoggedIn = false;
  if (sessionCookie) {
    isLoggedIn = true;
  }

  return isLoggedIn;
}

router.get("/", function (req, res) {

  let isUserLoggedIn = isLoggedIn(req);
  if (!isUserLoggedIn) {
    res.redirect('/login');
  } else {
    res.redirect("/leaderboard");
  }


});



router.get("/leaderboard", function (req, res) {
  let isUserLoggedIn = isLoggedIn(req);

  db.collection("teams").orderBy("points", "DESC").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });
    res.render("leaderboard.ejs", {
      layout: 'Layout/layout.ejs',
      pagename: "leaderboard",
      title: "Leaderboard",
      dataArray,
      isLoggedIn: isUserLoggedIn,
    });
  });


});

router.get("/lovebox", function (req, res) {
  let isUserLoggedIn = isLoggedIn(req);

  db.collection("lovebox").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });

    res.render("lovebox.ejs", {
      layout: 'Layout/layout.ejs',
      pagename: "lovebox",
      title: "Lovebox",
      dataArray: dataArray[0].message,
      isLoggedIn: isUserLoggedIn,
    });

  });
});



router.get("/positiveSparks", function (req, res) {

  const sessionCookie = req.cookies.session || "";
  let isUserLoggedIn = isLoggedIn(req);

  let userInfo = [];
  let userIDs = [];


  // db.collection('users').onSnapshot(docSnapshot => {
  //   docSnapshot.forEach((doc) => {
  //     console.log("Docs data: ", doc.data());
  //   })
  //   // ...
  // }, err => {
  //   console.log(`Encountered error: ${err}`);
  // });


  db.collection("users").orderBy("firstName").get().then(function (querySnapshot) {


    querySnapshot.forEach(function (doc) {

      convertToArray(userInfo, doc);
    });

    //console.log(385, userInfo);

    res.render("positiveSparks.ejs", {
      layout: 'Layout/layout.ejs',
      pagename: "positiveSparks",
      title: "Positive Sparks",
      isLoggedIn: isUserLoggedIn,
      userInfo,
      userInfoLength: userInfo.length,
    });

  });


});

router.get("/profile", function (req, res) {
  const sessionCookie = req.cookies.session || "";
  let isLoggedIn = false;
  if (sessionCookie) {
    isLoggedIn = true;
  }

  let userData;
  let teamData = [];
  let userIDs = [];

  db.collection("users").orderBy("points", "DESC").get().then(function (querySnapshot) {

    querySnapshot.forEach(function (doc) {

      convertToArray(userIDs, doc);
    });

  });


  db.collection("teams").orderBy("points", "DESC").get().then(function (querySnapshot) {

    querySnapshot.forEach(function (doc) {

      convertToArray(teamData, doc);
    });
  });




  db.collection("users").where("email", "==", currentUserEmail).get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      userData = doc.data();
    });
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then(() => {
        console.log(387, userIDs);

        let currentTeam = userData.teamName;
        let teamIDs = [];

        for (let i = 0; i < userIDs.length; i++) {
          if (userIDs[i].teamName == currentTeam) {
            teamIDs.push(userIDs[i]);
          }
        }
        console.log(397, teamIDs);

        res.render("profile.ejs", {
          layout: 'Layout/layout.ejs',
          pagename: "profile",
          title: "Profile",
          isLoggedIn,
          userData,
          teamData,
          teamIDs,
          userIDs,
          teamIDsLength: teamIDs.length,
        });
      })
      .catch((error) => {
        console.log(402, error);
        res.redirect("/");
      });

  });



});


router.get("/register-workshops", function (req, res) {
  let isUserLoggedIn = isLoggedIn(req);
  if (isUserLoggedIn == false) {
    res.redirect("/login");
  } else {

    let currentUserInfo = [];
    let dataArray = [];
    console.log(150, currentUserEmail);
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
          isLoggedIn: isUserLoggedIn,
        });
      });
    });
  }
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

    })


    db.collection("workshops").doc(req.body.selectedWorkshop).update({
      attendees: admin.firestore.FieldValue.arrayUnion(`${dataArray[0].firstName} ${dataArray[0].lastName}`)
    }).then(function () {


      res.redirect("/Workshops")
    });
  });






});






router.post("/saveUserEmail", function (req, res) {


  currentUserEmail = req.body.userEmail;

});





module.exports = router;
