import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextApiRequest, NextApiResponse } from 'next'
import { getConnectionString, getCountryCode } from "../../../src/backend-utils";
import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient | undefined = undefined;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const countryCode = getCountryCode(req);
  const connectionString = getConnectionString(countryCode);


  if (prismaClient === undefined) {
    console.log("Prismaclient is undef, about to connect:")
    console.log({ connectionString });
  }
  const prisma = prismaClient ? prismaClient : new PrismaClient({
    log: ['info', 'warn', 'error'],
    datasources: {
      db: { url: connectionString }
    }
  })

  // Workaround for Error querying the database: db error: FATAL: too many connections for role ...
  // https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
  if (prismaClient === undefined) {
    prismaClient = prisma;
  }

  return NextAuth(req, res, {
    // Configure one or more authentication providers
    adapter: PrismaAdapter(prisma),
    pages: {
      signIn: '/',
      signOut: '/auth/signout',
      verifyRequest: '/auth/verify-request', // (used for check email message)
      error: '/auth/error'
    },
    providers: [
      EmailProvider({
        server: {
          host: process.env.EMAIL_SERVER_HOST,
          port: process.env.EMAIL_SERVER_PORT,
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD
          }
        },
        from: process.env.EMAIL_FROM
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    theme: {
      colorScheme: "light",
      logo: "/img/gatho-logo.svg"
    }
  })
}
