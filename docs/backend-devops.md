# Backend DevOps Notes

## Docker Usage

Build the backend image:

```bash
docker build -t salamtak-backend .
```

Run the backend container:

```bash
docker run --env-file .env -p 3000:3000 salamtak-backend
```

Run the full local stack:

```bash
docker compose up --build
```

The Dockerfile uses a multi-stage build. The build stage runs `npm ci` and compiles TypeScript. The runtime stage installs production dependencies only, copies `dist`, exposes port `3000`, keeps the `/api/v1/health` healthcheck, and runs as the non-root `node` user.

## GitLab CI Pipeline

The project uses `.gitlab-ci.yml` instead of GitHub Actions.

Pipeline stages:

- `build`: installs dependencies with `npm ci` and runs `npm run build`.
- `test`: installs dependencies with `npm ci` and runs `npm test`.
- `security`: installs dependencies with `npm ci` and runs `npm audit --audit-level=high`.
- `docker`: validates the Docker image with `docker build -t salamtak-backend .`.

The Docker stage uses Docker-in-Docker for build validation only. It does not publish an image to a registry.

## Required Env Variables

- `NODE_ENV`
- `PORT`
- `DB_URI`
- `DB_CONNECTION_TIMEOUT_MS`
- `HOST`
- `EMAIL_PORT`
- `USER`
- `PASSWORD`
- `ACCESS_SIGNATURE`
- `REFRESH_SIGNATURE`
- `BEARER`
- `JWT_SECRET`
- `TWILIO_PHONE_NUMBER`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`

See `.env.example` for example values.

## Build Process

```bash
npm ci
npm run build
```

The TypeScript compiler writes production JavaScript output to `dist`.

## Test Process

```bash
npm ci
npm test
```

The current test suite builds the project first and then runs Node's built-in test runner against `test/*.test.cjs`.

## Local Verification

```bash
npm ci
npm run build
npm test
npm run audit
```

For local development with auto-reload:

```bash
npm run dev
```

Healthcheck endpoint:

```bash
curl http://localhost:3000/api/v1/health
```

## Known Limitations

- No deployment workflow is configured yet.
- No container registry publishing is configured yet.
- GitLab CI validates Docker build only; it does not push Docker images.
- CI does not publish test coverage.
- Security checks are currently limited to `npm audit --audit-level=high`.
- Docker healthcheck validates the HTTP health endpoint only; it does not validate MongoDB readiness from inside the app.
- Runtime environment variables are not centrally validated at application startup.
- No graceful shutdown handling is implemented yet.
- Upload security hardening is still limited.
- Production monitoring and structured logging are not configured yet.
