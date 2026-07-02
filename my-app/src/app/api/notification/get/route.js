import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbconfig.js";
import { verifyJWT } from "@/helper/verifyJWT.js";
import { Notification } from "@/models/notification.js";

export async function GET(req) {
  try {
    await connectDB();
    const data = await verifyJWT(req);

    if (!data) {
      return NextResponse.json({ msg: "Login first" }, { status: 404 });
    }

    const id = data._id;

    const notification = await Notification.find({
      receiverId: id,
    })
      .populate("senderId", "username")
      .sort({ createdAt: -1 });

    if (!notification) {
      return NextResponse.json({ msg: "Error while sending notification" });
    }

    return NextResponse.json(
      { msg: "Notification fetched", notification: notification },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Error in getting notification" },
      { status: 404 },
    );
  }
}
