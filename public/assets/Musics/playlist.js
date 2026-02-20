(() => {
  const explicitAssetRoot = (document.body && document.body.dataset ? (document.body.dataset.assetRoot || "") : "").trim();
  const pathName = window.location.pathname || "";
  const isDeepNestedPage = /\/resources\/ninconvert(\/|$)/i.test(pathName);
  const isNestedPage = /\/(resources|credit|ninconvert|placeholder)(\/|$)/i.test(pathName);
  const inferredAssetRoot = isDeepNestedPage ? "../../assets/" : (isNestedPage ? "../assets/" : "assets/");
  const assetRoot = explicitAssetRoot || inferredAssetRoot;
  const basePath = `${assetRoot}Musics/`;
  const placeholderCover = `${assetRoot}images/album-placeholder.svg`;

  const fallbackTracks = [
    {
      file: "Mr. Blue Sky.mp3",
      title: "Mr. Blue Sky",
      artist: "Electric Light Orchestra",
      cover: `${basePath}covers/mr-blue-sky.jpg`
    },
    {
      file: "Kubbi _ Overworld.mp3",
      title: "Kubbi - Overworld",
      artist: "Kubbi",
      cover: placeholderCover
    },
    {
      file: "PlasticSixwall.mp3",
      title: "≧◡≦",
      artist: "PlasticSixwall",
      cover: placeholderCover
    },
    {
      file: "EEYUH 2_audio only.mp3",
      title: "EEYUH 2",
      artist: "HR",
      cover: `${basePath}covers/FLUXXKLUB!.jpg`
    },
    {
      file: "Sherbet Lobby - bxnji.mp3",
      title: "Sherbet Lobby",
      artist: "Nicopatty - bxnji",
      cover: `${basePath}covers/yume-nikki-madotsuki.gif`
    },
    {
      file: "FALL! (Slowed)_audio only.mp3",
      title: "FALL ! (SLowed)",
      artist: "6IXXTY",
      cover: `${basePath}covers/FALL! (Slowed).jpg`
    }
    
  ];

  async function readPlaylistJson() {
    try {
      const response = await fetch(`${basePath}playlist.json`, { cache: "no-store" });
      if (!response.ok) {
        return [];
      }
      const payload = await response.json();
      return Array.isArray(payload) ? payload : (payload?.tracks || []);
    } catch (_) {
      return [];
    }
  }

  window.SITE_MUSIC_PLAYLIST = { tracks: fallbackTracks };

  window.SITE_MUSIC_PLAYLIST_READY = (async () => {
    const jsonTracks = await readPlaylistJson();
    const tracks = jsonTracks.length ? jsonTracks : fallbackTracks;
    window.SITE_MUSIC_PLAYLIST.tracks = tracks;
    return tracks;
  })();
})();
