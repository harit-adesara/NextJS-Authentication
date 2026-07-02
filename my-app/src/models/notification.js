import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["FRIEND_REQUEST", "SYSTEM"],
      default: "FRIEND_REQUEST",
    },

    isProcessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
