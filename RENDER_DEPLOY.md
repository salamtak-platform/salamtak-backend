# Render Deployment

This branch is ready to deploy as a Render Web Service.

## Settings

- Runtime: Node
- Build command: `npm ci --include=dev && npm run build`
- Start command: `npm start`
- Health check path: `/api/v1/health`

Render provides `PORT` automatically, and the server already reads it from the environment.

## Required environment variables

Set these in Render before the first deploy:

```env
DB_URI=
HOST=
EMAIL_PORT=
EMAIL_SECURE=
EMAIL_FROM=
EMAIL_USER=
EMAIL_PASSWORD=
ACCESS_SIGNATURE=
REFRESH_SIGNATURE=
JWT_SECRET=
TWILIO_PHONE_NUMBER=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

These have safe defaults in `render.yaml`:

```env
NODE_ENV=production
DB_CONNECTION_TIMEOUT_MS=10000
BEARER=Bearer
```

Use a hosted MongoDB connection string for `DB_URI`, for example MongoDB Atlas. Do not use `localhost` on Render.

For Brevo SMTP, use:

```env
HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_brevo_smtp_login
EMAIL_PASSWORD=your_brevo_smtp_key
EMAIL_FROM=Salamtak App <verified_sender@example.com>
```

Use the SMTP login and SMTP key from Brevo. `EMAIL_FROM` must use a sender email verified in Brevo.
