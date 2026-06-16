# Essay Fabrik GUI - Setup fuer neues Projekt

## Schnellstart

1. Kopiere den gesamten `gui/` Ordner in dein neues Projekt
2. `npm install` (node_modules werden nicht mitkopiert)
3. Passe die 4 Dateien unten an
4. `npx next dev`

## Was angepasst werden muss

### 1. `src/data/controlling-db.json`
Die Controlling-Datenbank. Ersetze mit dem Template unten oder passe an:
- Business Unit Name
- Projekte und Auftraege
- Buchungen

### 2. `src/lib/team.ts`
Team-Mitglieder und deren AI-Modelle. Aendere:
- `team[]` Array: Namen, Farben, Modelle, Hierarchie
- `projectPhases[]`: Phasen und Workflows fuer dein Projekt

### 3. `src/lib/i18n.ts`
Uebersetzungen. Aendere:
- `roles`: Titel und Intro pro Rolle
- `workflows`: Namen der Workflows
- `phases`: Namen der Phasen

### 4. `src/lib/theme.ts`
Farben pro Rolle. Aendere:
- `theme.roles`: Eine Farbe pro Team-Mitglied

## Was NICHT geaendert werden muss
- `src/components/` - Alle Komponenten sind generisch
- `src/app/` - Layout und Routing
- `src/lib/controlling.ts` - Datenmodell und Berechnungen
- `package.json` - Dependencies

## Architektur

```
gui/
  src/
    data/
      controlling-db.json    ← DATEN (anpassen)
    lib/
      controlling.ts         ← Datenmodell (generisch)
      team.ts                ← Team + Phasen (anpassen)
      theme.ts               ← Farben (anpassen)
      i18n.ts                ← Texte (anpassen)
    components/
      ControllingPage.tsx    ← SAP-artiges Controlling
      Sidebar.tsx            ← Navigation
      WelcomePage.tsx        ← Team-Uebersicht
      WorkflowsOverview.tsx  ← Phasen-Uebersicht
    app/
      page.tsx               ← Hauptseite + Routing
      layout.tsx             ← HTML-Shell
```
