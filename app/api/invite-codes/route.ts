import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const inviteCodes = await prisma.inviteCode.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(inviteCodes)
  } catch (error) {
    console.error("获取邀请码列表错误:", error)
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, maxUses, isActive } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      )
    }

    if (maxUses < 1) {
      return NextResponse.json(
        { error: "Maximum uses must be greater than 0" },
        { status: 400 }
      )
    }

    // 检查邀请码是否已存在
    const existingCode = await prisma.inviteCode.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existingCode) {
      return NextResponse.json(
        { error: "Invite code already exists" },
        { status: 400 }
      )
    }

    // 创建新邀请码
    const newInviteCode = await prisma.inviteCode.create({
      data: {
        code: code.toUpperCase(),
        maxUses,
        isActive,
        usedCount: 0,
      }
    })

    return NextResponse.json(newInviteCode, { status: 201 })
  } catch (error) {
    console.error("Create invite code error:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
} 