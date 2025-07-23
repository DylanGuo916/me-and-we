"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"

export default function UserMenu() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
  }

  if (!session) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/auth/signin">
          <Button variant="ghost">Login</Button>
        </Link>
        <Link href="/auth/signin">
          <Button className="bg-black text-white hover:bg-gray-800">Sign up</Button>
        </Link>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Image
            className="rounded-full"
            src={session.user?.image || "/placeholder.svg?height=32&width=32"}
            alt={session.user?.name || "User"}
            width={32}
            height={32}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {session.user?.name && <p className="font-medium">{session.user.name}</p>}
            {session.user?.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">My Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wallet">My Wallet</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault()
            signOut({ callbackUrl: "/" })
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
