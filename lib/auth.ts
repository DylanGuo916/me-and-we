import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      console.log('Session callback:', { session, token });
      if (session.user && token.sub) {
        // 使用类型断言确保id属性可以被添加
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      console.log('JWT callback:', { token, user });
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      console.log('SignIn callback:', { user, account, profile });
      try {
        // 尝试检查是否有错误信息
        if (account && account.error) {
          console.error('SignIn error from provider:', account.error);
        }
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl });
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  events: {
    signIn: (message) => {
      console.log('SignIn event:', message);
    },
    signOut: (message) => {
      console.log('SignOut event:', message);
    },
    createUser: (message) => {
      console.log('CreateUser event:', message);
    },
    updateUser: (message) => {
      console.log('UpdateUser event:', message);
    },
    linkAccount: (message) => {
      console.log('LinkAccount event:', message);
    },
    session: (message) => {
      console.log('Session event:', message);
    },
  },
  debug: true,
  pages: {
    signIn: "/auth/signin",
  },
}
