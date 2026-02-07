const utilities = require(".")
const inventoryModel = require("../models/inventory-model")
const {
    body,
    validationResult
} = require("express-validator")
const validate = {}

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.addClassificationRules = () => {
    return [
        body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .matches(/^[A-Za-z0-9]+$/)
        .withMessage("A valid classification name is required.")
        .custom(async (classification_name) => {
            const classificationExists = await inventoryModel.checkExistingClassification(classification_name)
            if (classificationExists) {
                throw new Error("classification already exists")
            }
        }),
    ]
}


/* ******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    const {
        classification_name
    } = req.body
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            title: "Add Classification",
            nav,
            classification_name
        })
        return
    }
    next()
}

/* **********************************
 *  Inventory Data Validation Rules
 * ******************************** */
validate.addInventoryRules = () => {
    return [
        body("inv_make")
        .trim()
        .notEmpty()
        .matches(/^[A-Za-z0-9 ]+$/)
            .withMessage("A valid make is required."),
        
        body("inv_model")
        .trim()
        .notEmpty()
        .matches(/^[A-Za-z0-9 ]+$/)
            .withMessage("A valid model is required."),
        
        body("inv_year")
        .trim()
        .notEmpty()
        .isInt({
            min: 1800,
            max: 2100
        })
            .withMessage("A valid year is required."),
        
        body("inv_description")
        .trim()
        .notEmpty()
        .matches(/^[A-Za-z0-9\s,.'-]+$/)
            .withMessage("A valid description is required."),
        
        body("inv_price")
        .trim()
        .notEmpty()
        .isNumeric()
            .withMessage("A valid price is required."),
        
        body("inv_miles")
        .trim()
        .notEmpty()
        .isInt({
            min: 0
        })
            .withMessage("Valid mileage is required."),
        
        body("inv_color")
        .trim()
        .notEmpty()
        .matches(/^[A-Za-z0-9 ]+$/)
            .withMessage("A valid color is required."),
        
        body("classification_id")
        .notEmpty()
        .isInt()
        .withMessage("Please select a classification."),
    ]
}



validate.checkInventoryData = async (req, res, next) => {
    const {
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
    } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationOptions = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            title: "Add Inventory",
            nav,
            classificationOptions,
            errors,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
        })
        return
    }
    next()
}

/* **********************************
 *  Validate inventory data before processing update
 * ******************************** */
validate.checkUpdateData = async (req, res, next) => {
    const {
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
    } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const inventoryData = await invModel.getInventoryById(inventoryId)
        let classificationOptions = await utilities.buildClassificationList(classification_id)
        const name = inventoryData[0].inv_make + " " + inventoryData[0].inv_model
        res.render("./inventory/edit-inventory", {
            title: "Edit" + " " + name,
            nav,
            classificationOptions,
            errors,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
        })
        return
    }
    next()
}


module.exports = validate