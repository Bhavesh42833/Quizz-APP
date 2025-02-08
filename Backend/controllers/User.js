import User from "../models/User.js";
import cloudinary from "cloudinary";
export const createUser = async (req, res) => {
    try{
          const {name,email,password}=req.body;
        //   const myCloud=await cloudinary.v2.uploader.upload(image,{
        //    folder:"users",
        //   });
          let user=await User.findOne({email});
          if(user){
              return res.status(400).json({
                  success:false,
                  message:"User already Exists",}); 
              }
   
          user=await User.create({
              name,
              email,
              password,
            //   avatar:{
            // //    public_id:myCloud.public_id,
            // //    url:myCloud.secure_url, 
            //   }
          });
   
          const token=await user.generateToken();
          const options={
              expires:new Date(Date.now()+90*24*60*60*1000),
              httpOnly:true,
              secure:true,
              sameSite:"None",
          }
   
               res.status(201).cookie("token",token,options).json({
                  success:true,
                  message:"User created successfully",
                  profile:user,
              })
          }
           
   catch(err){
       res.status(500).json({
           success:false,
           message:err.message,
       });
    }
   }
   
   
   export const loginUser = async (req, res) => {
       try {
           const {email,password}=req.body;
   
           let user=await User.findOne({email}).select("+password");
           if(!user)
               return res.status(400).json({
           success:false,
           message:"User does not exist",});
           
           const isMatch=await user.comparePassword(password);
          
           if(!isMatch)
               return res.status(400).json({
           success:false,
           message:"Incorrect password",});
           
           const token=await user.generateToken();
           const options={
               expires:new Date(Date.now()+90*24*60*60*1000),
               httpOnly:true,
               secure:true,
               sameSite:"None",
           }
   
           res.status(200).cookie("token",token,options).json({
               success:true,
               message:"User logged in successfully",
               profile:user,
           });
       } catch (error) {
           res.status(400).json({
               success:false,
               message:error.message,
           })
       }
   }
   
   export const logoutUser=async(req,res)=>{
       res.status(200).cookie("token",null,{
           expires:new Date(Date.now()),
           httpOnly:true,
           secure:true,
           sameSite:"None",
       }).json({
           success:true,
           message:"User logged out successfully",
       })
   }
   
   