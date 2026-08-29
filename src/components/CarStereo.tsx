import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Power, Radio as RadioIcon, Music, Bluetooth, Plug, Disc, Smartphone, Sliders, Settings,
  Clock, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Usb, Phone, Home,
  Library, Mic, Navigation, MapPin, Volume2, Sun,
} from 'lucide-react';
import Display from './Display';
import VolumeKnob from './VolumeKnob';
import {
  EQ_PRESETS, RADIO_STATIONS, TRACKS, CD_DISC, EqPreset, Mode, Source, Track,
  DEFAULT_SETTINGS, SettingsState,
} from '../types';

export default function CarStereo() {
  const [on, setOn] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(18);
  const [mode, setMode] = useState<Mode>('home');

  // Radio
  const [currentStationId, setCurrentStationId] = useState(RADIO_STATIONS[1].id);
  const [presetSlots, setPresetSlots] = useState<(number | null)[]>([null, null, null, null, null, null]);

  // Media (USB)
  const [tracks, setTracks] = useState<Track[]>(TRACKS);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);

  // CD
  const [cdLoaded, setCdLoaded] = useState(true);
  const [cdCurrentTrackId, setCdCurrentTrackId] = useState<string | null>(null);

  // Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [seek, setSeek] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [radioLoading, setRadioLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<number | null>(null);

  // EQ
  const [eqPresetIdx, setEqPresetIdx] = useState(0);
  const [eqBands, setEqBands] = useState<number[]>([...EQ_PRESETS[0].bands]);

  // Clock
  const [clock, setClock] = useState('12:00');

  // Settings
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);

  const eqPreset: EqPreset = eqPresetIdx >= 0 ? EQ_PRESETS[eqPresetIdx] : { id: 'custom', name: 'Custom', bands: eqBands };

  const isAudioMode = mode === 'media' || mode === 'cd' || mode === 'radio';

  const getCurrentTrack = useCallback((): Track | undefined => {
    if (mode === 'cd') return CD_DISC.find((t) => t.id === cdCurrentTrackId);
    if (mode === 'radio') {
      const station = RADIO_STATIONS.find((s) => s.id === currentStationId);
      if (station?.streamUrl) return { id: station.id, title: station.name, artist: station.tagline, album: station.genre || 'FM', duration: 0, cover: '', url: station.streamUrl };
      return undefined;
    }
    return tracks.find((t) => t.id === currentTrackId);
  }, [mode, cdCurrentTrackId, currentTrackId, tracks, currentStationId]);

  // Clock
  useEffect(() => {
    const update = () => {
      const d = new Date();
      const h = d.getHours();
      const m = d.getMinutes();
      if (settings.clockFormat === '12h') {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        setClock(`${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`);
      } else {
        setClock(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    };
    update();
    const iv = setInterval(update, 5000);
    return () => clearInterval(iv);
  }, [settings.clockFormat]);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => { setAudioCurrentTime(audio.currentTime); setAudioDuration(audio.duration || 0); };
    const onDur = () => setAudioDuration(audio.duration || 0);
    const onEnded = () => handleTrackEnd();
    const onPlaying = () => setRadioLoading(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('durationchange', onDur);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('error', () => setRadioLoading(false));
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('durationchange', onDur);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('playing', onPlaying);
    };
  }, [mode, cdCurrentTrackId, currentTrackId, currentStationId]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume / 40;
  }, [volume, muted]);

  useEffect(() => {
    const track = getCurrentTrack();
    const audio = audioRef.current;
    if (!audio) return;
    if (track?.url && isAudioMode) {
      if (mode === 'radio') setRadioLoading(true);
      audio.src = track.url;
      audio.load();
      setAudioCurrentTime(0);
      setAudioDuration(0);
      if (isPlaying) audio.play().catch(() => {});
    } else {
      audio.pause();
      audio.removeAttribute('src');
      setAudioCurrentTime(0);
      setAudioDuration(0);
    }
  }, [currentTrackId, cdCurrentTrackId, currentStationId, mode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const track = getCurrentTrack();
    if (isPlaying && track?.url && isAudioMode) {
      if (mode === 'radio') setRadioLoading(true);
      audio.play().catch(() => setRadioLoading(false));
    } else if (!isPlaying) {
      audio.pause();
      setRadioLoading(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isAudioMode && isPlaying && on) {
      const track = getCurrentTrack();
      if (track && !track.url) {
        tickRef.current = window.setInterval(() => {
          setSeek((s) => {
            if (s + 1 >= track.duration) { handleTrackEnd(); return 0; }
            return s + 1;
          });
        }, 1000);
      }
    }
    return () => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; } };
  }, [mode, isPlaying, on, currentTrackId, cdCurrentTrackId, currentStationId]);

  useEffect(() => {
    if (getCurrentTrack()?.url && mode !== 'radio') setSeek(audioCurrentTime);
  }, [audioCurrentTime]);

  const handleTrackEnd = () => {
    if (mode === 'radio') return; // streams don't "end"
    if (repeat) {
      if (audioRef.current && getCurrentTrack()?.url) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); }
      else setSeek(0);
      return;
    }
    if (mode === 'cd') nextCdTrack(); else nextTrack();
  };

  const nextTrack = () => {
    if (tracks.length === 0) return;
    const idx = currentTrackId ? tracks.findIndex((t) => t.id === currentTrackId) : -1;
    const nextIdx = shuffle ? Math.floor(Math.random() * tracks.length) : (idx + 1) % tracks.length;
    setCurrentTrackId(tracks[nextIdx].id); setSeek(0);
  };
  const prevTrack = () => {
    if (tracks.length === 0) return;
    const idx = currentTrackId ? tracks.findIndex((t) => t.id === currentTrackId) : 0;
    const prevIdx = idx === 0 ? tracks.length - 1 : idx - 1;
    setCurrentTrackId(tracks[prevIdx].id); setSeek(0);
  };
  const nextCdTrack = () => {
    const idx = cdCurrentTrackId ? CD_DISC.findIndex((t) => t.id === cdCurrentTrackId) : -1;
    setCdCurrentTrackId(CD_DISC[(idx + 1) % CD_DISC.length].id); setSeek(0);
  };
  const prevCdTrack = () => {
    const idx = cdCurrentTrackId ? CD_DISC.findIndex((t) => t.id === cdCurrentTrackId) : 0;
    setCdCurrentTrackId(CD_DISC[idx === 0 ? CD_DISC.length - 1 : idx - 1].id); setSeek(0);
  };

  const cycleEqPreset = () => {
    const next = (eqPresetIdx + 1) % EQ_PRESETS.length;
    setEqPresetIdx(next); setEqBands([...EQ_PRESETS[next].bands]);
  };
  const setEqBand = (i: number, v: number) => {
    const bands = [...eqBands]; bands[i] = v; setEqBands(bands); setEqPresetIdx(-1);
  };

  const handleVolume = (delta: number) => {
    setVolume((v) => Math.max(0, Math.min(40, v + delta)));
    if (muted) setMuted(false);
  };
  const handleScanUp = () => {
    const idx = RADIO_STATIONS.findIndex((s) => s.id === currentStationId);
    setCurrentStationId(RADIO_STATIONS[(idx + 1) % RADIO_STATIONS.length].id);
  };
  const handleScanDown = () => {
    const idx = RADIO_STATIONS.findIndex((s) => s.id === currentStationId);
    setCurrentStationId(RADIO_STATIONS[(idx - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length].id);
  };
  const savePreset = (slot: number) => {
    const station = RADIO_STATIONS.find((s) => s.id === currentStationId)!;
    const slots = [...presetSlots]; slots[slot] = station.freq; setPresetSlots(slots);
  };
  const loadPreset = (slot: number) => {
    const freq = presetSlots[slot]; if (!freq) return;
    const station = RADIO_STATIONS.find((s) => Math.abs(s.freq - freq) < 0.01);
    if (station) setCurrentStationId(station.id);
  };

  const handleUploadFiles = (files: FileList) => {
    const newTracks: Track[] = [];
    Array.from(files).forEach((file, i) => {
      if (!file.type.startsWith('audio/')) return;
      const url = URL.createObjectURL(file);
      const name = file.name.replace(/\.[^/.]+$/, '');
      const colors = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'];
      newTracks.push({
        id: `up-${Date.now()}-${i}`, title: name, artist: 'Uploaded File', album: file.name,
        duration: 0, cover: `linear-gradient(135deg,${colors[i % colors.length]},#1a1a1a)`,
        url, isUploaded: true,
      });
    });
    if (newTracks.length > 0) {
      setTracks((prev) => [...prev, ...newTracks]);
      if (!currentTrackId) { setCurrentTrackId(newTracks[0].id); setIsPlaying(true); }
    }
  };
  const handleRemoveTrack = (id: string) => {
    setTracks((prev) => {
      const track = prev.find((t) => t.id === id);
      if (track?.url) URL.revokeObjectURL(track.url);
      return prev.filter((t) => t.id !== id);
    });
    if (currentTrackId === id) { setCurrentTrackId(null); setIsPlaying(false); }
  };

  const handleSelectTrack = (id: string) => { setCurrentTrackId(id); setSeek(0); setIsPlaying(true); };
  const handleSelectCdTrack = (id: string) => { setCdCurrentTrackId(id); setSeek(0); setIsPlaying(true); };
  const handleSeek = (delta: number) => {
    const track = getCurrentTrack(); if (!track) return;
    if (track.url && audioRef.current) audioRef.current.currentTime = Math.max(0, Math.min(audioDuration, audioRef.current.currentTime + delta));
    else setSeek((s) => Math.max(0, Math.min(track.duration, s + delta)));
  };
  const handleSeekTo = (t: number) => {
    const track = getCurrentTrack(); if (!track) return;
    if (track.url && audioRef.current) audioRef.current.currentTime = t;
    else setSeek(t);
  };
  const handleEject = () => { if (audioRef.current) audioRef.current.pause(); setIsPlaying(false); setCdCurrentTrackId(null); setCdLoaded(false); };

  const handleTogglePlay = () => {
    if (isAudioMode && !(mode === 'cd' ? cdCurrentTrackId : currentTrackId) && mode !== 'radio') {
      if (mode === 'media' && tracks.length > 0) setCurrentTrackId(tracks[0].id);
      else if (mode === 'cd' && CD_DISC.length > 0) setCdCurrentTrackId(CD_DISC[0].id);
    }
    setIsPlaying((p) => !p);
  };
  const handlePrev = () => { if (mode === 'radio') handleScanDown(); else if (mode === 'cd') prevCdTrack(); else prevTrack(); };
  const handleNext = () => { if (mode === 'radio') handleScanUp(); else if (mode === 'cd') nextCdTrack(); else nextTrack(); };

  const updateSettings = (s: Partial<SettingsState>) => setSettings((prev) => ({ ...prev, ...s }));

  const accentColor = settings.theme === 'blue' ? '#3b82f6' : settings.theme === 'green' ? '#22c55e' : '#ea580c';

  // Top bar source buttons
  const sources: { mode: Source; icon: typeof RadioIcon; label: string }[] = [
    { mode: 'radio', icon: RadioIcon, label: 'FM' },
    { mode: 'media', icon: Music, label: 'USB' },
    { mode: 'cd', icon: Disc, label: 'CD' },
    { mode: 'carplay', icon: Smartphone, label: 'CARPLAY' },
    { mode: 'bluetooth', icon: Bluetooth, label: 'BT' },
    { mode: 'aux', icon: Plug, label: 'AUX' },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl flex flex-col">
      {/* Hidden audio */}
      <audio ref={audioRef} />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/50 shrink-0">
        {/* Home + brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode('home')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${mode === 'home' ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
          >
            <Home size={16} className={mode === 'home' ? 'text-amber-400' : 'text-gray-500'} />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_#fbbf24]" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-amber-400">ALDI</span>
            <span className="text-[7px] text-gray-500">BAUHN</span>
          </div>
        </div>

        {/* Source buttons */}
        <div className="flex items-center gap-1">
          {sources.map((s) => (
            <button
              key={s.mode}
              onClick={() => setMode(s.mode)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-all text-[8px] font-bold tracking-wider ${
                mode === s.mode ? 'bg-amber-500/15 border-amber-500 text-amber-300' : 'bg-gray-800/50 border-gray-700 text-gray-500 hover:border-gray-600'
              }`}
            >
              <s.icon size={12} /> {s.label}
            </button>
          ))}
        </div>

        {/* Quick nav */}
        <div className="flex items-center gap-1">
          <button onClick={() => setMode('library')} className={`w-8 h-8 rounded-lg flex items-center justify-center border ${mode === 'library' ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}>
            <Library size={14} className={mode === 'library' ? 'text-amber-400' : 'text-gray-500'} />
          </button>
          <button onClick={() => setMode('maps')} className={`w-8 h-8 rounded-lg flex items-center justify-center border ${mode === 'maps' ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}>
            <Navigation size={14} className={mode === 'maps' ? 'text-amber-400' : 'text-gray-500'} />
          </button>
          <button onClick={() => setMode('phone')} className={`w-8 h-8 rounded-lg flex items-center justify-center border ${mode === 'phone' ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}>
            <Phone size={14} className={mode === 'phone' ? 'text-amber-400' : 'text-gray-500'} />
          </button>
          <button onClick={() => setMode('voice')} className={`w-8 h-8 rounded-lg flex items-center justify-center border ${mode === 'voice' ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}>
            <Mic size={14} className={mode === 'voice' ? 'text-amber-400' : 'text-gray-500'} />
          </button>
          <button onClick={() => setMode('settings')} className={`w-8 h-8 rounded-lg flex items-center justify-center border ${mode === 'settings' ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}>
            <Settings size={14} className={mode === 'settings' ? 'text-amber-400' : 'text-gray-500'} />
          </button>
        </div>
      </div>

      {/* Main display area */}
      <div className="flex-1 min-h-0 p-3 flex gap-3">
        {/* Screen */}
        <div className="flex-1 rounded-lg bg-black p-1.5 shadow-inner min-w-0">
          <Display
            mode={mode} on={on} muted={muted} volume={volume} settings={settings}
            radioStations={RADIO_STATIONS} currentStationId={currentStationId} presetSlots={presetSlots}
            radioLoading={radioLoading}
            tracks={tracks} currentTrackId={currentTrackId} isPlaying={isPlaying} seek={seek}
            audioCurrentTime={audioCurrentTime} audioDuration={audioDuration}
            cdTracks={CD_DISC} cdCurrentTrackId={cdCurrentTrackId} cdLoaded={cdLoaded} cdEject={handleEject}
            eqPreset={eqPreset} eqBands={eqBands} clock={clock}
            onSelectStation={setCurrentStationId} onSelectTrack={handleSelectTrack}
            onTogglePlay={handleTogglePlay} onSeek={handleSeek} onSeekTo={handleSeekTo}
            onSavePreset={savePreset} onLoadPreset={loadPreset}
            onCycleEqPreset={cycleEqPreset} onSetEqBand={setEqBand}
            onScanUp={handleScanUp} onScanDown={handleScanDown}
            onUploadFiles={handleUploadFiles} onRemoveTrack={handleRemoveTrack}
            onSelectCdTrack={handleSelectCdTrack} onSetMode={setMode}
            onUpdateSettings={updateSettings}
          />
        </div>

        {/* Right side: knobs + transport */}
        <div className="w-32 shrink-0 flex flex-col gap-2 items-center justify-between">
          {/* Power */}
          <button
            onClick={() => setOn((o) => !o)}
            className={`w-full h-8 rounded-lg flex items-center justify-center gap-1.5 border transition-all ${on ? 'border-amber-600/50 bg-amber-600/10 text-amber-400' : 'border-gray-700 bg-gray-800 text-gray-500'}`}
          >
            <Power size={14} /> <span className="text-[8px] font-bold">POWER</span>
          </button>

          {/* Volume knob */}
          <VolumeKnob label="VOLUME" value={volume} max={40} color={accentColor} onChange={handleVolume} onToggle={() => setMuted((m) => !m)} />

          {/* Transport controls */}
          <div className="w-full flex flex-col gap-1.5 items-center">
            <div className="flex items-center gap-1.5">
              <button onClick={handlePrev} className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-amber-300 hover:border-amber-600 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={handleTogglePlay} className="w-11 h-11 rounded-full bg-gray-800 border border-amber-700/50 flex items-center justify-center text-amber-300 hover:text-amber-200 hover:border-amber-600 transition-colors">
                {isPlaying ? (
                  <span className="flex items-center gap-0.5">
                    <span className="w-1.5 h-4 bg-current" /><span className="w-1.5 h-4 bg-current" />
                  </span>
                ) : (
                  <span className="w-0 h-0 border-l-[12px] border-l-current border-y-[7px] border-y-transparent ml-1" />
                )}
              </button>
              <button onClick={handleNext} className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-amber-300 hover:border-amber-600 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button onClick={handlePrev} className="px-1.5 h-7 rounded-md bg-gray-800 border border-gray-700 flex items-center gap-0.5 text-[8px] text-gray-500 hover:text-amber-300">
                <ChevronDown size={12} />
              </button>
              <button onClick={() => setShuffle((s) => !s)} className={`w-7 h-7 rounded-md border flex items-center justify-center transition-colors ${shuffle ? 'bg-amber-500/15 border-amber-600 text-amber-300' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                <span className="text-[12px]">⇄</span>
              </button>
              <button onClick={() => setRepeat((r) => !r)} className={`w-7 h-7 rounded-md border flex items-center justify-center transition-colors ${repeat ? 'bg-amber-500/15 border-amber-600 text-amber-300' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                <span className="text-[12px]">↻</span>
              </button>
              <button onClick={handleNext} className="px-1.5 h-7 rounded-md bg-gray-800 border border-gray-700 flex items-center gap-0.5 text-[8px] text-gray-500 hover:text-amber-300">
                <ChevronUp size={12} />
              </button>
            </div>
          </div>

          {/* Function buttons */}
          <div className="grid grid-cols-2 gap-1 w-full">
            <button onClick={() => setMuted((m) => !m)} className={`h-7 rounded-md border text-[7px] font-bold flex items-center justify-center gap-0.5 ${muted ? 'border-amber-600 bg-amber-500/10 text-amber-300' : 'border-gray-700 bg-gray-800 text-gray-500 hover:text-amber-300'}`}>
              MUTE
            </button>
            <button onClick={() => setMode('clock')} className={`h-7 rounded-md border text-[7px] font-bold flex items-center justify-center gap-0.5 ${mode === 'clock' ? 'border-amber-600 bg-amber-500/10 text-amber-300' : 'border-gray-700 bg-gray-800 text-gray-500 hover:text-amber-300'}`}>
              <Clock size={10} /> CLK
            </button>
            <button onClick={cycleEqPreset} className="h-7 rounded-md border border-gray-700 bg-gray-800 text-[7px] font-bold text-gray-500 hover:text-amber-300 flex items-center justify-center">
              LOUD
            </button>
            <button onClick={() => setMode('eq')} className={`h-7 rounded-md border text-[7px] font-bold flex items-center justify-center gap-0.5 ${mode === 'eq' ? 'border-amber-600 bg-amber-500/10 text-amber-300' : 'border-gray-700 bg-gray-800 text-gray-500 hover:text-amber-300'}`}>
              <Sliders size={10} /> EQ
            </button>
            {mode === 'cd' && cdLoaded ? (
              <button onClick={handleEject} className="col-span-2 h-7 rounded-md border border-gray-700 bg-gray-800 text-[7px] font-bold text-gray-500 hover:text-red-400 flex items-center justify-center gap-1">
                <span className="text-[10px] leading-none">▲</span> EJECT
              </button>
            ) : (
              <button className="col-span-2 h-7 rounded-md border border-gray-700 bg-gray-800 text-[7px] font-bold text-gray-500 hover:text-amber-300 flex items-center justify-center gap-1">
                <Phone size={10} /> CALL
              </button>
            )}
          </div>

          {/* Balance knob */}
          <VolumeKnob label="BALANCE" value={settings.balance} min={-10} max={10} color={accentColor} onChange={(d) => updateSettings({ balance: Math.max(-10, Math.min(10, settings.balance + d)) })} />

          {/* USB indicator */}
          <div className="flex items-center gap-1 text-[7px] text-gray-600">
            <Usb size={8} /> USB
          </div>
        </div>
      </div>

      {/* Bottom slot detail */}
      <div className="px-4 py-1.5 border-t border-gray-700/50 flex items-center justify-between shrink-0">
        <div className="flex gap-1">
          <div className="w-10 h-1 rounded-full bg-gray-700" />
          <div className="w-10 h-1 rounded-full bg-gray-700" />
        </div>
        <div className="text-[6px] text-gray-600 tracking-widest">MICRO SD · AUX IN · USB · CD SLOT</div>
        <div className="w-3 h-1 rounded-full bg-amber-900/40" />
      </div>
    </div>
  );
}
