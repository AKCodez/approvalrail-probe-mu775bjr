
## Deploy your own

- Vercel: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAKCodez%2Fapprovalrail-probe-mu775bjr&env=DATABASE_URL,DIRECT_URL,BETTER_AUTH_SECRET,AI_GATEWAY_API_KEY
- Replit: https://replit.com/new/github/AKCodez/approvalrail-probe-mu775bjr
- Bolt: https://bolt.new/~/github.com/AKCodez/approvalrail-probe-mu775bjr
- StackBlitz: https://stackblitz.com/github/AKCodez/approvalrail-probe-mu775bjr

Vercel asks for DATABASE_URL, DIRECT_URL, BETTER_AUTH_SECRET, AI_GATEWAY_API_KEY on import. A Neon database gives you the first two, `openssl rand -base64 32` the third, and the fourth is your AI Gateway key.
