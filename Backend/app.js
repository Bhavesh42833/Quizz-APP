import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import user from "./Routes/User.js"
import quiz from "./Routes/Quiz.js"
import CookieParser from "cookie-parser" 
import http from "http";

dotenv.config(
    {
        path:"./config/config.env"
    }
);

const app=express();

const server = http.createServer(app);
app.server=server;

app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({limit:"50mb",extended:true}));
app.use(CookieParser());

app.use("/api/v1/user",user);
app.use("/api/v1/quiz",quiz);

export default app;