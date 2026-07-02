import { User } from "@/models/user.js";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const verifyJWT = async (req) => {
  try {
    const token =
      req.cookies.get("accessToken")?.value ||
      req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return null;
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      return null;
    }

    const user = await User.findById(decodedToken._id).select(
      "-refreshToken -emailVerificationToken -emailVerificationExpiry -password -forgetPasswordToken -forgetPasswordExpiry",
    );

    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
};
