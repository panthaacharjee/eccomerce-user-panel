// pages/api/auth/[...nextauth].js or app/api/auth/[...nextauth]/route.js

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
        try {
          console.log(credentials);

          if (credentials?.type === "Register") {
            try {
              const { data } = await Axios.post("/register/user", credentials);

              let user = data.user;
              user.sessionToken = data.user?.authentication.sessionToken;
              user.id = user._id || user.id;
              return user || null;
            } catch (error) {
              // Handle registration errors
              if (error.response) {
                const { status, data } = error.response;

                if (status === 409 || data.message?.includes("exist")) {
                  throw new Error("User already exists with this email");
                } else if (status === 400) {
                  throw new Error(data.message || "Invalid registration data");
                } else {
                  throw new Error(data.message || "Registration failed");
                }
              }
              throw new Error("Network error during registration");
            }
          } else {
            try {
              const { data } = await Axios.post("/login/user", credentials);
              console.log(data);

              // Check if login was successful
              if (!data.user) {
                throw new Error("Invalid email or password");
              }

              let user = data.user;
              user.sessionToken = data.user?.authentication.sessionToken;
              user.id = user._id || user.id;
              return user;
            } catch (error) {
              // Handle login errors
              if (error.response) {
                const { status, data } = error.response;

                if (status === 401) {
                  throw new Error("Invalid email or password");
                } else if (status === 404) {
                  throw new Error("User not found");
                } else {
                  throw new Error(data.message || "Login failed");
                }
              }
              throw new Error("Network error during login");
            }
          }
        } catch (error) {
          // Throw the error to be caught by NextAuth
          throw new Error(error.message);
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, profile, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      try {

        const { data } = Axios.post(`/login/auth`, {
          email: profile?.email || user.email,
          accountType: account.provider,
        });
        
        user.sessionToken = data.user?.authentication.sessionToken;
      } catch (err) {
        console.log(err);
      }


      if (user.sessionToken) {
        return user;
      } else {
        return false;
      }
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
    error: "/auth/error", // NextAuth will redirect here with error param
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
});

export { handler as GET, handler as POST };