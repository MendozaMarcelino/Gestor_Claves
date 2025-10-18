import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 400 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ success: false, error: "Contraseña incorrecta" }, { status: 401 })
    }

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username } })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: "Error en login" }, { status: 500 })
  }
}