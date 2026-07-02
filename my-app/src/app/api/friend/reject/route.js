import mongoose from "mongoose";
import { Friend } from "@/models/friend.js";
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbconfig.js";
import { verifyJWT } from "@/helper/verifyJWT.js";
import { Notification } from "@/models/notification.js";

export async function POST(req) {
  const session = await mongoose.startSession();

  try {
    await connectDB();

    const data = await verifyJWT(req);

    if (!data) {
      return NextResponse.json({ msg: "Login first" }, { status: 404 });
    }

    const { notificationId } = await req.json();

    session.startTransaction();

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

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      { msg: "Friend request rejected" },
      { status: 200 },
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return NextResponse.json(
      { msg: "Error in reject", error: error.message },
      { status: 500 },
    );
  }
}
