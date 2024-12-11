# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

### Golem notes

#### Body selection
- Build a dictionary of golem body types by species by looking at which creatures have the 'Golem' tag and finding their 'Species' property value. (All the golem bodies use the golem as a _mixin_ to acquire this tag.)
- Look up what body type the chosen creature uses, again by checking 'Species' property.
- The resulting golem body is used as the root blueprint for the golem.
- The golem always gets +10 AV, +3 STR, +2 TOU.

#### Catalyst selection
- This is very simple, just a dictionary lookup from the name of the liquid to the effect.

#### Atzmus selection
> Recall that this is a severed body part.
- Look up the creature that originated the body part.
- If that creature had any mutations, then the resulting effect is that one of the mutations is selected. (Certain NPC-only mutations are blacklisted from being selected, see `GolemAtzmusSelection.cs`.)
- Otherwise, the resulting effect is +5 to the highest attribute of the creature, or if multiple attributes were tied, a random one from among them.

#### Armament selection
> Recall that this is a zetachrome weapon.
- Again, this is pretty simple. The skill associated with the weapon is used to determine the golem's metachrome weaponry and grants them all skills in the associated tree.
- There are no static zetachrome missile weapons, and there are no metachrome missile weapons, but it does seem like it would be possible to use missile weapons here if they existed (eg through mods).

#### Incantation selection
- Each journal accomplishment has an associated 'mural category', presumably used by Herododicus in Tomb of the Eaters.
- The selected accomplishment's mural category determines its effect.

#### Hamsa selection
> Recall that this is an item weighing less than 5#.
- The 'semantic tags' (`<stag>`s in the blueprints) of the selected object determine the effect.
