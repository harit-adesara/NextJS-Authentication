import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbconfig.js";
import { verifyJWT } from "@/helper/verifyJWT.js";
import { Message } from "@/models/message.js";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const data = await verifyJWT(req);

    if (!data) {
      return NextResponse.json({ msg: "Login first" }, { status: 404 });
    }

    const { messageId } = await params;

    const msg = await Message.findOne({
      _id: messageId,
      isDeleted: false,
    }).sort({ createdAt: 1 });

    if (!msg) {
      throw new Error("Message not found");
    }

    if (msg.senderId.toString() !== data._id.toString()) {
      throw new Error("You have not send this message");
    }

    msg.isDeleted = true;
    await msg.save();

    return NextResponse.json(
      { msg: "Message deleted", message: msg },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { msg: "Error in deleting message", error: error.message },
      { status: 500 },
    );
  }
}
