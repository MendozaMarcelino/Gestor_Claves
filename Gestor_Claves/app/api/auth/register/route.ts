import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const { username, password, hint } = await req.json()

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { username } })
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Usuario ya registrado" }, { status: 400 })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, hint },
    })

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username } })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: "Error al registrar usuario" }, { status: 500 })
  }
}