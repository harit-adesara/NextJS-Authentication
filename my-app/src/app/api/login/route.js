import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbconfig.js";
import { User } from "@/models/user";
import { loginSchema } from "@/schema/login.js";

export async function POST(req) {
  try {
    await connectDB();
    const reqBody = await req.json();
    const res = loginSchema.safeParse(reqBody);

    if (!res.success) {
      return NextResponse.json({ msg: "Give valide data" }, { status: 404 });
    }

    const { email, password } = res.data;

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ msg: "User not exists" }, { status: 404 });
    }

    const isCorrect = await user.isPasswordCorrect(password);

    if (!isCorrect) {
      return NextResponse.json(
        { msg: "Password is incorrect" },
        { status: 404 },
      );
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    const response = NextResponse.json(
      { msg: "Login successfully", success: true },
      { status: 200 },
    );

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 3 * 24 * 60 * 60,
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 15 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    //console.log(error);

    return NextResponse.json({ msg: "Error while login" }, { status: 404 });
  }
}
