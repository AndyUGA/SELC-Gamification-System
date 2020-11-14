

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



            res.redirect('/register-workshops')

          });
        });

      });



    })
    .catch((error) => {
      console.log(114, error);
      res.redirect("/login");
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
        console.log(431, dataArray);
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



router.post("/registerWorkshop", (req, res) => {


  db.collection("users").where("email", "==", req.body.userEmail).get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });

    let currentUserUID = dataArray[0].uid;

    let workshopAmount = dataArray[0].workshops.length;
    
    if(workshopAmount >= 3) {
      res.redirect('/register-workshops');
    } else {
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





module.exports = router;
