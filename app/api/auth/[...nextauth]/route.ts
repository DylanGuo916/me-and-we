import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

console.log('Auth route initialized, GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
