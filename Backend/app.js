import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import user from "./Routes/User.js"
import quiz from "./Routes/Quiz.js"

dotenv.config(
    {
        path:"./config/config.env"
    }
);

const app=express();


app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({limit:"50mb",extended:true}));

app.use("/api/v1/user",user);
app.use("/api/v1/quiz",quiz);

export default app;