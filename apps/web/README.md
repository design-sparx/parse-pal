# ParsePal Web

This workspace contains the hosted Next.js application for ParsePal.

## Local Development

Run from the repository root:

```bash
pnpm --filter @parse-pal/web dev
```

The app is available at `http://localhost:3000`.

For the hosted-style flow, set these variables in `apps/web/.env.local`:

```env
GROQ_API_KEY=
DATABASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CHROMA_API_KEY=
CHROMA_TENANT=
CHROMA_DATABASE=
```

If you are using local Chroma instead of Chroma Cloud, set:

```env
CHROMA_URL=http://localhost:8000
```

## Railway Deployment

ParsePal's hosted web app is intended to run on Railway, not Netlify. The repo includes:

- `apps/web/Dockerfile` for the production container image
- `railway.json` at the repository root to point Railway at that Dockerfile
- `apps/web/next.config.ts` with `output: "standalone"` for a smaller runtime image

### Required Railway Variables

```env
GROQ_API_KEY=
DATABASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CHROMA_API_KEY=
CHROMA_TENANT=
CHROMA_DATABASE=
```

Or, for a local/self-hosted Chroma deployment reachable from Railway:

```env
CHROMA_URL=
```

### Deploy Steps

1. Create a Railway project from this repository.
2. Let Railway use the committed `railway.json` and `apps/web/Dockerfile`.
3. Add the environment variables above.
4. Deploy the service.
5. Upload a PDF and verify the ingest job reaches `ready`.

## Notes

- The hosted app keeps local Hugging Face embeddings, so no embeddings API key is required.
- The ONNX-backed model downloads on first run.
- Cloudinary PDF delivery must be enabled or ingest will fail when the worker downloads the uploaded file.
