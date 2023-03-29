const client = require("../dbConfig");

module.exports.block = async (req, res) => {
  const userIds = req.body.usersIds;
  try {
    await client.query(`UPDATE users SET status=$1 WHERE id=ANY($2);`, [
      "blocked",
      userIds,
    ]);
    res.status(200).json({
      message: "Selected users have been blocked!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to block selected users" });
  }
};
