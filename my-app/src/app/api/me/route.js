import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbconfig.js";
import { verifyJWT } from "@/helper/verifyJWT.js";
import { ApiError } from "@/utils/apiError.js";

export async function GET(req) {
  try {
    await connectDB();

    const res = await verifyJWT(req);

    if (!res) {
      throw new ApiError(401, "Not authenticated user");
    }

    console.log(res.data);

    return NextResponse.json({ user: res }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: error.statusCode || 500,
      },
    );
  }
}
