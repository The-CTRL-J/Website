(() => {
  const basePath = "assets/Musics/";
  const fallbackTracks = [
    `${basePath}Mr.%20Blue%20Sky.mp3`,
    `${basePath}%E2%89%A7%E2%97%A1%E2%89%A6.mp3`
  ];

  window.SITE_MUSIC_PLAYLIST = { tracks: [] };

  window.SITE_MUSIC_PLAYLIST_READY = (async () => {
    let tracks = [];
    const isFileProtocol = window.location.protocol === "file:";

    if (isFileProtocol) {
      window.SITE_MUSIC_PLAYLIST.tracks = fallbackTracks;
      return fallbackTracks;
    }

    try {
      const response = await fetch(basePath, { cache: "no-store" });
      if (response.ok) {
        const html = await response.text();
        const matches = [...html.matchAll(/href=["']([^"']+\.mp3)["']/gi)];
        tracks = [...new Set(matches.map((m) => m[1]))]
          .map((href) => {
            if (href.startsWith("http")) {
              return href;
            }
            const clean = href.replace(/^\.?\/?/, "");
            return clean.startsWith(basePath) ? clean : `${basePath}${clean}`;
          });
      }
    } catch (_) {
      // ignore and fallback below
    }

    // Fallback if directory listing is unavailable.
    if (!tracks.length) {
      try {
        const response = await fetch(`${basePath}playlist.json`, { cache: "no-store" });
        if (response.ok) {
          const payload = await response.json();
          const raw = Array.isArray(payload) ? payload : (payload?.tracks || []);
          tracks = raw
            .map((entry) => (typeof entry === "string" ? entry : (entry?.file || entry?.url || "")))
            .filter(Boolean)
            .map((file) => (file.startsWith(basePath) || file.startsWith("http") ? file : `${basePath}${file}`));
        }
      } catch (_) {
        // ignore
      }
    }

    const resolvedTracks = tracks.length ? tracks : fallbackTracks;
    window.SITE_MUSIC_PLAYLIST.tracks = resolvedTracks;
    return resolvedTracks;
  })();
})();
