import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    isEdited: {
      type: Boolean,
      default: false,
    },

    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

messageSchema.index({ chatId: 1, createdAt: -1 });
export const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
