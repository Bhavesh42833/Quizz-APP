import Quiz from "../models/Quiz.js";
import Questions from "../models/Questions.js";

export const createQuiz = async (req, res) => {
    try{
       const {title,description,startTime,endTime,questions}=req.body;
       let ques_id=[];
       const quiz=await Quiz.create({
        title,
        description:description || "",
        startTime:startTime||Date.now(),
        endTime:endTime||Date.now() + 30 * 60 * 1000,
        creator:req.user._id,
        questions:[],
    });
        for(let i=0;i<questions.length;i++){
            const ques=await Questions.create({
                question:questions[i].question,
                options:questions[i].options,
                answer:questions[i].answer,
                timer:questions[i].timer,
                quizId:quiz._id,})
            ques_id.push(ques._id);
        }

        quiz.questions=ques_id;
        await quiz.save();
        res.status(200).json({
            success:true,
            message:"Quiz created successfully",
            quiz,
        });
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Internal server error",
            error,
        });
    }
}