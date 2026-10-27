# NeoForge — Accueil Angular 22 (version 1)

## Ce que contient ce correctif

Une page d'accueil complète pour ton portfolio Angular existant, en gardant **les noms et dossiers déjà en place** :

- `src/app/page/main-page/` : accueil, sections et mise en page responsive.
- `src/app/layout/navbar/` : logo, liens d'ancrage et menu mobile utilisable.
- `src/app/layout/footer/` : pied de page.
- `src/app/ui/button/`, `ui/card/`, `ui/badge/`, `ui/icon/` : composants réutilisables, au lieu des placeholders « works! ».
- `src/app/ui/animated-silk/` : animation **SVG + CSS** sans `cancelAnimationFrame`, sûre pour le SSR.
- `src/app/icon/` : 23 icônes NeoForge sélectionnées, classées (originaux éditables).
- `public/icon/` : les mêmes 23 SVG accessibles directement depuis Angular, via `/icon/...`. **Pas besoin de modifier `angular.json`.**
- `src/styles.css` : base globale + styles des sections du portfolio.

Aucune dépendance supplémentaire. Aucun changement de route ou de configuration Angular.

## Installation — attention à ton dossier `frontend`

1. **Sauvegarde ton dossier `frontend/src/app` et ton `frontend/src/styles.css` avant tout remplacement.**
2. Décompresse le ZIP **à l'intérieur du dossier `frontend/`**, celui qui contient `package.json`.
3. Conserve les chemins du ZIP : `src/app/...`, `public/icon/...` et `src/styles.css`.
4. Dans `frontend/`, lance :

   ```powershell
   npm install
   npm start
   ```

5. Ouvre l'URL indiquée dans le terminal (souvent `http://localhost:4200`).

**Important :** si ton `src/styles.css` contient déjà tes propres règles, ne l'écrase pas sans sauvegarde : fusionne son contenu avec celui fourni. Les sections « Projets », « Expertises », « Parcours » et « Services » utilisent ces règles globales.

## Route d'accueil

La page doit déjà être reliée par ton `app.routes.ts` (c'est le cas si elle s'affichait avant). **Ne remplace pas tes routes existantes.** Si l'URL `/` est vide, vérifie seulement qu'une route vers `MainPage` existe :

```ts
import { MainPage } from './page/main-page/main-page';
// À inclure dans le tableau existant :
{ path: '', component: MainPage }
```

## À personnaliser avant publication

- `main-page.html` : textes et descriptions de projets. Vérifie les noms/statuts publics que tu veux montrer.
- `#contact` : **aucune vraie adresse n'a été inventée**. Remplace la note « coordonnées et liens... » par tes contacts réels quand tu le souhaites.
- Les cartes « Accord », « NEXUS Code » et « NeoForge » utilisent des aperçus **conceptuels en CSS**, pas des captures d'écran de vrais produits. Remplace-les par tes captures lorsqu'elles sont prêtes.
- Les liens internes mènent bien aux sections. Aucun faux lien GitHub ou LinkedIn n'a été créé.

## Icônes : comment cela fonctionne ?

La source des icônes est dans `src/app/icon/` comme demandé ; Angular sert les fichiers depuis `public/icon/`.

```html
<app-icon name="competences/code" />
```

`app-icon` construit l'URL `/icon/competences/code.svg`. Si tu modifies l'original dans `src/app/icon/`, copie la version modifiée dans `public/icon/` pour voir le résultat.

## Tests effectués

- Compilation des composants/templates avec le compilateur Angular 22 : **OK**.
- Vérification des références d'icônes et de la structure : **OK**.
- Le build Angular CLI complet **n'a pas pu être vérifié ici** : mon environnement est en Node 22.16 (Angular CLI attend au minimum 22.22.3), et le `node_modules` de ton archive a été installé sous Windows (ce qui n'est pas utilisable directement sous Linux pour esbuild). Le test final de `npm start` doit donc être fait sur ta machine Windows.

## Pour aller plus loin

Le tissu lumineux est en SVG, pas en vrai WebGL : rendu stable et compatible SSR d'abord, amélioration visuelle ensuite. Respect de `prefers-reduced-motion` et de la navigation au clavier.
