import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    const dbUrl=process.env.DB_URL;
    if(!dbUrl){
        throw new Error("DB_URL is not defined");
    }

    try{
        await mongoose.connect(dbUrl).
        then(()=>console.log("Database connected"));
    }
    catch(error){
        console.log(error);
    }
}
export default connectDB;