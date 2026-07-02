import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbconfig.js";
import { verifyJWT } from "@/helper/verifyJWT.js";
import { Message } from "@/models/message.js";

export async function POST(req) {
  try {
    await connectDB();

    const data = await verifyJWT(req);

    if (!data) {
      return NextResponse.json({ msg: "Login first" }, { status: 404 });
    }

    const { chatId, msg } = await req.json();

    if (!chatId || !msg || msg.trim() === "") {
      throw new Error("Give proper data");
    }

    const send = await Message.create({
      chatId: chatId,
      senderId: data._id,
      content: msg,
    });

    return NextResponse.json(
      { msg: "Message sent", message: send },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { msg: "Error in message sent", error: error.message },
      { status: 500 },
    );
  }
}
