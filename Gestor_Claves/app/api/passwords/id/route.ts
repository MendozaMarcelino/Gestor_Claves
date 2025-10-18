import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Params = {
  params: { id: string }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const id = Number(params.id)

    await prisma.password.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: "Error al eliminar contraseña" }, { status: 500 })
  }
}