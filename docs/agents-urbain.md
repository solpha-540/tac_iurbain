# Création d'un agent Inter-urbain depuis Kisalu

Sur `/agents-urbain`, cliquer sur **Créer depuis Kisalu**, rechercher par nom,
postnom, prénom ou téléphone, puis sélectionner un résultat.

Les champs d'identité sont préremplis depuis Kisalu et peuvent être corrigés.
Le lieu de naissance, la commune et la direction Inter-urbain restent à compléter.
Le service est présélectionné uniquement si son libellé correspond à une unique
entrée du catalogue Inter-urbain ; sinon il doit être sélectionné.

Les identifiants RH Kisalu ne sont jamais copiés dans les références Inter-urbain.
L'API de catalogue des directions n'ayant pas été fournie, la direction utilise
actuellement une saisie de son identifiant Inter-urbain.

L'envoi utilise `POST /resource/agents` et `FormData` avec les noms de champs de
la capture fournie. Les dates sont envoyées au format `YYYY-MM-DD 00:00:00`.
`Id_user_created_at` provient de la session connectée.
Aucun header multipart manuel n'est fixé : le navigateur ajoute la boundary.
Les erreurs métier et de validation du serveur sont affichées dans le formulaire.
Une soumission en cours bloque les doubles clics et la fermeture du formulaire.
Après succès, la liste est rechargée.

Le champ photo attend un fichier. La référence `photo` Kisalu n'est pas transférée
comme une URL : un fichier peut être joint. Aucun endpoint de téléchargement de
photo Kisalu n'a été fourni. Les contraintes supplémentaires du serveur restent
appliquées par l'API.

La liste Kisalu est chargée à l'ouverture du formulaire et la recherche se fait
localement ; aucun endpoint de recherche supplémentaire n'est supposé.
Le GET Kisalu conserve sa session technique. Le POST et les catalogues utilisent
exclusivement la session Inter-urbain.

Validation : `node tests/auth-sessions.mjs`.
Les tests vérifient le mapping, la recherche, le multipart, les références,
l'utilisateur créateur et les erreurs sans créer d'agent sur le serveur réel.

Fichiers concernés :
- `src/components/Api/Agent_urbainService.js`
- `src/components/Api/agentUrbainForm.js`
- `src/contexts/Agent_urbainContext.js`
- `src/views/dashboard/urbain/entity/agent_urbain.jsx`
- `src/views/dashboard/urbain/entity/CreateAgentUrbainModal.jsx`
- `tests/auth-sessions.mjs`

## Actions sur un agent

Chaque ligne propose Affecter et Créer un compte.
L'affectation charge les agences Inter-urbain, puis envoie un POST JSON vers
`/resource/agent-affectations` avec `Id_agent`, `id_agence` et
`DateAffectation` au format `YYYY-MM-DD HH:mm:ss`, sans conversion UTC.

La création de compte envoie `agent_id`, `login`, `pwd`,
`pwd_confirmation`, `status` et `role_id` vers `/resource/agent-accounts`.
Le login est prérempli par le téléphone, en conservant les zéros initiaux.
Le statut est initialisé à AG et reste modifiable.
Les rôles sont chargés depuis GET /resource/roles et le rôle sélectionné est transmis dans role_id.

Les mots de passe ne sont ni journalisés ni enregistrés dans le stockage.
Les doubles soumissions sont bloquées pendant l'envoi. Après succès, la liste
est rechargée. La création de compte est désactivée pour un agent ayant un compte.
Les deux appels utilisent exclusivement urbainApi et affichent les erreurs API.

Fichiers : Agent_urbainService.js, Agent_urbainContext.js, agent_urbain.jsx,
AgentActionModal.jsx et tests/auth-sessions.mjs.

## Catalogue des rôles

L'écran Administration → Rôles est disponible à /administration/roles.
Il utilise RoleService.js et RoleContext.js pour :
- GET /resource/roles : liste, recherche locale, actualisation et erreurs.
- POST /resource/roles avec le corps JSON { "label": "CAISSIER" } : création.

Faute d'exemple JSON du GET fourni, le service prend en charge les collections
dans data ou dans data.roles. Une réponse réelle d'un autre format nécessitera
d'adapter uniquement getRoles.

Le formulaire de création de compte recharge ce catalogue à chaque ouverture.
Il affiche les libellés et transmet l'identifiant du rôle sélectionné dans role_id.
Aucun rôle fictif ne subsiste. Le formulaire bloque la soumission pendant
le chargement, après une erreur de chargement ou si le catalogue est vide.
Un bouton permet de réessayer après une erreur. Les doublons et autres validations
de l'API sont affichés ; les soumissions multiples sont bloquées pendant l'envoi.

Nouveaux fichiers : src/components/Api/RoleService.js, src/contexts/RoleContext.js,
src/views/dashboard/urbain/entity/role.jsx.
Modifications : AgentActionModal.jsx, Router.js, navigationConfigCustom.js,
tests/auth-sessions.mjs et cette documentation.
Aucune API de modification, suppression ou gestion des permissions n'est supposée.
