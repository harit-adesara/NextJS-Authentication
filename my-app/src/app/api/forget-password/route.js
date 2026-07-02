import { NextResponse } from "next/server";
import { User } from "@/models/user.js";
import { connectDB } from "@/dbConfig/dbconfig.js";
import { sendEmail, forgotPasswordMailgenContent } from "@/utils/email.js";
import { z } from "zod";

const emailSchema = z.string().email("Give correct email");

export async function POST(req) {
  try {
    await connectDB();

    const reqBody = await req.json();
    const res = emailSchema.safeParse(reqBody);

    if (!res.success) {
      return NextResponse.json({ msg: "Give correct email" }, { status: 404 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { msg: "User not found with this email" },
        { status: 404 },
      );
    }

    const { unHashedToken, hasedToken, tokenExpiry } =
      await user.generateTemporaryToken();

    user.forgetPasswordToken = hasedToken;
    user.forgetPasswordExpiry = tokenExpiry;

    await user.save();

    // send email
    await sendEmail({
      email: user.email,
      subject: "Password Change",
      mailgenContent: forgotPasswordMailgenContent(
        user.username,
        `http://localhost:3000/api/reset-password/${unHashedToken}`,
      ),
    });

    return NextResponse.json(
      { msg: "Password change email sent to your account" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { msg: "Error while sending email" },
      { status: 404 },
    );
  }
}
