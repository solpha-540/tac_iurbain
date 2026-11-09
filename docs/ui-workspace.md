# Harmonisation des interfaces métier

Écrans concernés : agences, lignes et destinations, tarifs, réservations,
provinces, villes, communes, devises, services, opérateurs et types de colis.

Les composants partagés se trouvent dans src/components/urbain :
- WorkspacePage : titre, contexte et liens entre écrans métier.
- SearchInput : recherche avec nom accessible et bouton pour effacer.
- BusinessTable : pagination française, compteur de résultats et états de chargement/vide.

Les opérations et les providers existants sont conservés.
Les fenêtres Reactstrap partagent la classe urbain-dialog et les styles
de src/assets/scss/pages/urbain-workspace.scss, avec variantes mobiles et sombres.
Les noms accessibles des boutons à icône sont conservés ou complétés.

Vérification :
- node tests/workspace-ui.mjs : composants communs, recherche et compilation des onze pages.
- node tests/auth-sessions.mjs : non-régression des sessions et actions agents.
- node tests/api-proxy.mjs : routage des deux API.

Le rendu visuel dans un navigateur et les interactions tactiles restent à contrôler.
La compilation ciblée ne remplace pas la compilation globale, dont le blocage
query-string dans le template avait déjà été identifié.
