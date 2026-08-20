# Stug Skill

Evaluates the openskill (OS) of all the players in your lobby. Note that this is done entirely locally, there is no system (yet) to synchronize OS globally.

### Running

1. Download the zip file from the releases.
2. Extract the zip file.
3. Open Firefox and go to `about:debugging`.
4. Go to "The Firefox".
5. Select "Load Temporary Add-on".
6. Select `manifest.js` from the extracted folder.

Stug skill will then run whenever you run stug.io. To view OS by player, open the firefox side-bar. All rated players are listed in the stugskill tab. You can also filter by game mode and player name. The UI does not update automatically to new data. You have to click "fetch" to load newer data.

You may also download the source code yourself and build it from source. Doing so requires having `git` and `npm` set up.

```bash
cd path/to/projects
git clone https://github.com/codex128/stugskill.git
npm run build
```

This will open a new firefox instance with the extension already loaded.
