const client = require("../dbConfig");

module.exports.unblock = async (req, res) => {
  const userIds = req.body.usersIds;

  try {
    await client.query(`UPDATE users SET status=$1 WHERE id=ANY($2);`, [
      "active",
      userIds,
    ]); 
    res.status(200).json({ message: "Selected users have been unblocked." });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Failed to unblock selected users in database." });
  }
};
