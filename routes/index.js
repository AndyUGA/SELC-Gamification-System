

const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();

var currentUserEmail;




function convertToArray(dataArray, doc) {

  return dataArray.push(doc.data());
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


      db.collection("workshops").get().then(function (querySnapshot) {
        let dataArray2 = [];
        querySnapshot.forEach(function (doc) {

          convertToArray(dataArray2, doc);
        });

        var getOptions = {
          source: 'cache'
        };

        db.collection("teams").get(getOptions).then(function (querySnapshot) {
          let teamsData = [];

          querySnapshot.forEach(function (doc) {

            convertToArray(teamsData, doc);
          });



          res.render("dashboard.ejs", {
            layout: 'Layout/layout.ejs',
            pagename: "dashboard",
            title: "Dashboard",
            dataArray2,
            teamsData,
            isLoggedIn: isUserLoggedIn,
          });

        }).catch(function (err) {
          console.log(79, err);
        })
          ;
      });





    })
    .catch((error) => {
      console.log(114, error);
      res.redirect("/login");
    });





});


/*
router.get("/accountOverview", function (req, res) {

  let isUserLoggedIn = isLoggedIn(req);

  db.collection("users").orderBy("firstName").get().then(function (querySnapshot) {
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
*/

router.get("/history", function (req, res) {
  let isUserLoggedIn = isLoggedIn(req);

  db.collection("history").orderBy("modifiedDate", "DESC").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });
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



  if (!isUserLoggedIn) {
    res.redirect('/login');
  }

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
      pagename: "loveboxQueue",
      title: "Lovebox Queue",
      dataArray,
      isLoggedIn: isUserLoggedIn,
    });

  });

});

router.get("/pointsFormEmpty", function (req, res) {


  const sessionCookie = req.cookies.session || "";
  let isUserLoggedIn = isLoggedIn(req);

  let showUpdatePointsButton = false;

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {

      res.render("pointsFormEmpty.ejs", {
        layout: 'Layout/layout.ejs',
        pagename: "pointsFormEmpty",
        title: "Modify Points",
        isLoggedIn: isUserLoggedIn,


      });
    });

});


router.get("/pointsForm/:searchQuery", function (req, res) {

  let userInputtedSearchQuery = req.params.searchQuery;
  let searchQuery = (userInputtedSearchQuery.substring(0, 1)).toLocaleUpperCase() + userInputtedSearchQuery.substring(1);
  console.log(253, searchQuery);
  const sessionCookie = req.cookies.session || "";
  let isUserLoggedIn = isLoggedIn(req);

  let showUpdatePointsButton = false;

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {

      db.collection("users").where("fullName", ">=", searchQuery).where("fullName", "<=", `${searchQuery}\uf8ff`).get().then(function (querySnapshot) {
        let dataArray = [];
        querySnapshot.forEach(function (doc) {
          convertToArray(dataArray, doc);
        });

        if (dataArray.length >= 1) {
          showUpdatePointsButton = true;
        }

      

        db.collection("history").limit(5).get().then(function (querySnapshot) {
          let historyArray = [];
          querySnapshot.forEach(function (doc) {
            convertToArray(historyArray, doc);
          });
          console.log(281, historyArray[0].data[0]);
          res.render("pointsForm.ejs", {
            layout: 'Layout/table-layout.ejs',
            dataArray,
            historyArray,
            pagename: "pointsForm",
            title: "Modify Points",
            isLoggedIn: isUserLoggedIn,
            showUpdatePointsButton,

          });
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

router.get("/profile", function (req, res) {

  let isUserLoggedIn = isLoggedIn(req);

  if (!isUserLoggedIn) {
    res.redirect('/login');
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


  console.log(349, isLoggedIn);
  res.render("profile.ejs", {
    layout: 'Layout/layout.ejs',
    pagename: "profile",
    title: "Profile",
    isLoggedIn: isUserLoggedIn,
    userData,
    teamData,
    userIDs,
  });





});


router.get("/register-workshops", function (req, res) {
  let isUserLoggedIn = isLoggedIn(req);
  if (isUserLoggedIn == false) {
    res.redirect("/login");
  } else {


    let currentUserInfo = [];
    let dataArray = [];


    db.collection("workshops").orderBy("identifier", "ASC").get().then(function (querySnapshot) {

      querySnapshot.forEach(function (doc) {

        convertToArray(dataArray, doc);

      });

      let tempWorkshops = [...dataArray];

      res.render("register-workshops.ejs", {
        layout: 'Layout/layout.ejs',
        pagename: "register-workshops",
        title: "Register for Workshops!",
        dataArray: tempWorkshops,
        isLoggedIn: isUserLoggedIn,
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

      db.collection("users").orderBy("firstName").get().then(function (querySnapshot) {
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
      //res.redirect("/");
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


  db.collection("users").where("email", "==", email).get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });

    let currentUserUID = dataArray[0].uid;
    let currentPositiveSparkCounter = dataArray[0].positiveSparkCounter;



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

  let today = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  const historyDB = db.collection("history").doc("historyArray");

  historyDB.update({
    data: admin.firestore.FieldValue.arrayUnion(`${req.body.points} - ${fullName} - ${userEmail} - ${today} - ${req.body.author}`)
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
      console.log(597, "Updating " + dataArray[0].fullName + " to " + req.body.teamName);
      const teamDB = db.collection("teams").doc(req.body.teamName)

      teamDB.update({
        attendees: admin.firestore.FieldValue.arrayUnion(`${dataArray[0].firstName} ${dataArray[0].lastName}`)
      }).then(() => {
        console.log(603, "Adding " + dataArray[0].fullName + " to " + req.body.teamName);
      })
    });

  });

  res.redirect(301, "/");


});

router.post("/registerWorkshop", (req, res) => {

  const selectedWorkshop = req.body.workshopName;


  db.collection("users").where("email", "==", req.body.userEmail).get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });

    let currentUserUID = dataArray[0].uid;
    let workshopAmount = dataArray[0].workshops.length;

    const currentDB = db.collection("users").doc(currentUserUID);

    let workshopJSON = {
      "A Penny Saved is a Dollar Earned: How to Invest in Your Future": "Track1",
      "It's A Bit Of A Stretch: Relaxing Yoga": "Track1",
      "How to Shoot Your Shot: A Beginner's Guide to Photography": "Track1",
      "A Hidden Enemy: Microagressions": "Track1",
      "Dealing With Burnout": "Track2",
      "Getting Control of Your Finances": "Track2",
      "Roll With It": "Track2",
      "From Tattered Boats to Thriving Communities: Organizing in the Vietnamese Diaspora": "Track2",
      "The Rocky Road to Success": "Track3",
      "VSA's Next Top Graphic Designer": "Track3",
      "Another Workshop Based on a Personality Quiz": "Track3",
      "Self-Awareness, Discovery, and Identification: A Cognitive Science Workshop": "Track3",
    }

    if (workshopJSON[selectedWorkshop] == "Track1") {
      currentDB.update({
        workshopTrack1: true
      })
    }
    else if (workshopJSON[selectedWorkshop] == "Track2") {
      currentDB.update({
        workshopTrack2: true
      })
    }
    else if (workshopJSON[selectedWorkshop] == "Track3") {
      currentDB.update({
        workshopTrack3: true
      })
    }

    if (workshopAmount >= 3) {
      res.redirect('/register-workshops');
    } else {

      currentDB.update({
        workshops: [
          ...dataArray[0].workshops,
          req.body.workshopName
        ],

      })

      console.log(732, req.body.selectedWorkshop);
      db.collection("workshops").doc(req.body.selectedWorkshop).update({
        attendees: admin.firestore.FieldValue.arrayUnion(`${dataArray[0].firstName} ${dataArray[0].lastName}`)
      }).then(function () {


        res.redirect("/Workshops")
      });
    }



  });






});


//Add lovebox message to queue
router.post("/addMessageToQueue", function (req, res) {

  const message = req.body.message;
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


      for (let i = 0; i < pendingMessages.length; i++) {
        if (pendingMessages[i].message == message) {
          pendingMessages.splice(i, 1);
        }
      }

      queueDB.update({
        pendingMessages
      })


      res.redirect('/loveboxqueue');
    });
  });
});


//Delete  lovebox messages from queue
router.post("/deleteMessage", function (req, res) {

  const message = req.body.message;


  //Delete approve message from queue
  db.collection("lovebox").get().then(function (querySnapshot) {
    let dataArray = [];

    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });

    let pendingMessages = dataArray[1].pendingMessages;


    for (let i = 0; i < pendingMessages.length; i++) {
      if (pendingMessages[i].message == message) {
        pendingMessages.splice(i, 1);
      }
    }
    const queueDB = db.collection("lovebox").doc('queue');
    queueDB.update({
      pendingMessages
    })


    res.redirect('/loveboxqueue');
  });
});



module.exports = router;
