import { NextResponse } from "next/server";
import { User } from "@/models/user.js";
import { connectDB } from "@/dbConfig/dbconfig.js";
import crypto from "crypto";
import { z } from "zod";

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be atleast 6 character"),
});

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { unHashedToken } = await params;

    if (!unHashedToken) {
      return NextResponse.json(
        { msg: "Error in token try again" },
        { status: 404 },
      );
    }

    const reqBody = await req.json();
    const res = passwordSchema.safeParse(reqBody);

    if (!res.success) {
      return NextResponse.json(
        { msg: "Give password in correct format" },
        { status: 404 },
      );
    }

    const { newPassword } = res.data;

    const hashedToken = crypto
      .createHash("sha256")
      .update(unHashedToken)
      .digest("hex");

    const update = await User.findOneAndUpdate(
      { hashedToken, forgetPasswordExpiry: { $gt: new Date() } },
      { password: newPassword },
      { new: true },
    );

    if (!update) {
      return NextResponse.json(
        { msg: "Time is expired try again" },
        { status: 404 },
      );
    }

    return NextResponse.json({ msg: "Password updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { msg: "Error while reset password try again" },
      { status: 404 },
    );
  }
}
