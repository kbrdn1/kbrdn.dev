# GitHub Secrets Configuration

Quick reference for configuring GitHub repository secrets required for CI/CD deployment.

## Required Secrets

Navigate to **Repository Settings → Secrets and variables → Actions** to configure:

| Secret | Purpose | Required For | Example Format |
|--------|---------|--------------|----------------|
| `DOKPLOY_WEBHOOK_URL` | Triggers Dokploy deployment | deploy.yml, studio-sync.yml | `https://dokploy.example.com/api/deploy/webhook/xxx` |
| `GH_TOKEN` | GitHub API access (contributions chart) | Build process | `ghp_xxxxxxxxxxxxxxxxxxxx` |
| `RESEND_API_KEY` | Contact form email sending | Build process | `re_xxxxxxxxxxxxxxxxxxxx` |

## Nuxt Studio Integration (Self-Hosted)

Nuxt Studio is now a **free, open-source, self-hosted** module. The hosted platform (nuxt.studio) is being sunset.

### Required Secrets for Studio

| Secret | Purpose | Required For | Example Format |
|--------|---------|--------------|----------------|
| `STUDIO_GITHUB_CLIENT_ID` | GitHub OAuth App ID | Studio authentication | `Iv1.xxxxxxxxxx` |
| `STUDIO_GITHUB_CLIENT_SECRET` | GitHub OAuth App Secret | Studio authentication | `xxxxxxxxxxxxxxxxxxxxxxx` |

### GitHub OAuth App Setup

1. Go to GitHub **Settings → Developer settings → OAuth Apps**
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: `kbrdn.dev Studio`
   - **Homepage URL**: `https://kbrdn.dev`
   - **Authorization callback URL**: `https://kbrdn.dev/_studio/auth/callback`
4. Copy the Client ID and generate a Client Secret
5. Add both to your deployment environment variables

### How It Works

1. The `nuxt-studio` module is configured in `nuxt.config.ts`:
   ```ts
   // Required: Preview API enables #content/preview alias
   content: {
     preview: {
       api: "https://api.nuxt.studio",
     },
   },

   // Self-hosted configuration
   studio: {
     repository: {
       provider: "github",
       owner: "kbrdn1",
       repo: "kbrdn.dev",
       branch: "master",
     },
   }
   ```

2. Access the Studio at `https://kbrdn.dev/_studio`
3. Authenticate via GitHub OAuth
4. Edit content visually in the self-hosted interface
5. Changes are committed directly to your repository

### Features

- Visual Markdown/MDX editing
- Form-based YAML/JSON editing
- Real-time preview
- Git-based publishing
- Fully self-hosted (no external dependencies)

## How to Obtain Each Secret

### DOKPLOY_WEBHOOK_URL

1. Access Dokploy dashboard at `https://dokploy.kbrdn.dev`
2. Navigate to your application settings
3. Go to **Deployments → Webhooks**
4. Copy the generated webhook URL

### GH_TOKEN

1. Go to GitHub **Settings → Developer settings → Personal access tokens**
2. Generate a new token (classic) with `read:user` and `repo` scopes
3. Copy the token (starts with `ghp_`)

### RESEND_API_KEY

1. Sign up/login at [resend.com](https://resend.com)
2. Go to **API Keys** section
3. Create a new API key
4. Copy the key (starts with `re_`)

## Workflow Usage

### deploy.yml (Main Deployment)

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
  RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
  DOKPLOY_WEBHOOK_URL: ${{ secrets.DOKPLOY_WEBHOOK_URL }}
```

### studio-sync.yml (Content Sync)

```yaml
env:
  DOKPLOY_WEBHOOK_URL: ${{ secrets.DOKPLOY_WEBHOOK_URL }}
```

## Local Development

For local development, create a `.env` file (not committed to git):

```bash
GITHUB_TOKEN=ghp_your_token_here
RESEND_API_KEY=re_your_key_here
```

## Troubleshooting

### Deployment fails with "secret not configured"

- Verify the secret name matches exactly (case-sensitive)
- Check the secret has a value (not empty)
- Ensure workflow has permission to access secrets

### Build fails with API errors

- Verify GH_TOKEN has correct scopes
- Check RESEND_API_KEY is valid and not expired
- Ensure rate limits haven't been exceeded

## Security Notes

- Never commit secrets to the repository
- Rotate tokens periodically
- Use minimal required scopes for each token
- Review secret access in repository settings
