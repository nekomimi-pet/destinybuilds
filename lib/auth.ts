"use server";

import { redirect } from "next/navigation";
import { ClientResponseError } from "pocketbase";
import { cookies } from "next/headers";
import pb from "@/lib/pocketbase";

export type ActionResult =
  | { success: true; error?: never }
  | { success: false; error: string | null };

export async function login(formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);

    const { token, record: model } = authData;
    const cookie = JSON.stringify({ token, model });
    const cookieStore = await cookies();
    
    cookieStore.set("pb_auth", cookie, {
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof ClientResponseError) {
      if (error.status === 400) {
        return {
          success: false,
          error: "Invalid email or password",
        };
      }

      if (error.status === 0) {
        return {
          success: false,
          error:
            "Unable to connect to PocketBase. Please ensure the server is running.",
        };
      }

      return {
        success: false,
        error: `Login failed: ${error.message}`,
      };
    }

    return {
      success: false,
      error: "Something went wrong. Please try again later.",
    };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("pb_auth");
  redirect("/");
}

export async function getAuthCookie() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("pb_auth");
  
  if (!authCookie) {
    return null;
  }
  
  try {
    return JSON.parse(authCookie.value);
  } catch {
    return null;
  }
}

export async function isAuthenticated() {
  const auth = await getAuthCookie();
  return !!auth?.token;
} 