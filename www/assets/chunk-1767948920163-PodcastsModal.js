import { r as reactExports, c as CapacitorHttp, j as jsxRuntimeExports } from "./entry-1767948920134-index.js";
const podcasts = [
  {
    id: 1,
    title: "The Doctor's Farmacy with Mark Hyman, M.D.",
    author: "Dr. Mark Hyman",
    imageUrl: "https://images.theabcdn.com/i/38982488",
    feedUrl: "https://podcast.drhyman.com/feed.xml"
  },
  {
    id: 2,
    title: "Feel Better, Live More with Dr Rangan Chatterjee",
    author: "Dr Rangan Chatterjee",
    imageUrl: "https://images.theabcdn.com/i/41297494",
    feedUrl: "https://feeds.acast.com/public/shows/feel-better-live-more"
  },
  {
    id: 3,
    title: "The Model Health Show",
    author: "Shawn Stevenson",
    imageUrl: "https://images.theabcdn.com/i/38977438",
    feedUrl: "https://themodelhealthshow.libsyn.com/rss"
  }
];
const PodcastsModal = ({ isOpen, onClose }) => {
  const [selectedPodcast, setSelectedPodcast] = reactExports.useState(null);
  const [episodes, setEpisodes] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [nowPlaying, setNowPlaying] = reactExports.useState(null);
  const audioRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (selectedPodcast) {
      fetchEpisodes(selectedPodcast.feedUrl);
    }
  }, [selectedPodcast]);
  reactExports.useEffect(() => {
    if (nowPlaying && audioRef.current) {
      audioRef.current.src = nowPlaying.enclosure.link;
      audioRef.current.play();
    }
  }, [nowPlaying]);
  const fetchEpisodes = async (feedUrl) => {
    setLoading(true);
    try {
      const response = await CapacitorHttp.request({
        method: "GET",
        url: `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`
      });
      if (response.data && response.data.items) {
        setEpisodes(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching podcast episodes:", error);
    } finally {
      setLoading(false);
    }
  };
  const handlePlayEpisode = (episode) => {
    setNowPlaying(episode);
  };
  if (!isOpen) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-backdrop", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-content", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Wellness Podcasts" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "modal-close-btn", children: "×" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-body", children: selectedPodcast ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        setSelectedPodcast(null);
        setNowPlaying(null);
      }, children: "← Back to Podcasts" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: selectedPodcast.title }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Loading episodes..." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: episodes.map((episode) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: episode.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: new Date(episode.pubDate).toLocaleDateString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handlePlayEpisode(episode), children: "Play" })
      ] }, episode.guid)) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "20px" }, children: podcasts.map((podcast) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => setSelectedPodcast(podcast), style: { cursor: "pointer", textAlign: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: podcast.imageUrl, alt: podcast.title, style: { width: "100%", borderRadius: "8px" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: { marginTop: "10px" }, children: podcast.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.9em", color: "#888" }, children: podcast.author })
    ] }, podcast.id)) }) }),
    nowPlaying && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "audio-player", style: { padding: "10px", background: "#2a2a2a", marginTop: "10px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Now Playing: ",
        nowPlaying.title
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("audio", { ref: audioRef, controls: true, style: { width: "100%" } })
    ] })
  ] }) });
};
export {
  PodcastsModal as default
};
