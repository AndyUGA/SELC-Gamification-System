

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

  let filter = req.query.filter || "firstName";
  let teamName = [];

  const sessionCookie = req.cookies.session || "";

  let isUserLoggedIn = isLoggedIn(req);

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


          db.collection("teams").get().then(function (querySnapshot) {
            let teamsData = [];

            querySnapshot.forEach(function (doc) {

              convertToArray(teamsData, doc);
            });



            res.render("dashboard.ejs", {
              layout: 'Layout/layout.ejs',
              pagename: "dashboard",
              title: "Dashboard",
              dataArray,
              dataArray2,
              teamsData,
              isLoggedIn: isUserLoggedIn,
            });

          });
        });

      });



    })
    .catch((error) => {
      console.log(114, error);
      res.redirect("/login");
    });





});

router.get("/accountOverview", function (req, res) {

  let isUserLoggedIn = isLoggedIn(req);

  db.collection("users").get().then(function (querySnapshot) {
    let dataArray = [];

    let columnHeader = ['Name', 'Email', 'Team'];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });


    res.render("account-overview.ejs", {
      layout: 'Layout/layout.ejs',
      pagename: "account-overview",
      title: "Account Overview",
      columnHeader,
      dataArray,
      isLoggedIn: isUserLoggedIn,
    });

  });


});

router.get("/history", function (req, res) {
  let isUserLoggedIn = isLoggedIn(req);

  db.collection("history").orderBy("modified", "DESC").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });
    console.log(177, dataArray);
    res.render("history.ejs", {
      layout: 'Layout/layout.ejs',
      pagename: "history",
      title: "History",
      dataArray,
      isLoggedIn: isUserLoggedIn,
    });
  });


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

router.get("/loveboxQueue", function (req, res) {
  let isUserLoggedIn = isLoggedIn(req);

  db.collection("lovebox").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });


    res.render("loveboxQueue.ejs", {
      layout: 'Layout/layout.ejs',
      pagename: "loveboxqueue",
      title: "Lovebox Queue",
      dataArray,
      isLoggedIn: isUserLoggedIn,
    });

  });

});

router.get("/pointsForm", function (req, res) {

  const sessionCookie = req.cookies.session || "";
  let isUserLoggedIn = isLoggedIn(req);
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
          isLoggedIn: isUserLoggedIn,
        });
      });



    })
    .catch((error) => {
      console.log(285, error);
      res.redirect("/");
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

router.get("/profile/:fullName", function (req, res) {
  let isUserLoggedIn = isLoggedIn(req);
  let currentUser = req.params.fullName;

  db.collection("users").where("fullName", "==", currentUser).get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });



    const currentDB = db.collection("users").doc(dataArray[0].uid);
    currentDB.update({
      notes: [
        ...dataArray[0].notes,
        currentUser,
      ]

    })


    res.render("publicProfile.ejs", {
      layout: 'Layout/table-layout.ejs',
      pagename: "publicProfile",
      title: "Profile",
      dataArray,
      isLoggedIn: isUserLoggedIn,
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

router.get("/teamForm", function (req, res) {

  const sessionCookie = req.cookies.session || "";
  let isUserLoggedIn = isLoggedIn(req);
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {

      db.collection("users").get().then(function (querySnapshot) {
        let dataArray = [];
        querySnapshot.forEach(function (doc) {
          convertToArray(dataArray, doc);
        });

        res.render("teamForm.ejs", {
          layout: 'Layout/layout.ejs',
          dataArray,
          pagename: "pointsForm",
          title: "Modify Team",
          isLoggedIn: isUserLoggedIn,
        });
      });



    })
    .catch((error) => {
      console.log(320, error);
      res.redirect("/");
    });


});

router.get("/workshop/:workshopName", function (req, res) {

  let isUserLoggedIn = isLoggedIn(req);
  let workshopName = req.params.workshopName;

  db.collection("workshops").where("name", "==", workshopName).get().then(function (querySnapshot) {
    let dataArray = [];
    let currentEmails = [];

    let columnHeader = ['Name'];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });

    console.log(256, dataArray);

    res.render("workshop.ejs", {
      layout: 'Layout/table-layout.ejs',
      pagename: "workshop",
      title: workshopName,
      columnHeader,
      workshopName,
      dataArray,
      isLoggedIn: isUserLoggedIn,
    });

  });


});

router.get("/workshop2", function (req, res) {




  let isUserLoggedIn = isLoggedIn(req);




  res.render("workshop2.ejs", {
    layout: 'Layout/layout.ejs',
    pagename: "workshop2",
    title: "workshop2",
    isLoggedIn: isUserLoggedIn,
  });






});




router.post("/updatePositiveSparkCounter/:email", function (req, res) {

  const email = req.params.email;

  console.log(570, email);

  db.collection("users").where("email", "==", email).get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });

    let currentUserUID = dataArray[0].uid;
    let currentPositiveSparkCounter = dataArray[0].positiveSparkCounter;

    let updatePositiveSparkCounter = currentPositiveSparkCounter + 1;

    const currentDB = db.collection("users").doc(currentUserUID);
    currentDB.update({
      positiveSparkCounter: 1 + currentPositiveSparkCounter,
    })

    //res.send(`${updatePositiveSparkCounter}`);
  });



});


router.post("/modifyPoints", function (req, res) {


  let currentUser = req.body.currentUser;
  let fullName = currentUser.substring(0, currentUser.indexOf('(') - 1);

  let startIndexOfEmail = currentUser.indexOf("(");
  let endIndexOfEmail = currentUser.indexOf(")");

  let userEmail = currentUser.substring((startIndexOfEmail + 1), endIndexOfEmail);

  let today = new Date().toLocaleString();

  db.collection("history").add({
    attendee: fullName,
    email: userEmail,
    points: req.body.points,
    modified: today,
  });


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
    }).then(() => {

      const teamDB = db.collection("teams").doc(req.body.teamName)

      teamDB.update({
        attendees: admin.firestore.FieldValue.arrayUnion(`${dataArray[0].firstName} ${dataArray[0].lastName}`)
      })
    });

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

    })


    db.collection("workshops").doc(req.body.selectedWorkshop).update({
      attendees: admin.firestore.FieldValue.arrayUnion(`${dataArray[0].firstName} ${dataArray[0].lastName}`)
    }).then(function () {


      res.redirect("/Workshops")
    });
  });






});


//Add lovebox message to queue
router.post("/addMessageToQueue", function (req, res) {

  const message = req.body.message;
  console.log(548, message);
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

  db.collection("lovebox").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });



    const queueDB = db.collection("lovebox").doc('queue');

    queueDB.update({
      pendingMessages: admin.firestore.FieldValue.arrayUnion({
        firstName,
        lastName,
        message,
      })
    })


    console.log("Message added to queue");
    res.redirect('/lovebox');
  });
});

//Approve lovebox messages from queue
router.post("/approveMessage", function (req, res) {

  const message = req.body.message;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;



  db.collection("lovebox").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });


    const messagesDB = db.collection("lovebox").doc('Messages');
    const queueDB = db.collection("lovebox").doc('queue');

    //Add approved message into lovebox page
    messagesDB.update({
      message: admin.firestore.FieldValue.arrayUnion({
        firstName,
        lastName,
        message,
      })
    })

    //Delete approve message from queue
    db.collection("lovebox").get().then(function (querySnapshot) {
      let dataArray = [];

      querySnapshot.forEach(function (doc) {

        convertToArray(dataArray, doc);
      });

      let pendingMessages = dataArray[1].pendingMessages;
      console.log(dataArray[1].pendingMessages[0].message);

      for (let i = 0; i < pendingMessages.length; i++) {
        if (pendingMessages[i].message == message) {
          pendingMessages.splice(i, 1);
        }
      }

      queueDB.update({
        pendingMessages
      })

      console.log("Message added to lovebox");
      res.redirect('/loveboxQueue');
    });
  });
});


//Delete  lovebox messages from queue
router.post("/deleteMessage", function (req, res) {

  const message = req.body.message;
  console.log(639, message);

  //Delete approve message from queue
  db.collection("lovebox").get().then(function (querySnapshot) {
    let dataArray = [];

    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });

    let pendingMessages = dataArray[1].pendingMessages;
    console.log(dataArray[1].pendingMessages[0].message);

    for (let i = 0; i < pendingMessages.length; i++) {
      if (pendingMessages[i].message == message) {
        pendingMessages.splice(i, 1);
      }
    }
    const queueDB = db.collection("lovebox").doc('queue');
    queueDB.update({
      pendingMessages
    })

    console.log("Message added to lovebox");
    res.redirect('/loveboxQueue');
  });
});



router.post("/saveUserEmail", function (req, res) {


  currentUserEmail = req.body.userEmail;

});





module.exports = router;
