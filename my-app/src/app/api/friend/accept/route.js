import mongoose from "mongoose";
import { Friend } from "@/models/friend.js";
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbconfig.js";
import { verifyJWT } from "@/helper/verifyJWT.js";
import { Notification } from "@/models/notification.js";
import { Chat } from "@/models/chat.js";

export async function POST(req) {
  let session;
  try {
    await connectDB();
    session = await mongoose.startSession();

    const data = await verifyJWT(req);

    if (!data) {
      return NextResponse.json({ msg: "Login first" }, { status: 404 });
    }

    const { notificationId } = await req.json();

    session.startTransaction();

    let sent;

    const notification =
      await Notification.findById(notificationId).session(session);

    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.isProcessed === true) {
      throw new Error("Notification already processed");
    }

    notification.isProcessed = true;
    await notification.save({ session });

    const friend = await Friend.findOne({
      requesterId: notification.senderId,
      recipientId: notification.receiverId,
    }).session(session);

    if (friend) {
      if (friend.status === "REJECTED") {
        sent = friend;
        friend.status = "ACCEPTED";
        await friend.save({ session });
      }
    } else {
      const chat = await Chat.create(
        [
          {
            usersId: [notification.senderId, notification.receiverId],
          },
        ],
        { session },
      );

      [sent] = await Friend.create(
        [
          {
            requesterId: notification.senderId,
            recipientId: notification.receiverId,
            chatId: chat[0]._id,
            status: "ACCEPTED",
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      { msg: "You are friend", friend: sent },
      { status: 200 },
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return NextResponse.json(
      { msg: "Error in notification", error: error.message },
      { status: 500 },
    );
  }
}
