require("dotenv").config();
const client = require("../dbConfig");

module.exports.getUsers = async (req, res) => {
  try {
    const { user } = req; // get the user info from the request object
    if (!user) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    const users = await client.query(
      `SELECT id, name,email, last_login,registration_time, status,is_selected FROM users ORDER BY id;`
    );
    res.status(200).send(users.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to get user from the database" });
  }
};
