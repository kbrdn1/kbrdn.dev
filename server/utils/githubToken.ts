/**
 * The GitHub token, read at request time. `runtimeConfig.githubToken` alone is not enough: its
 * default (`process.env.GITHUB_TOKEN` in nuxt.config) is frozen at build time, the Docker image
 * is built without it, and at run time Nuxt only overrides it from `NUXT_GITHUB_TOKEN`. The
 * container gets `GITHUB_TOKEN` (scripts/deploy.sh), so it is read here too. Any token format
 * is accepted (ghp_, github_pat_, gho_…); placeholders count as no token.
 */
export function githubToken(): string | undefined {
  const token = useRuntimeConfig().githubToken || process.env.GITHUB_TOKEN || ''
  return token.length > 20 && !token.includes('xxxx') ? token : undefined
}
