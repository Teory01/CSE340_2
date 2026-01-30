const { check } = require("express-validator")
const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Insert into classification data
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    console.error("addClassification error:", error.message)
    throw error
  }
}


/* **********************
 *   Check for existing classification_name
 * ********************* */
async function checkExistingClassification(classification_name){
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const classification = await pool.query(sql, [classification_name])
    return classification.rowCount
  } catch (error) {
    return error.message
  }
}

async function checkIfInventoryExists(make, model, year) {
  try {
    const sql = `
      SELECT * FROM inventory 
      WHERE inv_make = $1 AND inv_model = $2 AND inv_year = $3
    `
    const result = await pool.query(sql, [make, model, year])
    return result.rowCount > 0 // true if it exists
  } catch (error) {
    throw new Error("Database error during inventory check")
  }
}

// async function chechIfWishlistExists ()



// /* **********************
//  *   Check for classification_id of classification_name
//  * ********************* */
// async function getClassificationId(classification_name){
//   try {
//     const sql = "SELECT classification_id FROM classification WHERE classification_name = $1"
//     const classificationId = await pool.query(sql, [classification_name])
//     return classificationId.rows[0]
//   } catch (error) {
//     return error.message
//   }
// }


/* ***************************
 *  Insert into classification data
 * ************************** */
async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  try {
    const sql = `
      INSERT INTO inventory (
        inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
        inv_price, inv_miles, inv_color, classification_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id];
    return await pool.query(sql, values);
  } catch (error) {
    console.error("addInventory error:", error.message);
    throw error;
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getInventoryById(inv_id) {
  try {
    const res = await pool.query(
    "SELECT * FROM public.inventory WHERE inv_id = $1",
    [inv_id]
    )
    return res.rows
  } catch (error) {
    console.error("getinventorybyid error " + error)
  }
}


/* ***************************
 *  Delete Inventory Data
 * ************************** */
async function deleteInventory(
  inv_id,
) {
  try {
    const sql =
      "DELETE FROM inventory WHERE inv_id = $1 "
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    console.error("Delete Inventory error: " + error)
  }
}


/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("Update error: " + error)
  }
}


async function addInventoryToWishlist(account_id, inv_id) {
  try {
    const sql =
      "INSERT INTO wishlist (account_id, inv_id) VALUES ($1, $2) RETURNING *"
    const data = await pool.query(sql, [account_id, inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("Add to wishlist error: " + error)
  }
}


async function checkExistingInventory(inv_id) {
  try {
    const sql = "SELECT * FROM inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("Check existing inventory error: " + error)
  }
  
}

async function checkIfWishlistExists(account_id, inv_id) {
  try {
      const sql = `SELECT * FROM wishlist 
       WHERE account_id = $1 AND inv_id = $2
     `
      const result = await pool.query(sql, [account_id, inv_id])
      return result.rowCount > 0 // returns true if exists
  } catch (error) {
      console.error("Check existing wishilist error: " + error)
  }
}

async function getWishlistByAccountId(account_id) {
  try {
    const res = await pool.query(
      `SELECT * FROM wishlist WHERE account_id = $1`,
      [account_id])
    return res.rows
  } catch (error) {
      console.error("get wishlist error " + error)
  }
}

async function deleteFromWishlist(account_id, inv_id) {
  try {
    const sql =
      "DELETE FROM wishlist WHERE account_id = $1 and inv_id = $2 "
    const data = await pool.query(sql, [account_id, inv_id])
    return data
  } catch (error) {
    console.error("Delete Wishlist error: " + error)
  }
}

// async function testGetInventory() {
//   try {
//     const data = await getInventoryByClassificationId(1);
//     console.log(data);
//   } catch (err) {
//     console.error(err);
//   }
// }

// testGetInventory();

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  addClassification,
  checkExistingClassification,
  addInventory,
  checkIfInventoryExists,
  updateInventory,
  deleteInventory,
  addInventoryToWishlist,
  checkExistingInventory,
  checkIfWishlistExists,
  getWishlistByAccountId,
  deleteFromWishlist
};