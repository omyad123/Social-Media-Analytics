import express from "express";
import { login,  register, users } from "../Controller/user.js";
import { Authenticated } from "../Middlewares/auth.js";

const router = express.Router();

//register user
router.post('/register',register);

//Login User
router.post('/login',login);

//All User 
router.get('/all',Authenticated,users);



export default router;
