const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}


async function testNav() {
  const nav = await Util.getNav()
  console.log(nav)
}


Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}


/* **************************************
 * Build the classification view HTML
 * ************************************ */
// Util.buildClassificationGrid = async function (data) {
//   let grid
//   if (data.length > 0) {
//     grid = '<ul id="inv-display">'
//     data.forEach(vehicle => {
//       grid += '<li>'
//       grid += '<a href="../../inv/detail/' + vehicle.inv_id +
//         '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model +
//         ' details"><img src="' + vehicle.inv_thumbnail +
//         '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model +
//         ' on CSE Motors" /></a>'
//       grid += '<div class="namePrice">'
//       grid += '<h2>'
//       grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' +
//         vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' +
//         vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
//       grid += '</h2>'
//       grid += '<span>$' +
//         new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
//       grid += '</div>'
//       grid += '</li>'
//     })
//     grid += '</ul>'
//   } else {
//     grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
//   }
//   return grid
// }

Util.buildClassificationGrid = async function (data) {
 if (!data || data.length === 0) {
    return `
      <p class="notice">Sorry, no matching vehicles could be found or there are no vehicles to be displayed.</p>
    `
  }

  let grid = '<ul id="inv-display">'

  data.forEach(vehicle => {
    grid += `
      <li>
        <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
        </a>
        <div class="namePrice">
          <div class="name-wishlist">
            <h2>
              <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                ${vehicle.inv_make} ${vehicle.inv_model}
              </a>
            </h2>
            <h2> 
              <form method="POST" action="/wishlist/add">
                <input type="hidden" name="inv_id" value="${vehicle.inv_id}">
                <button type="submit">Add to Wishlist</button>
              </form>
            </h2>
          </div>
          <span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
        </div>
      </li>
    `
  })

  grid += '</ul>'
  return grid
}




Util.buildDetailView = async function (item) {
  return `
  <div class="vehicle-background">
    <div id="vehicle-detail-container">
      <div class="vehicle-detail">
        <div class="vehicle-image-cont">
          <img src="${item.inv_image}" alt="Image of ${item.inv_make} ${item.inv_model}">
        </div>
        <div class="vehicle-info">
          <h2>${item.inv_make} ${item.inv_model}</h2>
          <p>Price: $${new Intl.NumberFormat('en-US').format(item.inv_price)}</p>
          <p>Mileage: ${new Intl.NumberFormat('en-US').format(item.inv_miles)} miles</p>
          <p>Year: ${item.inv_year}</p>
          <p>Color: ${item.inv_color}</p>
          <p><span class="vehicle-desc">Description</span> ${item.inv_description}</p>
        </div>
      </div>
    </div>
  </div>
  `
}


/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("error","Please log in")
          res.clearCookie("jwt")
          res.locals.loggedin = 0
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      })
  } else {
    res.locals.loggedin = 0 // 🔥 define this even if no token exists
    next()
  }
}


/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("error", "Please log in.")
    return res.redirect("/account/login")
  }
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util