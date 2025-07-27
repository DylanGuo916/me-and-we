import "server-only";
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { prisma } from './prisma'

export const auth = betterAuth({
  plugins: [nextCookies()],
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  
  // MVP 阶段：启用邮箱密码登录（后续可以禁用）
  emailAndPassword: {
    enabled: true,
    disableSignUp: false, // 允许注册
  },
  
  // 会话配置
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  
  // 安全配置
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  
  // 信任的源（开发环境）
  trustedOrigins: process.env.NODE_ENV === "development" 
    ? ['http://localhost:3000', 'http://localhost:3001'] 
    : [],
  
  // socialProviders: {
    // google: {
    //   clientId: process.env.GOOGLE_CLIENT_ID as string,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    // },
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID as string,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    // },
  // },
  
  // 错误处理
  fetchOptions: {
    onError(e: any) {
      console.error('Better Auth error:', e);
    },
  },
})