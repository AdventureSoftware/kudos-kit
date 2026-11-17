# Security

## Reporting a vulnerability

Please **don't** open a public issue for security problems. Instead, report them privately
through GitHub: on this repository's **Security** tab, choose **Report a vulnerability**
(or go to <https://github.com/AdventureSoftware/kudos-kit/security/advisories/new>).

Helpful to include:

- what an attacker could do, and what they need first (an account? a project key?)
- steps or a small proof of concept
- the version or commit you tested

We'll confirm we received it within 5 working days, keep you updated while we fix it, and
credit you in the release notes if you'd like. Please give us a reasonable time to release a
fix before talking about it publicly.

## Supported versions

Security fixes go into the latest release. Self-hosters update with `./scripts/update.sh`
(see [DEPLOY.md](DEPLOY.md)).

## Good to know (by design, not vulnerabilities)

- **Anyone can send feedback to a project** if they know its key: the key is visible in the
  page's source. Spam protection comes from Cloudflare Turnstile, a honeypot field and rate
  limits, not from keeping the key secret. The feedback endpoint accepts requests from any
  origin for the same reason.
- **Console redaction is best-effort.** The widget hides values that look like passwords,
  tokens and keys, but it can't recognise every secret or piece of personal data.
- The feedback endpoint uses a database role that can only insert feedback and read projects.
