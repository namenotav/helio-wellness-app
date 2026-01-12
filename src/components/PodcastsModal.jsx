import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';

const podcasts = [
  {
    id: 1,
    title: 'The Doctor\'s Farmacy with Mark Hyman, M.D.',
    author: 'Dr. Mark Hyman',
    imageUrl: 'https://images.theabcdn.com/i/38982488',
    feedUrl: 'https://podcast.drhyman.com/feed.xml',
  },
  {
    id: 2,
    title: 'Feel Better, Live More with Dr Rangan Chatterjee',
    author: 'Dr Rangan Chatterjee',
    imageUrl: 'https://images.theabcdn.com/i/41297494',
    feedUrl: 'https://feeds.acast.com/public/shows/feel-better-live-more',
  },
  {
    id: 3,
    title: 'The Model Health Show',
    author: 'Shawn Stevenson',
    imageUrl: 'https://images.theabcdn.com/i/38977438',
    feedUrl: 'https://themodelhealthshow.libsyn.com/rss',
  },
];

const PodcastsModal = ({ isOpen, onClose }) => {
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nowPlaying, setNowPlaying] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (selectedPodcast) {
      fetchEpisodes(selectedPodcast.feedUrl);
    }
  }, [selectedPodcast]);

  useEffect(() => {
    if (nowPlaying && audioRef.current) {
      audioRef.current.src = nowPlaying.enclosure.link;
      audioRef.current.play();
    }
  }, [nowPlaying]);

  const fetchEpisodes = async (feedUrl) => {
    setLoading(true);
    try {
      const response = await CapacitorHttp.request({
        method: 'GET',
        url: `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`,
      });
      
      if (response.data && response.data.items) {
        setEpisodes(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching podcast episodes:', error);
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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Wellness Podcasts</h2>
          <button onClick={onClose} className="modal-close-btn">
            &times;
          </button>
        </div>
        <div className="modal-body">
          {selectedPodcast ? (
            <div>
              <button onClick={() => {setSelectedPodcast(null); setNowPlaying(null);}}>&larr; Back to Podcasts</button>
              <h3>{selectedPodcast.title}</h3>
              {loading ? (
                <p>Loading episodes...</p>
              ) : (
                <ul>
                  {episodes.map((episode) => (
                    <li key={episode.guid}>
                      <p>{episode.title}</p>
                      <p>{new Date(episode.pubDate).toLocaleDateString()}</p>
                      <button onClick={() => handlePlayEpisode(episode)}>Play</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
              {podcasts.map((podcast) => (
                <div key={podcast.id} onClick={() => setSelectedPodcast(podcast)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                  <img src={podcast.imageUrl} alt={podcast.title} style={{ width: '100%', borderRadius: '8px' }} />
                  <h4 style={{ marginTop: '10px' }}>{podcast.title}</h4>
                  <p style={{ fontSize: '0.9em', color: '#888' }}>{podcast.author}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {nowPlaying && (
          <div className="audio-player" style={{ padding: '10px', background: '#2a2a2a', marginTop: '10px' }}>
            <p>Now Playing: {nowPlaying.title}</p>
            <audio ref={audioRef} controls style={{ width: '100%' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PodcastsModal;
