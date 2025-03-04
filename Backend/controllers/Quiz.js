import Quiz from "../models/Quiz.js";
import Questions from "../models/Questions.js";
import io from Socket
import Server from "socket.io";
import User from "../models/User.js";
const activeQuiz={};

const createLeaderboard = (quizId) => {
    if (!activeQuiz[quizId] || !activeQuiz[quizId].users) {
        console.error("Quiz not found or no users available!");
        return [];
    }

    return Object.entries(activeQuiz[quizId].users)
        .map(([userId, details]) => ({
            userId,
            totalScore: details.totalScore,
            totalSubmissionTime: details.totalSubmissionTime,
            ques: details.ques 
        }))
        .sort((a, b) => {
            if (b.totalScore !== a.totalScore) {
                return b.totalScore - a.totalScore;
            }
            return a.totalSubmissionTime - b.totalSubmissionTime;
        });
};

const saveLeaderboard = async (quizId) => {
    try {
        const leaderboard = createLeaderboard(quizId);

        await Promise.all(leaderboard.map(async (data) => {
            const user = await User.findById(data.userId);
            if (!user) return;

            if (!user.quiz.includes(quizId)) {
                user.quiz.push(quizId);
                await user.save();
            }
        }));

        const quiz = await Quiz.findById(quizId);
        if (!quiz) throw new Error("Quiz not found");

        quiz.leaderboard = leaderboard;
        await quiz.save();

        console.log("Leaderboard saved successfully!");
    } catch (error) {
        console.error("Error saving leaderboard:", error);
    }
};
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
            message:error.message,
            error,
        });
    }
}

export const quizLive = async (req, res) => {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).populate("questions");

    if (!quiz) {
        return res.status(404).json({
            success: false,
            message: "Quiz not found",
        });
    }

    const entryCloseTime = quiz.startTime - 5 * 60 * 1000; 
    if (Date.now() > entryCloseTime) {
        return res.status(400).json({
            success: false,
            message: "Entry closes 5 minutes before the start of the quiz",
        });
    }

    if (!req.app.io) {
        const io = new Server(req.app.server, {
            cors: { origin: "*" },
        });
        req.app.io = io;
    }

    const io = req.app.io;

    if (!activeQuiz[quizId]) {
        activeQuiz[quizId] = {
            users: {},
            currentQues: 0,
            questions: quiz.questions,
        };
    }

    io.on("connection", (socket) => {
        console.log("User Connected:", socket.id);

        socket.on("joinQuiz", ({ userId, username }) => {
            socket.join(quizId);
            activeQuiz[quizId].users[userId] = {
                username,
                ques:[],
                totalScore: 0,
                totalSubmissionTime: 0, 
            };

            socket.emit("welcome", {
                message: `${username}, welcome to ${quiz.title}`,
                startTime: quiz.startTime,
            });
        });

        socket.on("startQuiz", ({ userId }) => {
            if (!activeQuiz[quizId]) return;

            socket.on("requestQuestion", () => {
                const quizData = activeQuiz[quizId];

                if (quizData.currentQues >= quizData.questions.length) {
                    io.to(quizId).emit("quizEnd", {
                        message:"Thank you for participating in the quiz",
                    });

                    saveLeaderboard(quizId);
                    return;
                }

                const ques = quizData.questions[quizData.currentQues];

                io.to(socket.id).emit("question", {
                    question: ques.question,
                    options: ques.options,
                    timer: ques.timer,
                    score: quizData.users[userId]?.totalScore || 0, 
                });
            });

            socket.on("submitAnswer", ({ answer, submitTime }) => {
                const quizData = activeQuiz[quizId];
                const user = quizData.users[userId];
                if (!user) return;

                let score = 0;
                const ques = quizData.questions[quizData.currentQues];

                if (answer === ques.answer) {
                    score += ques.score;
                }
                user.ques.push({score});
                user.totalScore += score;
                user.totalSubmissionTime += submitTime;

                quizData.currentQues++;

            });
        });

        socket.on("disconnect", () => {
            console.log("User Disconnected:", socket.id);
        });
    });

}