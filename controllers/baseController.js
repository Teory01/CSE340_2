const utilities = require("../utilities")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {
    title: "Home",
    nav
  })
}

<<<<<<< HEAD
/* *********************************
 * Task 3 Trigger a 500 Server Error
 * ****************************** */
baseController.triggerError = async function (req, res, next) {
  throw new Error("500 Server Error")  
}


=======
>>>>>>> c45a88358101a98694d3d61b02612c7228c741c3
module.exports = baseController