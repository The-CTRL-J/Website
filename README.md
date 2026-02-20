# CTRL_J Website

Website containing several resources and tools.
This project is currently under construction.

## Structure

- `src/`: source HTML pages (`index`, `resources`, `credit`, `ninconvert`, `placeholder`)
- `public/`: static resources (`assets/...`)
- `.github/workflows/deploy-pages.yml`: automatic GitHub Pages deployment via Actions

## License

- Frontend website: `MIT` (see `LICENSE`)
- Dependencies and third-party notices: `THIRD_PARTY_NOTICES.md`

## Development

- Launch locally from the root: `start-local.bat`
- Debugging (open window): `start-local-debug.bat`
- Important: do not open `src/*.html` in `file://`.

## GitHub Pages

- Deployment is done via GitHub Actions (`Deploy Website` workflow).
- Single source: `src` + `public`.
- To enable: in GitHub > Settings > Pages > Creation and deployment > Source = `GitHub Actions`.
