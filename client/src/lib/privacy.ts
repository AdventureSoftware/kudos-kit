import 'server-only';

export interface PrivacyOperator {
  operator: string | null;
  contactEmail: string | null;
  hosting: string | null;
  authority: string | null;
}

const value = (name: string) => process.env[name]?.trim() || null;

export function getPrivacyOperator(): PrivacyOperator {
  return {
    operator: value('PRIVACY_OPERATOR'),
    contactEmail: value('PRIVACY_CONTACT_EMAIL'),
    hosting: value('PRIVACY_HOSTING'),
    authority: value('PRIVACY_AUTHORITY'),
  };
}
