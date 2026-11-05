# Authentification des deux services

L'utilisateur se connecte à Inter-urbain via `/auth/login`. Les services métier
utilisent exclusivement `urbainApi`. Seul `getAgents` utilise `kisaluApi`,
qui ouvre automatiquement la session technique au premier appel.

## Configuration

Vite charge les variables du fichier local `.env`. Redémarrer le serveur après
une modification. `.env.example` contient uniquement les noms de variables.

- `VITE_URBAIN_BASE_URL` : URL Inter-urbain terminée par `/api/v1`.
- `VITE_KISALU_BASE_URL` : URL Kisalu terminée par `/api/v1`.
- `VITE_KISALU_LOGIN`, `VITE_KISALU_PWD` : compte technique à renseigner localement.
- `VITE_URBAIN_REFRESH_PATH` : chemin relatif de refresh à confirmer auprès du backend.
- `VITE_URBAIN_REFRESH_TOKEN_FIELD` : nom du champ contenant le refresh token à confirmer.

Le refresh effectue un POST JSON vers le chemin configuré, avec le champ configuré.
La réponse attendue reprend `data.access_token`, et éventuellement
`data.refresh_token`, `data.expires_in`, `data.refresh_expires_in`.
Ce contrat doit être confirmé avec le backend. Si le contrat réel diffère, adapter
`refreshUrbainToken` dans `urbainAuth.js`.
Sans configuration de refresh, un 401 ferme proprement la session et redirige
vers `/pages/login`. Aucun endpoint de refresh n'est supposé.

Les variables VITE_* sont publiques dans le navigateur, même dans un .env ignoré
par Git. Pour garder le compte technique confidentiel, déplacer sa connexion et
les appels Kisalu derrière un backend. Cette implémentation navigateur ne peut pas
cacher ces identifiants aux utilisateurs.

## Sessions et reprise

Les clés `urbain_*` et `kisalu_*` sont séparées. Les anciennes clés génériques
sont supprimées lors d'une connexion ou déconnexion, sans migration de leur token.
Le profil Inter-urbain complet est conservé dans `urbain_user`, `urbain_agent`
et `urbain_agency`. Les champs d'affichage historiques restent disponibles.

Le refresh Inter-urbain et le login Kisalu disposent chacun de leur promesse
partagée. Une requête refusée n'est rejouée qu'une fois. Une erreur Kisalu ne
déconnecte pas l'utilisateur Inter-urbain. Un logout explicite ou l'échec du refresh
Inter-urbain efface les deux sessions. Une génération de session empêche les
réponses tardives d'enregistrer à nouveau des tokens après un logout.

Si Kisalu fournit une expiration, elle est vérifiée avant l'appel. Pour un JWT,
la valeur exp sert d'indication de cache ; le serveur reste responsable de sa
validation. Pour un token opaque sans durée, le 401 déclenche la reconnexion.

Les appels du template vers `/api/...` sont simulés par `src/@fake-db` et restent
sur axios global. L'inscription de démonstration n'écrit plus de token de session
métier. `axiosConfig.js` réexporte urbainApi pour les anciens imports.

## Vérification

Exécuter `node tests/auth-sessions.mjs` pour les tests avec transport simulé,
sans identifiants ni appels réseau réels. Exécuter `npm run build` pour compiler.

La validation réelle nécessite le compte technique, le contrat de refresh et
l'autorisation CORS des deux services pour l'origine du frontend.

## Fichiers concernés

Créés :
- `.env.example`
- `src/services/api/createApi.js`
- `src/services/api/urbainApi.js`
- `src/services/api/kisaluApi.js`
- `src/services/auth/tokenStorage.js`
- `src/services/auth/urbainAuth.js`
- `src/services/auth/kisaluAuth.js`
- `src/services/auth/session.js`
- `tests/auth-sessions.mjs`
- `docs/authentication.md`

Modifiés :
- `.env` (conservé localement et retiré du suivi Git)
- `.gitignore`
- `src/components/Api/axiosConfig.js`
- `src/components/Api/AgentService.js`
- `src/components/Api/AgenceService.js`
- `src/components/Api/bookingService.js`
- `src/components/Api/CommuneService.js`
- `src/components/Api/CurrencyService.js`
- `src/components/Api/LigneService.js`
- `src/components/Api/OperateurService.js`
- `src/components/Api/ProvinceService.js`
- `src/components/Api/ServiceService.js`
- `src/components/Api/TypeColisService.js`
- `src/components/Api/VilleService.js`
- `src/utility/utlitaire.js`
- `src/redux/actions/auth/loginActions.js`
- `src/redux/actions/auth/registerActions.js`
- `src/views/dashboard/login/Login.js`

## CORS en développement

Dans le navigateur, en mode développement Vite, les clients utilisent
`/api-urbain` et `/api-kisalu` sur la même origine que la page.
`vite.config.mjs` transmet ces appels aux URL du .env, en conservant
`/api/v1`, les corps JSON et les headers d'authentification.

Après cette modification, arrêter puis relancer `npm run dev` et recharger la
page. Le login doit apparaître dans Network avec le chemin local
`/api-urbain/auth/login`.

Ce proxy ne s'applique pas à la production ni aux tests SSR.
En production, autoriser l'origine du frontend sur les API (y compris OPTIONS,
Content-Type et Authorizations) ou déployer un reverse proxy.
La validation TLS reste activée.

Test du routage avec un serveur HTTP local simulant les deux API :
`node tests/api-proxy.mjs`.
Fichiers concernés par la correction CORS : `vite.config.mjs`,
`src/services/api/createApi.js`, `tests/api-proxy.mjs` et ce document.
