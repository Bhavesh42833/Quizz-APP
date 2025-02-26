import express from "express";
import {createQuiz} from "../controllers/Quiz.js"
import { isAuthenticated } from "../middlewares/auth.js";

const router=express.Router();
router.route("/create").post(isAuthenticated,createQuiz);

export default router;