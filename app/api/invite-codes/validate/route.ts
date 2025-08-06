import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      )
    }

    // 查找邀请码
    const inviteCode = await prisma.inviteCode.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invite code not found" },
        { status: 404 }
      )
    }

    if (!inviteCode.isActive) {
      return NextResponse.json(
        { error: "Invite code is disabled" },
        { status: 400 }
      )
    }

    if (inviteCode.expiresAt && inviteCode.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invite code has expired" },
        { status: 400 }
      )
    }

    if (inviteCode.usedCount >= inviteCode.maxUses) {
      return NextResponse.json(
        { error: "Invite code usage limit reached" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      remainingUses: inviteCode.maxUses - inviteCode.usedCount
    })

  } catch (error) {
    console.error("Invite code validation error:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
} 