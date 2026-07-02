import { Friend } from "@/models/friend.js";
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbconfig.js";
import { verifyJWT } from "@/helper/verifyJWT.js";

export async function POST(req) {
  try {
    await connectDB();

    const data = await verifyJWT(req);

    if (!data) {
      return NextResponse.json({ msg: "Login first" }, { status: 404 });
    }

    const { friendId } = await req.json();

    const frnd = await Friend.findById(friendId);

    if (!frnd) {
      return NextResponse.json({ msg: "You are not friend" }, { status: 404 });
    }

    frnd.status = "REJECTED";
    await frnd.save();

    return NextResponse.json(
      { msg: "You are not friend now" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { msg: "Error in delete", error: error.message },
      { status: 500 },
    );
  }
}
