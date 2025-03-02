import express from "express";
import {createQuiz,quizLive} from "../controllers/Quiz.js"
import { isAuthenticated } from "../middlewares/auth.js";

const router=express.Router();
router.route("/create").post(isAuthenticated,createQuiz);
router.route("/:id").get(isAuthenticated,quizLive);

export default router;