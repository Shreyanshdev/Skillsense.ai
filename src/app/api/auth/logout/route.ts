import { NextResponse , NextRequest } from "next/server";
import { connectDB } from "@/lib/dbconnect";

connectDB();

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ message: "Logout successful" }, 
                                        { status: 200 });
    response.cookies.set("token", "", {httpOnly:true , expires: new Date(0), path: "/"});
    
    return response;
  }
  
  catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}