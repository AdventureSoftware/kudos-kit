import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { APIError } from 'better-auth/api';
import { organization } from 'better-auth/plugins';
import type { AuthStore } from './auth-store';
import { canCreateAccount, shouldBecomeOwner } from './account-rules';

export interface AuthSettings {
  /** Signs session cookies and tokens. At least 32 characters. */
  secret: string;
  /** Public URL of the dashboard; /api/auth is reached through it. Used for links in emails and OAuth callbacks. */
  baseURL: string;
  /** Origins allowed to call /api/auth with cookies (the dashboard). */
  trustedOrigins: string[];
}

interface CreateAuthOptions {
  database: BetterAuthOptions['database'];
  store: AuthStore;
  settings: AuthSettings;
  /** Table/column name overrides. Not needed with Prisma (the models map them). */
  schema?: Pick<BetterAuthOptions, 'user' | 'session' | 'account' | 'verification'>;
  /** Same, for the organization plugin's tables. */
  organizationSchema?: Record<string, unknown>;
}

/**
 * Better Auth for Kudos Kit: email + password now, Google and GitHub in step 7,
 * and the organization plugin for the single team (roles owner / admin / member).
 */
export function createAuth({ database, store, settings, schema, organizationSchema }: CreateAuthOptions) {
  return betterAuth({
    appName: 'Kudos Kit',
    basePath: '/api/auth',
    baseURL: settings.baseURL,
    secret: settings.secret,
    trustedOrigins: settings.trustedOrigins,
    database,
    ...schema,

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
    },

    session: {
      ...schema?.session,
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24,     // refreshed at most once a day while in use
    },

    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
      customRules: {
        '/sign-in/email': { window: 15 * 60, max: 5 },
        '/sign-up/email': { window: 60 * 60, max: 5 },
      },
    },

    databaseHooks: {
      user: {
        create: {
          // Every way of creating an account (email, Google, GitHub) passes through here.
          before: async (user) => {
            if (!(await canCreateAccount(store, user.email))) {
              throw new APIError('FORBIDDEN', {
                message: 'Sign-up is invite-only. Ask an owner or admin of this Kudos Kit to invite you.',
              });
            }
            return { data: user };
          },
          // The first account on a fresh install becomes the team's owner. This runs once
          // sign-up has finished, so the store also attaches the team to the login that
          // sign-up just opened.
          after: async (user) => {
            if (await shouldBecomeOwner(store, user.id)) {
              await store.createTeamWithOwner(user.id);
            }
          },
        },
      },
      session: {
        create: {
          // Every login works inside the user's team, so role checks know which team to use.
          before: async (session) => ({
            data: { ...session, activeOrganizationId: await store.findOrganizationId(session.userId) },
          }),
        },
      },
    },

    plugins: [
      organization({
        allowUserToCreateOrganization: false, // exactly one team, created at setup
        ...(organizationSchema ? { schema: organizationSchema as never } : {}),
      }),
    ],

    // Lets NestJS classes hook into auth events if needed later.
    hooks: {},
  });
}

export type Auth = ReturnType<typeof createAuth>;
