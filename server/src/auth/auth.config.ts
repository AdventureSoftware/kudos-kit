import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { APIError } from 'better-auth/api';
import { organization } from 'better-auth/plugins';
import type { AuthStore } from './auth-store';
import { canCreateAccount, shouldBecomeOwner } from './account-rules';
import type { Mailer } from '../mail/mail.service';
import { APPLE_ORIGIN, enabledProviders, socialProviders, type SocialSettings } from './social';


export const INVITATION_DAYS = 7;
export const RESET_LINK_MINUTES = 60;

export interface AuthSettings {
  secret: string;
  baseURL: string;
  trustedOrigins: string[];
  social?: SocialSettings;
}

interface CreateAuthOptions {
  database: BetterAuthOptions['database'];
  store: AuthStore;
  mailer: Mailer;
  settings: AuthSettings;
  schema?: Pick<BetterAuthOptions, 'user' | 'session' | 'account' | 'verification'>;
  organizationSchema?: Record<string, unknown>;
}

export const INVITE_ONLY = 'INVITE_ONLY';


export function createAuth({ database, store, mailer, settings, schema, organizationSchema }: CreateAuthOptions) {
  return betterAuth({
    appName: 'Kudos Kit',
    basePath: '/api/auth',
    baseURL: settings.baseURL,
    secret: settings.secret,
    trustedOrigins: enabledProviders(settings.social).includes('apple')
      ? [...settings.trustedOrigins, APPLE_ORIGIN]
      : settings.trustedOrigins,
    database,
    ...schema,

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: RESET_LINK_MINUTES * 60,
      revokeSessionsOnPasswordReset: true,
      onPasswordReset: async ({ user }) => {
        await store.markEmailVerified(user.id);
      },
      sendResetPassword: async ({ user, token }) => {
        void mailer.sendPasswordReset(user.email, {
          name: user.name,
          link: `${settings.baseURL}/reset-password?token=${encodeURIComponent(token)}`,
          expiresInMinutes: RESET_LINK_MINUTES,
        });
      },
    },

    socialProviders: socialProviders(settings.social),

    account: {
      ...schema?.account,
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'apple'],
        // "Connect Apple" on the Account page must work with Apple's "Hide My Email" addresses.
        allowDifferentEmails: true,
      },
    },

    session: {
      ...schema?.session,
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },

    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
      customRules: {
        '/sign-in/email': { window: 15 * 60, max: 5 },
        '/sign-up/email': { window: 60 * 60, max: 5 },
        '/request-password-reset': { window: 60 * 60, max: 5 },
        '/reset-password': { window: 15 * 60, max: 10 },
        '/change-password': { window: 15 * 60, max: 5 },
        '/sign-in/social': { window: 60, max: 10 },
        '/link-social': { window: 60, max: 10 },
      },
    },

    // Rate limits and the login list are per visitor IP. It comes from X-Forwarded-For, which
    // must hold exactly one address: nginx sets it to $remote_addr, Caddy replaces it, and the
    // dashboard passes it on for its server-side calls (client/src/lib/auth.ts). A header with
    // several addresses is ignored (it could be faked), so never let the proxy append to it.
    advanced: {
      ipAddress: {
        ipAddressHeaders: ['x-forwarded-for'],
      },
    },

    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!(await canCreateAccount(store, user.email))) {
              throw new APIError('FORBIDDEN', {
                code: INVITE_ONLY,
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

          before: async (session) => ({
            data: { ...session, activeOrganizationId: await store.findOrganizationId(session.userId) },
          }),
        },
      },
    },

    plugins: [
      organization({
        allowUserToCreateOrganization: false,
        invitationExpiresIn: INVITATION_DAYS * 24 * 60 * 60,
        cancelPendingInvitationsOnReInvite: true,
        sendInvitationEmail: async ({ id, email, role, inviter, invitation }) => {
          await mailer.sendInvitation(email, {
            inviterName: inviter.user.name,
            inviterEmail: inviter.user.email,
            role,
            link: `${settings.baseURL}/invite/${id}`,
            expiresAt: new Date(invitation.expiresAt),
          });
        },
        ...(organizationSchema ? { schema: organizationSchema as never } : {}),
      }),
    ],


    hooks: {},
  });
}

export type Auth = ReturnType<typeof createAuth>;
