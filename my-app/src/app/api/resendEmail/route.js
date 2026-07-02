import { NextResponse } from "next/server";
import { User } from "@/models/user.js";
import { connectDB } from "@/dbConfig/dbconfig";
import { sendEmail, registerEmail } from "@/utils/email.js";
import { z } from "zod";

const emailSchema = z.object({
  email: z.email({ message: "Give correct email" }),
});

export async function POST(req) {
  try {
    await connectDB();

    const reqBody = await req.json();
    const res = emailSchema.safeParse(reqBody);

    if (!res.success) {
      console.log(res.success);
      return NextResponse.json({ msg: "Give correct email" }, { status: 404 });
    }

    const { email } = reqBody;

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { msg: "User not found with this email" },
        { status: 404 },
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ msg: "Already verified" }, { status: 202 });
    }

    const { unHashedToken, hasedToken, tokenExpiry } =
      await user.generateTemporaryToken();

    user.emailVerificationToken = hasedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save();

    // send email
    await sendEmail({
      email: user.email,
      subject: "Verify your account",
      mailgenContent: registerEmail(
        user.name,
        `http://localhost:3000/api/verifyEmail/${unHashedToken}`,
      ),
    });

    return NextResponse.json(
      { msg: "Verification email sent to your account" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Error while sending email" },
      { status: 404 },
    );
  }
}
