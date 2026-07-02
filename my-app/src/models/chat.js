import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    usersId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    lastMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
