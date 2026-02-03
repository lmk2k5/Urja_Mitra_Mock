import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const TB_URL = process.env.THINGSBOARD_URL;

function getBaseUrl(): string {
  if (!TB_URL) {
    throw new Error("THINGSBOARD_URL is not configured");
  }
  return TB_URL.replace(/\/$/, "");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };

    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${getBaseUrl()}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: body.username,
        password: body.password,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "Login failed" },
        { status: 401 }
      );
    }

    const json = (await res.json()) as { token?: string };
    if (!json.token) {
      return NextResponse.json(
        { error: "Login failed: no token returned" },
        { status: 500 }
      );
    }

    // Store JWT in an HttpOnly cookie so the browser can't read it,
    // but the backend can use it for control actions.
    const response = NextResponse.json({ ok: true });
    response.cookies.set("tb_jwt", json.token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("[api/login]", error);
    return NextResponse.json(
      { error: "Unexpected error during login" },
      { status: 500 }
    );
  }
}

