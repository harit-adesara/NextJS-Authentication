import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbconfig.js";
import { verifyJWT } from "@/helper/verifyJWT.js";
import { Notification } from "@/models/notification.js";
import { Friend } from "@/models/friend.js";

export async function POST(req) {
  try {
    await connectDB();
    const data = await verifyJWT(req);

    if (!data) {
      return NextResponse.json({ msg: "Login first" }, { status: 404 });
    }

    const id = data._id;
    const reqBody = await req.json();
    const { userId } = reqBody;

    if (!userId) {
      return NextResponse.json({ msg: "Select proper user" }, { status: 404 });
    }

    if (data._id.toString() === userId.toString()) {
      throw new Error("You can not send to yourself");
    }

    const notification = await Notification.create({
      receiverId: userId,
      senderId: id,
    });

    if (!notification) {
      return NextResponse.json({ msg: "Error while sending notification" });
    }

    return NextResponse.json({ msg: "Notification sent" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ msg: "Error in notification" }, { status: 404 });
  }
}
