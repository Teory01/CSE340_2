const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require("../utilities/account-validation")

//Route to show account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to handle user logOut
router.get("/logout", utilities.handleErrors(accountController.logOut))

// Route to build the update account view
router.get("/update", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount))

// Route to handle user registration
router.post("/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.buildRegisterAccount))

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkloginData,
    utilities.handleErrors(accountController.accountLogin))

// Process the update account
router.post(
    "/updateAccount",
    regValidate.updateAccountRules(),
    regValidate.checkUpdateAccountData,
    utilities.handleErrors(accountController.updateAccount))

// Process the update password
router.post(
    "/updatePassword",
    regValidate.updatePasswordRules(), 
    regValidate.checkUpdatePasswordData,
    utilities.handleErrors(accountController.updatePassword)
)

module.exports = router