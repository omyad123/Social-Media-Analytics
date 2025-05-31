import User  from "../Model/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import "dotenv/config";

const secretKey = process.env.JWT_SECRET;

//USER REGISTER
export const register = async(req,res)=>{
    const {name,email,password} =req.body;
    try{
        let user= await User.findOne({email});
        if(user)
            return res.status(409).json({ message: "User already exists", success: false });
        const hashPass = await bcrypt.hash(password,10);
        user = await User.create({name,email,password:hashPass});
        res.status(201).json({ message: "User registered successfully!", success: true });
    }catch(error){
        res.json({message:error.message});
    }
};

//USER LOGIN
export const login = async(req,res)=>{
    const {email,password} = req.body;
    try{
      let user = await User.findOne({email});
      if(!user)
        return res.json({message:"user not found",success:false});
      let validPass = await bcrypt.compare(password,user.password);
      if(!validPass)
        return res.json({message:"Incorrect Password",success:false});

     const token = jwt.sign({userId:user._id},secretKey,{expiresIn:'365d'});
    res.json({message:`welcome ${user.name}`,token,success: true});
    }catch(error){
        res.json({message:error.message});
    }
}

//GET ALL USER
export const users =async(req,res)=>{
    try{
    let users = await User.find().sort({createdAt:-1});
    res.json(users);
    }catch(error){
        res.json(error.message);
    }

} 

