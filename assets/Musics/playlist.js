(() => {
  const basePath = "assets/Musics/";
  const fallbackTracks = [
    `${basePath}Mr.%20Blue%20Sky.mp3`,
    `${basePath}Kubbi%20_%20Overworld.mp3`,
    `${basePath}PlasticSixwall.mp3`
  ];

  function getGitHubRepoContext() {
    if (!window.location.hostname.endsWith(".github.io")) {
      return null;
    }

    const owner = window.location.hostname.split(".")[0] || "";
    const repo = window.location.pathname.split("/").filter(Boolean)[0] || "";
    if (!owner || !repo) {
      return null;
    }

    return { owner, repo };
  }

  async function detectTracksFromGitHubApi() {
    const ctx = getGitHubRepoContext();
    if (!ctx) {
      return [];
    }

    try {
      const apiUrl = `https://api.github.com/repos/${ctx.owner}/${ctx.repo}/contents/assets/Musics?ref=main`;
      const response = await fetch(apiUrl, { cache: "no-store" });
      if (!response.ok) {
        return [];
      }

      const items = await response.json();
      if (!Array.isArray(items)) {
        return [];
      }

      return items
        .filter((item) => item && item.type === "file" && /\.mp3$/i.test(item.name || ""))
        .map((item) => `${basePath}${encodeURIComponent(item.name)}`);
    } catch (_) {
      return [];
    }
  }

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

    if (!tracks.length) {
      tracks = await detectTracksFromGitHubApi();
    }

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
