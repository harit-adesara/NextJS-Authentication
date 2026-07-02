import { NextResponse } from "next/server";
import { User } from "@/models/user.js";
import jwt from "jsonwebtoken";
import { connectDB } from "@/dbConfig/dbconfig.js";

export async function POST(req) {
  try {
    await connectDB();

    const token =
      req.cookies.get("refreshToken")?.value ||
      req.header.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ msg: "Login again" }, { status: 404 });
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    if (!decodedToken) {
      return NextResponse.json({ msg: "Login again" }, { status: 402 });
    }

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      return NextResponse.json({ msg: "Invalid user" }, { status: 402 });
    }

    if (token !== user?.refreshToken) {
      return NextResponse.json({ msg: "Invalid token" }, { status: 404 });
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    const response = NextResponse.json(
      { msg: "Token update successfully" },
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
    return NextResponse.json(
      { msg: "Error while update token" },
      { status: 404 },
    );
  }
}
