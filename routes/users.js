const express = require("express");
const router = express.Router();

const { register } = require("../controllers/register");
const { login } = require("../controllers/login");
const { block } = require("../controllers/blockUser");
const { unblock } = require("../controllers/unblockUser");
const { deleteUser } = require("../controllers/deleteUser");
const { getUsers } = require("../controllers/getUsers");
const authMiddleware = require("../middlewares/isAuthenticated");

router.get("/", authMiddleware, getUsers); // GET request to retrieve all users to dashboard

router.post("/register", register); //POST request to register the user

router.post("/login", login); // POST request to login the user

router.post("/block", block); // Post request to block users

router.post("/unblock", unblock); // POST request to unblock users

router.post("/delete", deleteUser); // POST request to delete users

module.exports = router;
