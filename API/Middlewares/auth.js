import jwt from 'jsonwebtoken';
import User from '../Model/User.js';
export const Authenticated = async (req,res,next)=>{
    
     const secretKey = process.env.JWT_SECRET;  

    const authHeader = req.header("Authorization") || req.header("Auth");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    if(!token) return res.json({message:"Login first"});

    try{
     const decoded = jwt.verify(token,secretKey);
     const id = decoded.userId;
     let user = await User.findById(id);
     if(!user) return res.json({message:"User not found"});
     req.user = user;
     req.userId = id;

     next();
     
    }catch(err){
        res.json({message:err.message});
    }
}