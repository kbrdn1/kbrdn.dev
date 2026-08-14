/**
 * Sonde de santé et d'identité du build.
 *
 * Sert deux usages :
 *  - le `HEALTHCHECK` du conteneur (Dockerfile + `docker run` de deploy.sh).
 *    L'ancienne sonde tapait `/`, qui répond dès que la home rend côté serveur
 *    — vrai même quand la couche API est morte. Passer par une route d'API
 *    fait échouer la sonde dans ce cas, ce qui est le comportement voulu.
 *  - répondre à « quelle version tourne sur preprod / prod en ce moment »
 *    depuis l'extérieur, sans accès SSH au VPS.
 */
export default defineEventHandler(() => {
  const { appVersion, gitSha, appEnv } = useRuntimeConfig();

  return {
    status: "ok",
    version: appVersion,
    sha: gitSha,
    env: appEnv,
  };
});
