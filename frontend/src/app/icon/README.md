# NeoForge — Icônes sélectionnées pour le portfolio

Sélection issue de `graphisme.zip`. Toutes les illustrations SVG conservent le style original NeoForge, sans réécriture des tracés.

## Contenu

- `marque/` — logos NeoForge et favicons. Afficher le logo horizontal sur un fond sombre dans la navbar.
- `navigation/` — navigation principale, menus, chevrons, flèches.
- `competences/` — frontend, backend, base de données, infrastructure, design, performance.
- `projets/` — fichiers, dossiers, réalisations et supports visuels.
- `badges/` — version encadrée pour les cartes « Expertises » / « Services ».
- `actions/` — CTA, télécharger CV, copier, filtrer, etc.
- `contact/` — e-mail, formulaire, calendrier et coordonnées.
- `reseaux/` — liens Github, LinkedIn, YouTube et réseaux additionnels.
- `parcours/` — marqueurs de liste et étapes 01 à 06.
- `catalogue.json` — provenance de chaque fichier, pour garder une traçabilité.

Le dossier a été volontairement réduit : pas de kits concurrents entiers, pas de dizaines de fichiers HTML/CSS de démonstration et pas de multiples variantes du même pictogramme.

## Emplacement demandé (Angular)

Cette archive contient `app/icon/`. Depuis `frontend/src/`, copier ce dossier pour obtenir :

`frontend/src/app/icon/`

**Important :** sous Angular, les SVG placés dans `src/app` ne deviennent PAS automatiquement accessibles depuis une balise `<img src="/icon/...">`. Il faut exposer les fichiers avec le système d'assets du projet, ou les copier dans `public/icon`.

### Solution qui conserve exactement `src/app/icon` (recommandée ici)

Dans le `angular.json` du dossier frontend, trouver `projects -> <nom-du-projet> -> architect -> build -> options -> assets` (ou `targets -> build -> options -> assets` suivant le projet). **Ajouter les entrées ci-dessous à la liste existante**, sans supprimer les autres entrées :

```json
{"glob":"**/*.svg","input":"src/app/icon","output":"/icon"},
{"glob":"**/*.png","input":"src/app/icon","output":"/icon"},
{"glob":"**/*.ico","input":"src/app/icon","output":"/icon"}
```

Ne pas exposer inutilement le README ou le catalogue. Redémarrer ensuite `npm start`.

Exemples HTML dans les templates Angular :

```html
<!-- Header : logo -->
<img src="/icon/marque/neoforge-logo-horizontal.svg" alt="NeoForge" width="160" />

<!-- Carte d'expertise -->
<img src="/icon/badges/code.svg" alt="" width="56" height="56" />

<!-- Lien GitHub -->
<a href="https://github.com/TON_PROFIL" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
  <img src="/icon/reseaux/github.svg" alt="" width="28" height="28" />
</a>
```

### Autre possibilité, sans modifier angular.json

Copier seulement les sous-dossiers SVG et favicons dans `frontend/public/icon/` (s'ils n'existent pas déjà). Dans ce cas, les URL `/icon/...` fonctionnent directement, mais les ressources de production seront alors dans `public/icon` au lieu de `src/app/icon`.

## Direction graphique

- Portfolio sombre : le style NeoForge Crystal blanc/cyan reste lisible.
- Ta capture précédente était davantage violette. La palette d'origine n'a pas été modifiée afin de préserver le logo. On pourra ajuster les couleurs séparément si tu confirmes ce choix.
- Dimensions : pictogrammes Crystal `28x28`, badges `56x56`, logos avec proportions conservées.
- Icônes décoratives : `alt=""`. Icônes contenant seules une action : donner une étiquette accessible au bouton/lien.

## Sécurité et droits

Tous les SVG sélectionnés ont été validés comme XML et contrôlés contre les scripts/événements intégrés courants. Les logos de réseaux sociaux restent des marques tierces. Aucun fichier de licence explicite n'a été identifié dans les packs sélectionnés : vérifie les droits d'usage si les ressources proviennent de tiers.
