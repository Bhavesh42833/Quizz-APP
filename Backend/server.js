import app from "./app.js";
import connectDB from "./config/Database.js";
import User from "./models/User.js";
import Quiz from  "./models/Quiz.js";
import Questions from "./models/Questions.js";
connectDB();



app.listen(5000,()=>{
    console.log("server connected on port 5000");
})