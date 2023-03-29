const bcrypt = require("bcrypt");

const client = require("../dbConfig");

const jwt = require("jsonwebtoken");

//Registration Function

module.exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const data = await client.query(`SELECT * FROM users WHERE email= $1;`, [
      email,
    ]); //Checking if user already exists
    const arr = data.rows;
    if (arr.length != 0) {
      return res.status(400).json({
        error: "Email already there, No need to register again.",
      });
    } else {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err)
          res.status(err).json({
            error: "Server error",
          });

        var flag = 1; //Declaring a flag

        //Inserting data into the database
        const registrationTime = new Date().toISOString();
        const status = "active";
        const user = {
          name,
          email,
          password: hash,
          registrationTime,
          status,
        };
        client.query(
          `INSERT INTO users (name, email, password, registration_time, status ) VALUES ($1,$2,$3,$4,$5);`,
          [
            user.name,
            user.email,
            user.password,
            user.registrationTime,
            user.status,
          ],
          (err) => {
            if (err) {
              flag = 0; //If user is not inserted is not inserted to database assigning flag as 0/false.
              console.error(err);
              return res.status(500).json({
                error: "Database error",
              });
            } else {
              flag = 1;
              const token = jwt.sign(
                //Signing a jwt token
                {
                  email: user.email,
                },
                process.env.SECRET_KEY,
                {
                  expiresIn: "1h",
                }
              );
              res.status(200).send({
                email,
                token,
                epiresIn: "3600",
                message: "User is registered successfully!",
              });
            }
          }
        );
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Database error while registring user!", //Database connection error
    });
  }
};
