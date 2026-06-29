"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const CORRECT_PASSWORD = "landrover"
const AUTH_COOKIE_NAME = "fahrdienst_auth"

export async function login(password: string) {
  if (password === CORRECT_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set(AUTH_COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    redirect("/")
  }

  throw new Error("Falsches Passwort")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
  redirect("/login")
}

export async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_COOKIE_NAME)?.value === "authenticated"
}
