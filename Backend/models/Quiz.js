import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      default:"",
      type: String,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: Date.now + 30 * 60 * 1000,
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: "End time must be after start time.",
      },
    },
    questions: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
      ],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    leaderboard: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        score: {
          type: Number,
        },
        submissionTime: {
          type: Date,
        },
        question:[
          {
            score:{
              type: Number,
            }
          }
        ]
      },
    ],
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model("Quiz", QuizSchema);
