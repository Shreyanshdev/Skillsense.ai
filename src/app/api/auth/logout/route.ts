import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = new NextResponse(
      JSON.stringify({ message: "Logout successful" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

    // ✅ Proper cookie clearing
    response.cookies.set({
      name: "token",
      value: "",
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
