// app/api/auth/[...nextauth]/route.js
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
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
        type: { label: "Type", type: "text" },
      },
      async authorize(credentials) {
        try {
          console.log("Authorize called with:", {
            email: credentials?.email,
            type: credentials?.type
          });

          if (credentials?.type === "Register") {
            const { data } = await Axios.post("/register/user", credentials);

            if (!data || !data.user) {
              throw new Error("Registration failed");
            }

            let user = data.user;
            user.sessionToken = data.user?.authentication?.sessionToken;
            user.id = user._id || user.id;

            return user || null;
          } else {
            // Login flow
            const { data } = await Axios.post("/login/user", {
              email: credentials.email,
              password: credentials.password
            });

            console.log("Login response:", data);

            if (!data || !data.user) {
              throw new Error("Invalid email or password");
            }

            let user = data.user;
            user.sessionToken = data.user?.authentication?.sessionToken;
            user.id = user._id || user.id;

            return user;
          }
        } catch (error) {
          console.error("Authorization error:", error);

          if (error.response) {
            if (error.response.status === 401) {
              throw new Error("Invalid email or password");
            }
            throw new Error(error.response.data?.message || "Authentication failed");
          }

          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (user && user.email) {
        return true;
      }

      return false;
    },

    async jwt({ token, user, account }) {
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
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/",
    error: "/auth/error",
  },

  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  useSecureCookies: process.env.NODE_ENV === "production",
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };