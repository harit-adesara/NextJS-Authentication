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

    const { messageId, msg } = await req.json();

    if (!messageId || !msg || msg.trim() === "") {
      throw new Error("Give proper data");
    }

    const update = await Message.findOne({
      _id: messageId,
      isDeleted: false,
    });

    if (update.createdAt.getTime() + 60 * 60 * 1000 < new Date()) {
      throw new Error("Can not modify now");
    }

    update.content = msg;
    update.isEdited = true;
    await update.save();

    return NextResponse.json(
      { msg: "Message updated", message: update },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { msg: "Error in updating message", error: error.message },
      { status: 500 },
    );
  }
}
