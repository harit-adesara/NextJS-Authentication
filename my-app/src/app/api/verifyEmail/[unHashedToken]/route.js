import { NextResponse } from "next/server";
import { User } from "@/models/user.js";
import crypto from "crypto";
import { connectDB } from "@/dbConfig/dbconfig.js";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { unHashedToken } = await params;

    if (!unHashedToken) {
      return NextResponse.json(
        { msg: "Token is not present try again" },
        { status: 404 },
      );
    }

    const emailVerificationToken = crypto
      .createHash("sha256")
      .update(unHashedToken)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { msg: "Email is expired try again" },
        { status: 404 },
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationExpiry = undefined;
    user.emailVerificationToken = undefined;
    await user.save();

    return NextResponse.json({ msg: "Email verified" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { msg: "Error in Email verification" },
      { status: 404 },
    );
  }
}
