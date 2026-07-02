import { NextResponse } from "next/server";
import { User } from "@/models/user.js";
import { connectDB } from "@/dbConfig/dbconfig.js";
import { signupSchema } from "@/schema/signup.js";
import { sendEmail, registerEmail } from "@/utils/email.js";

export async function POST(req) {
  try {
    await connectDB();
    const reqBody = await req.json();
    const res = signupSchema.safeParse(reqBody);

    if (!res.success) {
      return NextResponse.json(
        {
          msg: "Validation failed",
        },
        { status: 400 },
      );
    }

    const { username, email, password } = res.data;

    const user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (user) {
      return NextResponse.json(
        {
          success: false,
          msg: "User already exsits with this Username or Email",
        },
        {
          status: 404,
        },
      );
    }

    const newUser = await User.create({
      email,
      username,
      password,
    });

    if (!newUser) {
      return NextResponse.json(
        {
          msg: "Error while creating your account",
        },
        {
          status: 404,
        },
      );
    }

    const { unHashedToken, hasedToken, tokenExpiry } =
      await newUser.generateTemporaryToken();

    newUser.emailVerificationToken = hasedToken;
    newUser.emailVerificationExpiry = tokenExpiry;
    await newUser.save();

    // email sent add here

    await sendEmail({
      email: newUser.email,
      subject: "Verify your account",
      mailgenContent: registerEmail(
        newUser.username,
        `http://localhost:3000/api/verifyEmail/${unHashedToken}`,
      ),
    });

    return NextResponse.json(
      {
        msg: "Your account registered successfully and Email sent to you",
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
