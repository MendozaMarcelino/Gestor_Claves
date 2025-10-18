import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = Number(searchParams.get("userId"))

  if (!userId) {
    return NextResponse.json({ success: false, error: "Falta userId" }, { status: 400 })
  }

  const passwords = await prisma.password.findMany({ where: { userId } })
  return NextResponse.json({ success: true, passwords })
}

export async function POST(req: Request) {
  try {
    const { userId, site, username, password, category } = await req.json()

    const newPassword = await prisma.password.create({
      data: { site, username, password, category, userId: Number(userId) },
    })

    return NextResponse.json({ success: true, password: newPassword })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: "Error al guardar contraseña" }, { status: 500 })
  }
}