const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()

  // Not logged in
  if (!res.locals.loggedin) {
    req.flash("error", "You must be logged in to manage inventory.")
    return res.redirect("/account/login")
  }
  // Logged in but not authorized
  if (
    res.locals.accountData.account_type !== 'Admin' &&
    res.locals.accountData.account_type !== 'Employee'
  ) {
    req.flash("error", "You do not have permission to manage inventory.")
    return res.redirect("/account/login")
  }
  // Authorized (Admin or Employee)
  const classificationOptions = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classificationOptions,
    errors: null,
  })
}


/* ***************************
 *  Build add-classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null
  })
}

/* ***************************
 *  Process classification addition
 * ************************** */
invCont.processAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    classification_name
  } = req.body
  const result = await invModel.addClassification(classification_name)
  const classificationOptions = await utilities.buildClassificationList()
  if (result) {
    req.flash("success", `Successfully added ${classification_name} classification.`)
    let nav = await utilities.getNav()
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationOptions,
      errors: null
    })
  } else {
    req.flash("error", "Sorry, the classification addition failed.")
    res.status(501).render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
    })
  }
}

/* ***************************
 *  Build add-inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationOptions = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationOptions,
    errors: null
  })
}


/* ***************************
 *  Process inventory addition
 * ************************** */
invCont.processAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
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

  const numericId = parseInt(classification_id)
  const classificationOptions = await utilities.buildClassificationList()

  // ✅ Check if inventory already exists FIRST
  const exists = await invModel.checkIfInventoryExists(inv_make, inv_model, inv_year)
  if (exists) {
    req.flash("error", "This inventory item already exists.")
    return res.status(400).render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationOptions,
      errors: null
    })
  }

  // ➕ Add only if it doesn't exist
  const result = await invModel.addInventory(
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, numericId
  )

  if (result) {
    req.flash("success", `Successfully added ${inv_make} inventory.`)
    return res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationOptions,
      errors: null
    })
  } else {
    req.flash("error", "Sorry, the inventory addition failed.")
    return res.status(501).render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationOptions,
      errors: null
    })
  }
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  console.log('Request Params:', req.params)
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

invCont.buildByInventoryId = async function (req, res, next) {
  const invId = req.params.invId
  const data = await invModel.getInventoryById(invId)
  const nav = await utilities.getNav()
  if (data.length > 0) {
    const itemHTML = await utilities.buildDetailView(data[0])
    res.render("./inventory/details", {
      title: `${data[0].inv_make} ${data[0].inv_model}`,
      nav,
      itemHTML,
    })
  } else {
    next({
      status: 404,
      message: "Vehicle not found"
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


/* ***************************
 *  Build edit-inventory (update) view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inventoryId = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const inventoryData = await invModel.getInventoryById(inventoryId)
  const classificationOptions = await utilities.buildClassificationList(inventoryData[0].classification_id)
  const name = inventoryData[0].inv_make + " " + inventoryData[0].inv_model
  res.render("./inventory/edit-inventory", {
    title: "Edit" + " " + name,
    nav,
    classificationOptions: classificationOptions,
    errors: null,
    inv_id: inventoryData[0].inv_id,
    inv_make: inventoryData[0].inv_make,
    inv_model: inventoryData[0].inv_model,
    inv_year: inventoryData[0].inv_year,
    inv_description: inventoryData[0].inv_description,
    inv_image: inventoryData[0].inv_image,
    inv_thumbnail: inventoryData[0].inv_thumbnail,
    inv_price: inventoryData[0].inv_price,
    inv_miles: inventoryData[0].inv_miles,
    inv_color: inventoryData[0].inv_color,
    classification_id: inventoryData[0].classification_id
  })
}


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("success", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationOptions = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("error", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationOptions: classificationOptions,
      errors: null,
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
    })
  }
}


/* ***************************
 *  Build delete view
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  const inventoryId = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const inventoryData = await invModel.getInventoryById(inventoryId)
  const name = inventoryData[0].inv_make + " " + inventoryData[0].inv_model
  res.render("./inventory/delete-confirm", {
    title: "Delete" + " " + name,
    nav,
    errors: null,
    inv_id: inventoryData[0].inv_id,
    inv_make: inventoryData[0].inv_make,
    inv_model: inventoryData[0].inv_model,
    inv_year: inventoryData[0].inv_year,
    inv_price: inventoryData[0].inv_price,
  })
}



/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_price,
    inv_year
  } = req.body
  const updateResult = await invModel.deleteInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_price,
    inv_year
  )

  if (updateResult) {
    const itemName = req.body.inv_make + " " + req.body.inv_model
    req.flash("success", `The ${itemName} was successfully delete.`)
    res.redirect("/inv/")
  } else {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("error", "Sorry, the delete failed.")
    res.status(501).render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
    })
  }
}

invCont.addToWishlist = async function (req, res, next) {

  if (!res.locals.loggedin) {
    req.flash("error", "Please login or register to use the wishlist.")
    res.redirect("/account/login")
  }
  const account_id = res.locals.accountData.account_id
  const wishilistExists = await invModel.checkIfWishlistExists(account_id, req.body.inv_id)
  
  if (wishilistExists) {
    req.flash("error", "This vehicle is already in your wishlist.")
    return res.redirect("back")
  }

  const { inv_id } = req.body
  console.log(account_id, inv_id)
  await invModel.addInventoryToWishlist(account_id, inv_id)
  req.flash("success", "Vehicle added to your wishlist.")
  res.redirect("back")
}



invCont.getWishlistJSON = async (req, res, next) => {
  const account_id = res.locals.accountData.account_id
  const invData = await invModel.getWishlistByAccountId(account_id)
  if (invData) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}



invCont.buildWishlist = async function (req, res, next) {
  let nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id
  const wishlistData = await invModel.getWishlistByAccountId(account_id)
  let list = []
  for (const item of wishlistData) {
    const data = await invModel.getInventoryById(item.inv_id)
    list.push(data[0])
  }
  const wishlist =  await utilities.buildClassificationGrid(list)
  res.render("./inventory/wishlist", {
    title: res.locals.accountData.account_firstname + "'s " + " Wishlist",
    nav,
    wishlist
  })
}

invCont.deleteFromWishlist = async function (req, res, next) {
  const account_id = res.locals.accountData.account_id
  const { inv_id } = req.body
  await invModel.deleteFromWishlist(account_id, inv_id)
  req.flash("success", "Vehicle removed from your wishlist.")
  res.redirect("back")
}

module.exports = invCont