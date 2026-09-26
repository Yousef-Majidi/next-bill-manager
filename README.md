# Next Bill Manager

> **Archived.** This project is no longer maintained. It has been replaced by
> [Sharehold](https://sharehold.app), a rewrite that does the same
> job without needing access to your whole inbox. All the bill and payment
> history kept here was moved into Sharehold before the archive.

Next Bill Manager was a small app I built to split household utility bills
between the people renting rooms in my house. Each month it found the bills in
my Gmail, worked out what each tenant owed, emailed them a summary, and then
watched for their Interac e-Transfers to mark the bills paid.

## How it worked

You signed in with Google and granted read and send access to Gmail. From
there:

1. **Providers.** You listed your utility companies (water, gas, electricity
   and so on). A provider's name doubled as its Gmail search term.
2. **Tenants.** Each tenant had an email address and a percentage share of
   each provider's bills. A tenant could also have a secondary name, for
   e-Transfers sent by someone else on their behalf.
3. **Bills.** For a chosen month, the app searched Gmail for
   `<provider name> after:<month start> before:<next month>`, kept the emails
   whose subject had both the provider's name and the word "bill", and pulled
   the amount out of the email preview with a regular expression. The amounts
   were combined into one consolidated bill, split by each tenant's shares.
4. **Sending.** The consolidated bill was emailed to the tenant from your own
   Gmail account.
5. **Payments.** The app searched Gmail for mail from the tenant's name
   (`from:<name>`), starting at the send date of their oldest unpaid bill,
   read the amount out of the e-Transfer notice, and marked their bills paid.
   An overpayment became a credit and a shortfall stayed on their balance.

There was also a demo sign-in that skipped Google and used pre-filled data.

The approach worked for one landlord with one bank, and that was its limit.
Matching bills by provider name and subject line was fragile, the amount regex
took any number that looked like money, and the payment parser only knew one
bank's e-Transfer layout. Those are the problems Sharehold was built to fix.

## Stack

- Next.js 15 (App Router) and React 19, TypeScript
- Tailwind CSS 4, shadcn/ui on Radix, Jotai
- NextAuth.js with Google OAuth (Gmail `readonly` and `send` scopes)
- MongoDB
- Gmail API through `googleapis`
- Vitest, ESLint, Prettier, Husky
- Release Please for versioning, Vercel for hosting

The last release is [0.5.3](CHANGELOG.md).

## Running it locally

It should still run, but nothing here is being updated, including
dependencies with known vulnerabilities. Treat it as a reference.

You need Node.js 20, pnpm 10, a MongoDB database, and a Google Cloud OAuth
client with the Gmail API enabled.

```bash
pnpm install
pnpm dev
```

Create `.env.local` with:

```env
MONGODB_URI=
MONGODB_DATABASE_NAME=
MONGODB_UTILITY_PROVIDERS=utility_providers
MONGODB_TENANTS=tenants
MONGODB_CONSOLIDATED_BILLS=consolidated_bills

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Optional demo account
DEMO_USER_ID=
DEMO_USER_EMAIL=
DEMO_USER_NAME=
NEXT_PUBLIC_DEMO_USER_EMAIL=
```

`pnpm db:demo:setup` fills the demo account with sample data. The other `db:*`
scripts (`migrate`, `backup`, `restore`, `diagnose`) were one-off maintenance
tools for the MongoDB collections.

The files under [docs/](docs/) describe the code as it stood at the time and
were not kept in sync with every change.

## License

[GPL-3.0](LICENSE)
