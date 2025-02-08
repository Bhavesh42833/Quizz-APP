import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: Date.now,
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
      validate: {
        validator: function (value) {
          return value.length >= 1 && value.length <= 50;
        },
        message: "A quiz must have between 1 and 50 questions.",
      },
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
        rank: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model("Quiz", QuizSchema);
