import { NextResponse } from "next/server";
import { User } from "@/models/user.js";
import { verifyJWT } from "@/helper/verifyJWT.js";
import { connectDB } from "@/dbConfig/dbconfig.js";

export async function POST(req) {
  try {
    await connectDB();
    const reqBody = await req.json();

    const { username } = reqBody;

    const user = await User.find({
      username: {
        $regex: username,
        $options: "i",
      },
    });

    return NextResponse.json(
      {
        msg: "User fetched",
        user,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Error while register" },
      {
        status: 404,
      },
    );
  }
}
