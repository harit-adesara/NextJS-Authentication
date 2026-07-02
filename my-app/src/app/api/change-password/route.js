import { NextResponse } from "next/server";
import { User } from "@/models/user.js";
import { connectDB } from "@/dbConfig/dbconfig.js";
import { verifyJWT } from "@/helper/verifyJWT.js";
import { z } from "zod";

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be atleast 6 character"),
  oldPassword: z.string().min(6, "Password must be atleast 6 character"),
});

export async function POST(req) {
  try {
    await connectDB();

    const data = await verifyJWT(req);

    if (!data) {
      return NextResponse.json({ msg: "Login first" }, { status: 404 });
    }

    const id = data._id;

    const reqBody = await req.json();

    const res = passwordSchema.safeParse(reqBody);

    if (!res.success) {
      return NextResponse.json(
        { msg: "Give password in correct format" },
        { status: 404 },
      );
    }

    const { newPassword, oldPassword } = res.data;

    const user = await User.findById(id);

    const isCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isCorrect) {
      return NextResponse.json(
        { mdg: "Password is not correct" },
        { status: 404 },
      );
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json(
      { msg: "Password changed successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { msg: "Error while changing password" },
      { status: 404 },
    );
  }
}
