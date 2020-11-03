

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
      console.log(100, error);
      res.redirect("/login");
    });





});

router.get("/leaderboard", function (req, res) {
  let isUserLoggedIn = isLoggedIn(req);

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
      isLoggedIn: isUserLoggedIn,
    });
  });


});

router.get("/register-workshops", function (req, res) {
  let isUserLoggedIn = isLoggedIn(req);

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

      console.log(182, tempWorkshops);

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
      console.log(100, error);
      res.redirect("/");
    });


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
      console.log(100, error);
      res.redirect("/");
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

    console.log(339, dataArray);

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

router.get("/lovebox", function (req, res) {
  let isUserLoggedIn = isLoggedIn(req);

  db.collection("lovebox").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });
    console.log(379, ...dataArray[1].pendingMessages);
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

//Approve lovebox messages from queue
router.post("/approveMessage", function (req, res) {

  const message = req.body.message;

  db.collection("lovebox").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });


    const messagesDB = db.collection("lovebox").doc('Messages');
    const queueDB = db.collection("lovebox").doc('queue');


    messagesDB.update({
      message: [
        ...dataArray[0].message,
        message,
      ]
    })
    db.collection("lovebox").get().then(function (querySnapshot) {
      let dataArray = [];
   
      querySnapshot.forEach(function (doc) {
  
        convertToArray(dataArray, doc);
      });

      let pendingMessages = dataArray[1].pendingMessages;
 
      for(let i = 0; i < pendingMessages.length; i++) {
        if(pendingMessages[i] == message) {
            pendingMessages.splice(i,1);
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

//Add lovebox message to queue
router.post("/addMessageToQueue", function (req, res) {

  const message = req.body.message;

  db.collection("lovebox").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });
  


    const queueDB = db.collection("lovebox").doc('queue');

    queueDB.update({
      pendingMessages: [
        ...dataArray[1].pendingMessages,
        message,
      ]
    })


    console.log("Message added to queue");
    res.redirect('/lovebox');
  });
});


router.post("/saveUserEmail", function (req, res) {


  currentUserEmail = req.body.userEmail;

});





module.exports = router;
