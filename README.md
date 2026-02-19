# CTRL_J Website

Some Website with multiple resources and tools inside.
Ce projet est actuellement en phase de construction.

## Structure

- `website/`: source de travail
- `website/src/`: pages HTML source (`index`, `resources`, `credit`, `ninconvert`)
- `website/public/`: assets source (`assets/...`)
- `assets/`, `index.html`, `resources/`, `credit/`, `ninconvert/`: version publiee GitHub Pages (root)
- `website/dist/`: build de production (genere)
- `nodejs/`: environnement local Node/Vite (local uniquement, ignore pour GitHub)
- `backend/`: API locale NinConvert (`/health`, `/convert`)
- `tools/`: scripts de sync/verification de structure

## License

- Frontend website: `MIT` (see `LICENSE`)
- Planned backend/API for NinConvert: `GPL-3.0` (see `BACKEND_LICENSE.md`)
- Third-party dependencies and notices: `THIRD_PARTY_NOTICES.md`

## Dev

- Lancer en local depuis la racine: `start-local.bat`
- Debug (fenetre ouverte): `start-local-debug.bat`
- Lancer backend NinConvert: `start-ninconvert-backend.bat`
- Important: ne pas ouvrir `website/src/*.html` en `file://`.
- Sync source -> publication root: `powershell -ExecutionPolicy Bypass -File tools/sync-publish.ps1`
- Verifier structure source/publication: `powershell -ExecutionPolicy Bypass -File tools/verify-structure.ps1`
