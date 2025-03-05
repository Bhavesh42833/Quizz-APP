import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    image: {
      public_id: String,
      url: String,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
    options: {
      type: [
        {
          _id: false,
          id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(),
          },
          text: {
            type: String,
            required: true,
          },
        },
      ],
      validate: {
        validator: function (value) {
          return value.length >= 2 && value.length <= 6;
        },
        message: "A question must have between 2 and 6 options.",
      },
    },
    answer: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return this.options.some((option) => option.text===(value));
        },
        message: "Answer must be one of the provided options.",
      },
    },
    timer: {
      type: Number,
      default: 30 * 1000, 
    },
    score:{
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model("Question", QuestionSchema);
