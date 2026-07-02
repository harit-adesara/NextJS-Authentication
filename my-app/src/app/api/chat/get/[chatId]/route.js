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

    const { chatId } = await params;

    const msg = await Message.find({
      chatId: chatId,
      isDeleted: false,
    }).sort({ createdAt: 1 });

    return NextResponse.json(
      { msg: "Message fetched", message: msg },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { msg: "Error in getting message", error: error.message },
      { status: 500 },
    );
  }
}
