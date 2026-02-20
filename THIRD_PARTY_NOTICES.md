# Third Party Notices

This file tracks third-party software, libraries, and licenses used by the website and NinConvert stack.

## Used now (website repo)

### Frontend (static site)

- No bundled third-party JS/CSS framework is currently shipped.
- Static assets and custom scripts are project-owned.

### Backend (NinConvert API)

1. express
- URL: https://github.com/expressjs/express
- License: MIT

2. cors
- URL: https://github.com/expressjs/cors
- License: MIT

3. multer
- URL: https://github.com/expressjs/multer
- License: MIT

4. dotenv
- URL: https://github.com/motdotla/dotenv
- License: BSD-2-Clause

5. ffmpeg-static
- URL: https://github.com/eugeneware/ffmpeg-static
- License: GPL-3.0-or-later
- Note: downloads/ships an ffmpeg binary; ffmpeg license obligations apply.

## Locally used tools (not distributed in this repo)

These tools may be used on a local machine for conversion workflows, but are not bundled in this repository:

1. VGAudioCli
- URL: https://github.com/Thealexbarney/VGAudio
- License: MIT

2. vgmstream-cli
- URL: https://github.com/vgmstream/vgmstream
- License: mixed (see upstream `COPYING` and dependencies)

3. Nintendo SDK wave tools (local/private, not redistributed)
- Examples: `ctr_WaveConverter32`, `NW4F_WaveConverter`
- Status: proprietary SDK tools, intentionally not shipped in this repo.

## Maintenance

- Keep this file updated when adding/removing dependencies.
- Keep original copyright notices in distributed builds.
- Verify exact license terms before production release.
