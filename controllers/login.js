const bcrypt = require("bcrypt");

const client = require("../dbConfig");

const jwt = require("jsonwebtoken");

//Login Function
module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await client.query(`SELECT * FROM users WHERE email= $1;`, [
      email,
    ]); //Verifying if the user exists in the database
    const user = data.rows;

    if (user.length === 0) {
      res.status(400).json({
        error: "User is not registered, Sign Up first",
      });
    } else {
      if(user[0].status==='blocked'){
        res.json({
          error:"Sorry you are blocked, ask someone to unclock you!"
        })
      }
      bcrypt.compare(password, user[0].password, async (err, result) => {
        //Comparing the hashed password
        if (err) {
          res.status(500).json({
            error: "Server error",
          });
        } else if (result === true) {
          const lastLoginTime = new Date().toISOString();
          await client.query("UPDATE users SET last_login = $1 WHERE id = $2", [
            lastLoginTime,
            user[0].id,
          ]);
          //Checking if credentials match
          const token = jwt.sign(
            {
              email: email,
            },
            process.env.SECRET_KEY,
            {
              expiresIn: "1h",
            }
          );

          res.status(200).json({
            id: user[0].id,
            email,
            token: token,
            expiresIn: "3600",
            message: "User signed in!",
          });
        } else {
          //Declaring the errors
          if (result != true)
            res.status(400).json({
              error: "Enter correct password!",
            });
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Database error occurred while signing in!", //Database connection error
    });
  }
};
