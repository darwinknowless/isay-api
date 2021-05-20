const express = require("express");
const router = express.Router();

// IMPORT HERE
const profileController = require("../controllers/profileController");

//IMPORT MIDDLEWARE
const profileValidator = require("../middlewares/validators/profileValidator");
const tokenParser = require("../middlewares/authentication/tokenParser");
const isAuth = require("../middlewares/authentication/isAuth");

//set variabel profile.id
let setProfileId = (req, res, next) => {
	req.profile = { id: req.user.profile };  
	next();
  };
// SET ROUTER PROFILE HERE

//view our profile
router.get("/getProfile/:id", tokenParser, isAuth, setProfileId, profileController.myProfile);
router.get("/Post", tokenParser, isAuth, setProfileId, profileController.myProfilePost);
router.get("/Activities", tokenParser, isAuth, setProfileId, profileController.myProfileActivities);

//view another profile
router.get("/an/:id", tokenParser, isAuth, setProfileId, profileController.anotherProfile);
router.get("/an/Post", tokenParser, isAuth, setProfileId, profileController.anotherProfilePost);
router.get("/an/Activities", tokenParser, isAuth, setProfileId, profileController.anotherProfileActivities);

//edit our profile
router.put("/:id", tokenParser, isAuth, setProfileId, profileValidator.profileValidate,profileController.profileUpdate);
router.put("/Interest/:id", tokenParser, isAuth, setProfileId, profileController.addInterest);
router.put("/DeleteInt/:id", tokenParser, isAuth, setProfileId, profileController.deleteInterest);
router.get("/userInterest",tokenParser, isAuth, setProfileId, profileController.getListUserInterest);

module.exports = router;
