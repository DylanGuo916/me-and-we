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

    // 使用事务来确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 查找邀请码
      const inviteCode = await tx.inviteCode.findUnique({
        where: { code: code.toUpperCase() }
      })

      if (!inviteCode) {
        throw new Error("Invite code not found")
      }

      if (!inviteCode.isActive) {
        throw new Error("Invite code is disabled")
      }

      if (inviteCode.expiresAt && inviteCode.expiresAt < new Date()) {
        throw new Error("Invite code has expired")
      }

      if (inviteCode.usedCount >= inviteCode.maxUses) {
        throw new Error("Invite code usage limit reached")
      }

      // 增加使用次数
      const updatedInviteCode = await tx.inviteCode.update({
        where: { id: inviteCode.id },
        data: { usedCount: inviteCode.usedCount + 1 }
      })

      return updatedInviteCode
    })

    return NextResponse.json({
      success: true,
      remainingUses: result.maxUses - result.usedCount
    })

  } catch (error: any) {
    console.error("Invite code usage error:", error)
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 400 }
    )
  }
} 