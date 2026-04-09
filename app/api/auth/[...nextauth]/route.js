import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import Axios from "../../../../components/Axios";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
      httpOptions: {
        timeout: 10000,
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      httpOptions: {
        timeout: 10000,
      },
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        firstName: { label: "firstName", type: "text" },
        lastName: { label: "lastName", type: "text" },
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
        type: { label: "Type", type: "text" },
      },
      async authorize(credentials) {
        console.log(credentials);
        if (credentials?.type === "Register") {
          const { data } = await Axios.post("/register/user", credentials);

          let user = data.user;
          user.sessionToken = data.user?.authentication.sessionToken;
          user.id = user._id || user.id;
          return user || null;
        } else {
          const { data } = await Axios.post("/login/user", credentials);
          console.log(data);
          let user = data.user;
          user.sessionToken = data.user?.authentication.sessionToken;
          // ✅ Add id to user object
          user.id = user._id || user.id;
          return user || null;
        }
      },
    }),
  ],
  
  callbacks: {
    async signIn({ user, profile, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (user.sessionToken) {
        return user;
      } else {
        return false;
      }
    },

    async jwt({ token, user, account }) {
      // ✅ Add user id to token
      if (user) {
        token.id = user.id;
        token.sessionToken = user.sessionToken;
        token.email = user.email;
        token.name = user.name;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      // ✅ Add user id to session
      if (session.user) {
        session.user.id = token.sessionToken; 
        session.user.email = token.email;
        session.user.name = token.name;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  jwt: {
    secret: process.env.AUTH_SECRET,
    maxAge: 60 * 60,
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax", // Changed from "None" for better compatibility
        path: "/",
        secure: process.env.NODE_ENV === "production", // Only secure in production
      },
    },
  }, 
  // Important for Vercel
  useSecureCookies: process.env.NODE_ENV === "production",
});

export { handler as GET, handler as POST };