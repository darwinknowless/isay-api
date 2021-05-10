const express = require("express");
const router = express.Router();

// IMPORT HERE
const utilsController = require("../controllers/utilsController");
const imageUpload = require("../middlewares/upload/images")

// SET ROUTER HERE
router.get("/location/", utilsController.getAllLocation);
router.get("/interest/:category", utilsController.getInterest);
router.post("/genProfile", utilsController.generateBasicProfile);

//example image upload
// router.post("/testupload", imageUpload, function (req,res){
//     console.log(req.images);
//     return res.status(200).json({images : req.images[0]})
// });


module.exports = router;
