import mongoose from "mongoose";
import { Friend } from "@/models/friend.js";
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbconfig.js";
import { verifyJWT } from "@/helper/verifyJWT.js";

export async function GET(req) {
  try {
    await connectDB();

    const data = await verifyJWT(req);

    if (!data) {
      return NextResponse.json({ msg: "Login first" }, { status: 404 });
    }

    const id = data._id;

    const frnds = await Friend.find({
      $and: [
        { $or: [{ recipientId: id }, { requesterId: id }] },
        { status: "ACCEPTED" },
      ],
    })
      .populate("recipientId", "username")
      .populate("requesterId", "username");

    return NextResponse.json(
      { msg: "Friends fetched", friends: frnds },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { msg: "Error in fetching friends", error: error.message },
      { status: 500 },
    );
  }
}
