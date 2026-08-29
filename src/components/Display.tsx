import { useState } from 'react';
import {
  Play, Pause, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Radio as RadioIcon,
  Music, Bluetooth, Plug, Disc, Upload, MapPin, Phone as PhoneIcon, MessageSquare,
  Navigation, Calendar, X, Home, Library, Mic, Search, Settings as SettingsIcon, Sliders,
  PhoneCall, Trash2, Plus, Minus, Volume2, Sun, Clock as ClockIcon, Car,
  Navigation as NavIcon, Fuel, Zap, Coffee,
} from 'lucide-react';
import { EQ_BANDS, EQ_PRESETS, RadioStation, Track, EqPreset, SettingsState, CONTACTS, MAP_DESTINATIONS } from '../types';
import type { Mode } from '../types';

interface Props {
  mode: Mode;
  on: boolean;
  muted: boolean;
  volume: number;
  settings: SettingsState;

  radioStations: RadioStation[];
  currentStationId: string;
  presetSlots: (number | null)[];

  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  seek: number;
  audioCurrentTime: number;
  audioDuration: number;

  cdTracks: Track[];
  cdCurrentTrackId: string | null;
  cdLoaded: boolean;
  cdEject: () => void;

  eqPreset: EqPreset;
  eqBands: number[];

  clock: string;
  radioLoading: boolean;

  onSelectStation: (id: string) => void;
  onSelectTrack: (id: string) => void;
  onTogglePlay: () => void;
  onSeek: (delta: number) => void;
  onSeekTo: (t: number) => void;
  onSavePreset: (slot: number) => void;
  onLoadPreset: (slot: number) => void;
  onCycleEqPreset: () => void;
  onSetEqBand: (i: number, v: number) => void;
  onScanUp: () => void;
  onScanDown: () => void;
  onUploadFiles: (files: FileList) => void;
  onRemoveTrack: (id: string) => void;
  onSelectCdTrack: (id: string) => void;
  onSetMode: (m: Mode) => void;
  onUpdateSettings: (s: Partial<SettingsState>) => void;
}

function fmtTime(s: number): string {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function Display(props: Props) {
  const { mode, on, muted, volume, settings } = props;

  if (!on) {
    return (
      <div className="h-full w-full rounded-sm bg-black flex items-center justify-center">
        <span className="text-gray-700 text-xs tracking-widest">— OFF —</span>
      </div>
    );
  }

  const accent = settings.theme === 'blue' ? '#3b82f6' : settings.theme === 'green' ? '#22c55e' : '#ea580c';
  const accentClass = settings.theme === 'blue' ? 'text-blue-400' : settings.theme === 'green' ? 'text-green-400' : 'text-orange-400';
  const accentBg = settings.theme === 'blue' ? 'bg-blue-900/40 border-blue-500' : settings.theme === 'green' ? 'bg-green-900/40 border-green-500' : 'bg-orange-900/40 border-orange-500';
  const accentText = settings.theme === 'blue' ? 'text-blue-300' : settings.theme === 'green' ? 'text-green-300' : 'text-orange-300';
  const dimText = settings.theme === 'blue' ? 'text-blue-700' : settings.theme === 'green' ? 'text-green-700' : 'text-orange-700';
  const borderClass = settings.theme === 'blue' ? 'border-blue-900/50' : settings.theme === 'green' ? 'border-green-900/50' : 'border-orange-900/50';
  const dimBg = settings.theme === 'blue' ? 'bg-blue-950/40' : settings.theme === 'green' ? 'bg-green-950/40' : 'bg-orange-950/40';

  return (
    <div className={`h-full w-full rounded-sm bg-black overflow-hidden relative ${accentClass} font-mono`} style={{ filter: `brightness(${0.4 + settings.brightness / 100})` }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 3px)' }}
      />
      <div className="relative h-full flex flex-col px-3 py-2">
        {/* Status bar */}
        <div className={`flex items-center justify-between text-[10px] mb-1 border-b ${borderClass} pb-1`}>
          <div className="flex items-center gap-1.5">
            <Home size={11} className={accentText} />
            <span className="uppercase tracking-widest">{mode}</span>
          </div>
          <div className="flex items-center gap-2">
            {muted && <span className="text-amber-400">MUTE</span>}
            <span className={accentText}>
              {'|'.repeat(Math.ceil((volume / 40) * 8)).padEnd(8, '.')}
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {mode === 'home' && <HomeView {...props} accentText={accentText} dimText={dimText} accentBg={accentBg} accentClass={accentClass} />}
          {mode === 'radio' && <RadioView {...props} accentText={accentText} dimText={dimText} dimBg={dimBg} borderClass={borderClass} />}
          {mode === 'media' && <MediaView {...props} accentText={accentText} dimText={dimText} />}
          {mode === 'cd' && <CdView {...props} accentText={accentText} dimText={dimText} />}
          {mode === 'carplay' && <CarPlayView {...props} onSetMode={props.onSetMode} accentText={accentText} />}
          {mode === 'library' && <LibraryView {...props} accentText={accentText} dimText={dimText} />}
          {mode === 'maps' && <MapsView accentText={accentText} dimText={dimText} />}
          {mode === 'phone' && <PhoneView accentText={accentText} dimText={dimText} />}
          {mode === 'voice' && <VoiceView accentText={accentText} dimText={dimText} onSetMode={props.onSetMode} />}
          {mode === 'bluetooth' && <BluetoothView accentText={accentText} />}
          {mode === 'aux' && <AuxView accentText={accentText} />}
          {mode === 'eq' && <EqView {...props} accentText={accentText} dimText={dimText} />}
          {mode === 'settings' && <SettingsView {...props} accentText={accentText} dimText={dimText} />}
          {mode === 'clock' && <ClockView clock={props.clock} accentText={accentText} dimText={dimText} />}
        </div>
      </div>
    </div>
  );
}

/* ============================ HOME ============================ */
function HomeView(props: Props & { accentText: string; dimText: string; accentBg: string; accentClass: string }) {
  const { clock, onSetMode, accentText, dimText, accentBg, accentClass } = props;
  const apps: { mode: Mode; icon: typeof Music; label: string }[] = [
    { mode: 'radio', icon: RadioIcon, label: 'Radio' },
    { mode: 'media', icon: Music, label: 'Music' },
    { mode: 'cd', icon: Disc, label: 'CD' },
    { mode: 'library', icon: Library, label: 'Library' },
    { mode: 'maps', icon: Navigation, label: 'Maps' },
    { mode: 'phone', icon: PhoneIcon, label: 'Phone' },
    { mode: 'carplay', icon: Car, label: 'CarPlay' },
    { mode: 'voice', icon: Mic, label: 'Voice' },
    { mode: 'bluetooth', icon: Bluetooth, label: 'BT' },
    { mode: 'aux', icon: Plug, label: 'AUX' },
    { mode: 'eq', icon: Sliders, label: 'EQ' },
    { mode: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl font-bold">{clock}</div>
        <div className="text-right">
          <div className="text-[10px] font-bold">ALDI BAUHN</div>
          <div className={`text-[8px] ${dimText}`}>ACDV-0621 · v2.0.1</div>
        </div>
      </div>

      {/* Now playing strip */}
      {props.currentTrackId && props.tracks.find(t => t.id === props.currentTrackId) && (
        <button
          onClick={() => onSetMode('media')}
          className={`flex items-center gap-2 p-1.5 rounded-md ${accentBg} border mb-2 hover:brightness-125 transition-all`}
        >
          <div className="w-8 h-8 rounded-sm shrink-0 overflow-hidden bg-gray-800">
            {(() => { const t = props.tracks.find(t => t.id === props.currentTrackId)!; return t.cover.startsWith('http') ? <img src={t.cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ background: t.cover }} />; })()}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="text-[10px] font-bold truncate">{props.tracks.find(t => t.id === props.currentTrackId)!.title}</div>
            <div className={`text-[8px] ${dimText} truncate`}>{props.tracks.find(t => t.id === props.currentTrackId)!.artist}</div>
          </div>
          {props.isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
      )}

      <div className="grid grid-cols-4 gap-2 flex-1 content-start">
        {apps.map((app) => (
          <button
            key={app.mode}
            onClick={() => onSetMode(app.mode)}
            className={`flex flex-col items-center gap-1 rounded-lg p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentBg} border`}>
              <app.icon size={18} className={accentText} />
            </div>
            <span className={`text-[8px] ${accentClass}`}>{app.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================ RADIO ============================ */
function RadioView(props: any) {
  const { radioStations, currentStationId, presetSlots, onSavePreset, onLoadPreset, onScanUp, onScanDown, isPlaying, radioLoading, accentText, dimText, dimBg, borderClass } = props;
  const station = radioStations.find((s: RadioStation) => s.id === currentStationId)!;

  return (
    <div className="h-full flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold leading-none">{station.freq.toFixed(1)}</span>
          <span className="text-xs">FM</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold">{station.name}</div>
          <div className={`text-[9px] ${dimText}`}>{station.tagline}</div>
        </div>
      </div>

      {/* Now playing indicator */}
      <div className={`flex items-center gap-2 rounded-sm px-2 py-1 ${dimBg}`}>
        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-amber-400 animate-pulse' : radioLoading ? 'bg-amber-600 animate-pulse' : 'bg-gray-700'}`} />
        <span className={`text-[9px] ${dimText}`}>
          {radioLoading ? 'BUFFERING...' : isPlaying ? 'LIVE STREAM' : 'PAUSED'}
        </span>
        {station.genre && <span className={`text-[7px] ${dimText} ml-auto uppercase`}>{station.genre}</span>}
      </div>

      <div className={`relative h-5 ${dimBg} rounded-sm overflow-hidden`}>
        <div className={`absolute inset-0 flex justify-between px-1 text-[7px] ${dimText} items-end`}>
          {['87.5', '92', '97', '101', '106', '108'].map((t) => <span key={t}>{t}</span>)}
        </div>
        <div className="absolute top-0 bottom-0 w-[2px] bg-amber-400 shadow-[0_0_6px_#fbbf24]" style={{ left: `${((station.freq - 87.5) / (108 - 87.5)) * 100}%` }} />
      </div>

      <div className="grid grid-cols-6 gap-1">
        {presetSlots.map((freq: number | null, i: number) => (
          <button
            key={i}
            onClick={() => (freq ? onLoadPreset(i) : onSavePreset(i))}
            className={`text-[8px] py-0.5 rounded-sm border ${borderClass} hover:border-amber-400 transition-colors ${dimBg}`}
          >
            <span className={dimText}>P{i + 1}</span>
            {freq ? <span className={`ml-0.5 ${accentText}`}>{freq.toFixed(1)}</span> : <span className="ml-0.5 text-gray-800">--</span>}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-0.5 mt-1">
        {radioStations.map((s: RadioStation) => (
          <button
            key={s.id}
            onClick={() => props.onSelectStation(s.id)}
            className={`flex items-center justify-between text-[10px] py-0.5 px-2 rounded-sm ${s.id === currentStationId ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            <span className={s.id === currentStationId ? accentText : ''}>{s.freq.toFixed(1)} FM</span>
            <span className={dimText}>{s.name}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto text-[10px]">
        <button onClick={onScanDown} className="flex items-center gap-1 hover:text-amber-300"><ChevronDown size={12} /> SCAN</button>
        <span className={dimText + ' text-[8px]'}>SAVED: {presetSlots.filter(Boolean).length}/6</span>
        <button onClick={onScanUp} className="flex items-center gap-1 hover:text-amber-300">SCAN <ChevronUp size={12} /></button>
      </div>
    </div>
  );
}

/* ============================ MEDIA ============================ */
function MediaView(props: any) {
  const { tracks, currentTrackId, isPlaying, audioCurrentTime, audioDuration, onTogglePlay, onSelectTrack, onSeek, onSeekTo, onUploadFiles, onRemoveTrack, accentText, dimText } = props;
  const track = tracks.find((t: Track) => t.id === currentTrackId);

  return (
    <div className="h-full flex flex-col gap-1.5">
      {track ? (
        <>
          <div className="flex gap-2 items-center">
            <div className="w-12 h-12 rounded-sm shrink-0 shadow-lg flex items-center justify-center overflow-hidden bg-gray-800">
              {track.cover && track.cover.startsWith('http') ? (
                <img src={track.cover} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background: track.cover }} />
              )}
              {track.isUploaded && <Music size={18} className="text-white/70 absolute" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold truncate">{track.title}</div>
              <div className={`text-[10px] ${dimText} truncate`}>{track.artist}</div>
              <div className={`text-[9px] ${dimText} truncate`}>{track.album}</div>
            </div>
            <button onClick={onTogglePlay} className={`shrink-0 w-9 h-9 rounded-full border ${accentText.includes('orange') ? 'border-orange-700' : accentText.includes('blue') ? 'border-blue-700' : 'border-green-700'} flex items-center justify-center hover:bg-white/10`}>
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>

          <div className="space-y-0.5">
            <input type="range" min={0} max={audioDuration || track.duration || 1} value={audioCurrentTime} onChange={(e) => onSeekTo(Number(e.target.value))} className="w-full h-1 accent-orange-500 cursor-pointer" />
            <div className={`flex justify-between text-[8px] ${dimText}`}>
              <span>{fmtTime(audioCurrentTime)}</span>
              <div className="flex gap-1">
                <button onClick={() => onSeek(-5)} className="hover:text-amber-300">-5s</button>
                <button onClick={() => onSeek(5)} className="hover:text-amber-300">+5s</button>
              </div>
            </div>
          </div>
        </>
      ) : <div className={`text-center ${dimText} text-[10px] py-2`}>No track selected</div>}

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
        <div className={`text-[8px] ${dimText} mb-0.5 flex items-center justify-between`}>
          <span>PLAYLIST ({tracks.length})</span>
          <label className="flex items-center gap-0.5 cursor-pointer hover:text-amber-300">
            <Upload size={9} /> ADD
            <input type="file" accept="audio/*" multiple className="hidden" onChange={(e) => e.target.files && onUploadFiles(e.target.files)} />
          </label>
        </div>
        {tracks.length === 0 && <div className={`text-center ${dimText} text-[9px] py-2`}>No tracks. Click ADD to upload.</div>}
        {tracks.map((t: Track, i: number) => (
          <div key={t.id} className={`flex items-center gap-1.5 text-[9px] py-0.5 px-1 rounded-sm ${t.id === currentTrackId ? 'bg-white/10' : 'hover:bg-white/5'}`}>
            <button onClick={() => onSelectTrack(t.id)} className="flex items-center gap-1.5 flex-1 min-w-0 text-left">
              <span className={dimText + ' w-3 text-right'}>{i + 1}</span>
              <span className="flex-1 truncate">{t.title}</span>
              {t.id === currentTrackId && isPlaying && <span className="text-amber-400 animate-pulse">●</span>}
              <span className={dimText}>{fmtTime(t.duration)}</span>
            </button>
            {t.isUploaded && <button onClick={() => onRemoveTrack(t.id)} className={dimText + ' hover:text-red-400'}><X size={9} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ CD ============================ */
function CdView(props: any) {
  const { cdTracks, cdCurrentTrackId, cdLoaded, isPlaying, audioCurrentTime, audioDuration, cdEject, onSelectCdTrack, onTogglePlay, onSeekTo, accentText, dimText } = props;
  const track = cdTracks.find((t: Track) => t.id === cdCurrentTrackId);

  if (!cdLoaded) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <Disc size={28} className={dimText} />
        <div className={`text-xs ${dimText}`}>NO DISC</div>
        <button onClick={() => {}} className={`text-[8px] ${dimText}`}>Insert CD to play</button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-1.5">
      <div className="flex gap-2 items-center">
        <div className={`w-12 h-12 rounded-full shrink-0 shadow-lg flex items-center justify-center ${isPlaying ? 'animate-[spin-slow_4s_linear_infinite]' : ''}`} style={{ background: 'radial-gradient(circle at 50% 50%, #333 8%, #1a1a1a 9%, #2a2a2a 30%, #1a1a1a 50%)' }}>
          <div className="w-3 h-3 rounded-full bg-orange-600 shadow-[0_0_4px_#ea580c]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold truncate">CD · {cdTracks.length} tracks</div>
          {track && <><div className={`text-[10px] ${dimText} truncate`}>{track.title}</div><div className={`text-[9px] ${dimText} truncate`}>{track.artist}</div></>}
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={onTogglePlay} className={`w-7 h-7 rounded-full border ${accentText.includes('orange') ? 'border-orange-700' : 'border-blue-700'} flex items-center justify-center hover:bg-white/10`}>
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button onClick={cdEject} className={`text-[7px] ${dimText} hover:text-red-400`}>EJECT</button>
        </div>
      </div>

      {track && (
        <div className="space-y-0.5">
          <input type="range" min={0} max={audioDuration || track.duration || 1} value={audioCurrentTime} onChange={(e) => onSeekTo(Number(e.target.value))} className="w-full h-1 accent-orange-500 cursor-pointer" />
          <div className={`flex justify-between text-[8px] ${dimText}`}><span>{fmtTime(audioCurrentTime)}</span><span>{fmtTime(audioDuration || track.duration)}</span></div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
        {cdTracks.map((t: Track, i: number) => (
          <button key={t.id} onClick={() => onSelectCdTrack(t.id)} className={`w-full text-left flex items-center gap-1.5 text-[9px] py-0.5 px-1 rounded-sm ${t.id === cdCurrentTrackId ? 'bg-white/10' : 'hover:bg-white/5'}`}>
            <span className={dimText + ' w-3 text-right'}>{i + 1}</span>
            <span className="flex-1 truncate">{t.title}</span>
            {t.id === cdCurrentTrackId && isPlaying && <span className="text-amber-400 animate-pulse">●</span>}
            <span className={dimText}>{fmtTime(t.duration)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================ CARPLAY ============================ */
function CarPlayView(props: any) {
  const { onSetMode, accentText } = props;
  const time = new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });
  const apps = [
    { icon: Navigation, label: 'Maps', mode: 'maps' as Mode, color: 'text-blue-400' },
    { icon: PhoneIcon, label: 'Phone', mode: 'phone' as Mode, color: 'text-green-400' },
    { icon: Music, label: 'Music', mode: 'media' as Mode, color: 'text-pink-400' },
    { icon: MessageSquare, label: 'Msgs', mode: null, color: 'text-green-400' },
    { icon: Calendar, label: 'Cal', mode: null, color: 'text-red-400' },
    { icon: Play, label: 'Now', mode: 'media' as Mode, color: 'text-orange-400' },
    { icon: Fuel, label: 'Fuel', mode: 'maps' as Mode, color: 'text-orange-400' },
    { icon: Car, label: 'Car', mode: 'home' as Mode, color: 'text-blue-400' },
  ];
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-black rounded-sm">
      <div className="flex items-center justify-between px-2 py-1 text-[10px] text-orange-400">
        <span className="font-bold">CarPlay</span><span>{time}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 px-2 py-2 flex-1 content-start">
        {apps.map((app) => (
          <button key={app.label} onClick={() => app.mode && onSetMode(app.mode)} className="flex flex-col items-center gap-0.5 rounded-lg p-1 hover:bg-white/5 cursor-pointer transition-colors">
            <app.icon size={20} className={app.color} />
            <span className="text-[7px] text-gray-300">{app.label}</span>
          </button>
        ))}
      </div>
      <div className="px-2 pb-1 text-center text-[7px] text-gray-600">Connected · iPhone</div>
    </div>
  );
}

/* ============================ LIBRARY ============================ */
function LibraryView(props: any) {
  const { tracks, currentTrackId, isPlaying, onSelectTrack, onUploadFiles, onRemoveTrack, onSetMode, accentText, dimText } = props;
  const [search, setSearch] = useState('');
  const filtered = tracks.filter((t: Track) => t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase()));
  const uploadedCount = tracks.filter((t: Track) => t.isUploaded).length;

  return (
    <div className="h-full flex flex-col gap-1.5">
      <div className={`text-xs font-bold border-b ${dimText.includes('orange') ? 'border-orange-900/50' : 'border-blue-900/50'} pb-1`}>UPLOAD LIBRARY</div>

      <div className="flex items-center gap-1.5">
        <div className={`flex items-center gap-1 flex-1 rounded-sm ${dimText.includes('orange') ? 'bg-orange-950/40' : 'bg-blue-950/40'} px-2 py-1`}>
          <Search size={11} className={dimText} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className={`bg-transparent text-[10px] outline-none flex-1 ${accentText} placeholder-gray-600`} />
        </div>
        <label className={`flex items-center gap-1 cursor-pointer rounded-sm px-2 py-1 text-[9px] font-bold bg-white/10 hover:bg-white/20 ${accentText}`}>
          <Upload size={11} /> Upload
          <input type="file" accept="audio/*" multiple className="hidden" onChange={(e) => e.target.files && onUploadFiles(e.target.files)} />
        </label>
      </div>

      <div className={`flex items-center justify-between text-[8px] ${dimText}`}>
        <span>{filtered.length} tracks · {uploadedCount} uploaded</span>
        <span>Total: {tracks.length}</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
        {filtered.length === 0 && <div className={`text-center ${dimText} text-[9px] py-4`}>No tracks found</div>}
        {filtered.map((t: Track, i: number) => (
          <div key={t.id} className={`flex items-center gap-2 text-[9px] py-1 px-1.5 rounded-sm ${t.id === currentTrackId ? 'bg-white/10' : 'hover:bg-white/5'}`}>
            <div className="w-7 h-7 rounded-sm shrink-0 flex items-center justify-center overflow-hidden bg-gray-800">
              {t.cover.startsWith('http') ? <img src={t.cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ background: t.cover }} />}
            </div>
            <button onClick={() => { onSelectTrack(t.id); onSetMode('media'); }} className="flex-1 min-w-0 text-left">
              <div className="truncate font-bold">{t.title}</div>
              <div className={dimText + ' truncate'}>{t.artist} · {t.isUploaded ? 'UPLOAD' : 'BUILTIN'}</div>
            </button>
            {t.id === currentTrackId && isPlaying && <span className="text-amber-400 animate-pulse">●</span>}
            {t.isUploaded && <button onClick={() => onRemoveTrack(t.id)} className={dimText + ' hover:text-red-400'}><Trash2 size={11} /></button>}
          </div>
        ))}
      </div>

      {/* Upload drop zone */}
      <label className={`flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed ${dimText.includes('orange') ? 'border-orange-900/60' : 'border-blue-900/60'} py-2 cursor-pointer hover:bg-white/5 transition-colors`}>
        <Upload size={16} className={dimText} />
        <span className={`text-[8px] ${dimText}`}>Tap to upload audio files</span>
        <input type="file" accept="audio/*" multiple className="hidden" onChange={(e) => e.target.files && onUploadFiles(e.target.files)} />
      </label>
    </div>
  );
}

/* ============================ MAPS ============================ */
function MapsView({ accentText, dimText }: { accentText: string; dimText: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const dest = MAP_DESTINATIONS.find(d => d.id === selected);

  return (
    <div className="h-full flex flex-col gap-1.5">
      <div className={`text-xs font-bold border-b ${dimText.includes('orange') ? 'border-orange-900/50' : 'border-blue-900/50'} pb-1`}>MAPS · NAVIGATION</div>

      {/* Map canvas */}
      <div className="relative h-[80px] rounded-md overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
        {/* Roads */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 80">
          <path d="M0,60 Q50,40 100,35 T200,20" stroke="#555" strokeWidth="2.5" fill="none" />
          <path d="M0,40 Q30,50 60,48 T120,55 T200,50" stroke="#444" strokeWidth="2" fill="none" />
          <path d="M40,0 L45,80" stroke="#444" strokeWidth="2" fill="none" />
          <path d="M120,0 L125,80" stroke="#444" strokeWidth="2" fill="none" />
        </svg>
        {/* Moving car */}
        <div className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-[car-drive_3s_ease-in-out_infinite]" />
        {/* Destination pin */}
        {dest && (
          <div className="absolute" style={{ left: '78%', top: '18%' }}>
            <MapPin size={14} className="text-red-400 fill-red-400/30" />
          </div>
        )}
        <div className={`absolute bottom-1 right-1 text-[7px] ${dimText} bg-black/40 px-1 rounded`}>MELBOURNE</div>
      </div>

      {dest && (
        <div className={`rounded-md p-1.5 text-[10px] ${dimText.includes('orange') ? 'bg-orange-950/30 border border-orange-900/40' : 'bg-blue-950/30 border border-blue-900/40'}`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300">{dest.name}</span>
            <span className={dimText}>{dest.distance} · {dest.eta}</span>
          </div>
          <div className={dimText + ' text-[8px] truncate'}>{dest.address}</div>
          <button className={`mt-1 w-full rounded-sm py-0.5 text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-700/50 hover:bg-amber-500/30`}>START NAVIGATION</button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
        <div className={`text-[8px] ${dimText} mb-0.5`}>DESTINATIONS</div>
        {MAP_DESTINATIONS.map(d => (
          <button key={d.id} onClick={() => setSelected(d.id)} className={`w-full text-left flex items-center gap-2 text-[9px] py-1 px-1.5 rounded-sm ${d.id === selected ? 'bg-white/10' : 'hover:bg-white/5'}`}>
            <MapPin size={12} className={accentText} />
            <div className="flex-1 min-w-0">
              <div className="truncate font-bold">{d.name}</div>
              <div className={dimText + ' text-[8px] truncate'}>{d.address}</div>
            </div>
            <div className={`text-right ${dimText}`}>
              <div>{d.distance}</div>
              <div className="text-[7px]">{d.eta}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick POI buttons */}
      <div className="flex gap-1">
        <button className={`flex-1 flex items-center justify-center gap-1 rounded-sm py-1 text-[8px] ${dimText.includes('orange') ? 'bg-orange-950/30 border border-orange-900/40' : 'bg-blue-950/30 border border-blue-900/40'} hover:bg-white/10`}>
          <Fuel size={11} /> Fuel
        </button>
        <button className={`flex-1 flex items-center justify-center gap-1 rounded-sm py-1 text-[8px] ${dimText.includes('orange') ? 'bg-orange-950/30 border border-orange-900/40' : 'bg-blue-950/30 border border-blue-900/40'} hover:bg-white/10`}>
          <Coffee size={11} /> Food
        </button>
        <button className={`flex-1 flex items-center justify-center gap-1 rounded-sm py-1 text-[8px] ${dimText.includes('orange') ? 'bg-orange-950/30 border border-orange-900/40' : 'bg-blue-950/30 border border-blue-900/40'} hover:bg-white/10`}>
          <Zap size={11} /> Charge
        </button>
      </div>
    </div>
  );
}

/* ============================ PHONE ============================ */
function PhoneView({ accentText, dimText }: { accentText: string; dimText: string }) {
  const [dial, setDial] = useState('');
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [callName, setCallName] = useState('');

  const press = (d: string) => setDial(prev => prev.length < 12 ? prev + d : prev);
  const back = () => setDial(prev => prev.slice(0, -1));
  const call = () => {
    if (!dial) return;
    const contact = CONTACTS.find(c => c.number.replace(/\s/g, '').includes(dial.replace(/\s/g, '')));
    setCallName(contact ? contact.name : dial);
    setCallStatus('calling');
    setTimeout(() => setCallStatus('connected'), 2000);
  };
  const hangup = () => { setCallStatus('idle'); setDial(''); };

  if (callStatus !== 'idle') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${callStatus === 'calling' ? 'bg-amber-600/30 animate-pulse' : 'bg-green-600/30'}`}>
          <PhoneCall size={24} className={callStatus === 'calling' ? 'text-amber-400' : 'text-green-400'} />
        </div>
        <div className="text-sm font-bold">{callName}</div>
        <div className={`text-[9px] ${dimText}`}>{callStatus === 'calling' ? 'Calling...' : 'Connected'}</div>
        {callStatus === 'connected' && (
          <div className="flex gap-1 mt-1">
            <button className={`w-8 h-8 rounded-full ${dimText.includes('orange') ? 'bg-orange-950/40' : 'bg-blue-950/40'} flex items-center justify-center text-[8px]`}>MUTE</button>
            <button className={`w-8 h-8 rounded-full ${dimText.includes('orange') ? 'bg-orange-950/40' : 'bg-blue-950/40'} flex items-center justify-center text-[8px]`}>SPK</button>
          </div>
        )}
        <button onClick={hangup} className="mt-2 w-10 h-10 rounded-full bg-red-600/30 border border-red-600/50 flex items-center justify-center hover:bg-red-600/50">
          <PhoneCall size={18} className="text-red-400 rotate-[135deg]" />
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-1.5">
      <div className={`text-xs font-bold border-b ${dimText.includes('orange') ? 'border-orange-900/50' : 'border-blue-900/50'} pb-1`}>PHONE</div>

      {/* Dial display */}
      <div className={`rounded-sm px-2 py-1.5 text-center ${dimText.includes('orange') ? 'bg-orange-950/30' : 'bg-blue-950/30'}`}>
        <div className={`text-lg font-bold ${accentText}`}>{dial || '—'}</div>
      </div>

      {/* Contacts quick list */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
        <div className={`text-[8px] ${dimText} mb-0.5`}>CONTACTS</div>
        {CONTACTS.map(c => (
          <button key={c.id} onClick={() => { setDial(c.number.replace(/\s/g, '')); }} className="w-full text-left flex items-center gap-2 text-[9px] py-0.5 px-1 rounded-sm hover:bg-white/5">
            <PhoneIcon size={10} className={accentText} />
            <span className="flex-1 truncate font-bold">{c.name}</span>
            <span className={dimText}>{c.number}</span>
          </button>
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-1">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(k => (
          <button key={k} onClick={() => press(k)} className={`rounded-md py-1 text-sm font-bold ${dimText.includes('orange') ? 'bg-orange-950/30 border border-orange-900/40' : 'bg-blue-950/30 border border-blue-900/40'} hover:bg-white/10 ${accentText}`}>{k}</button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button onClick={call} className="w-10 h-10 rounded-full bg-green-600/30 border border-green-600/50 flex items-center justify-center hover:bg-green-600/50">
          <PhoneCall size={18} className="text-green-400" />
        </button>
        <button onClick={back} className={`w-8 h-8 rounded-full ${dimText.includes('orange') ? 'bg-orange-950/40' : 'bg-blue-950/40'} flex items-center justify-center hover:bg-white/10`}>
          <ChevronLeft size={14} className={accentText} />
        </button>
      </div>
    </div>
  );
}

/* ============================ VOICE ============================ */
function VoiceView({ accentText, dimText, onSetMode }: { accentText: string; dimText: string; onSetMode: (m: Mode) => void }) {
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const start = () => {
    setListening(true);
    setResult(null);
    setTimeout(() => {
      setListening(false);
      const commands = ['Playing Highway Lights', 'Navigating to Aldi Store', 'Calling Alice', 'Tuning to 92.4 FM'];
      const cmd = commands[Math.floor(Math.random() * commands.length)];
      setResult(cmd);
      if (cmd.includes('Playing')) onSetMode('media');
      else if (cmd.includes('Navigating')) onSetMode('maps');
      else if (cmd.includes('Calling')) onSetMode('phone');
      else onSetMode('radio');
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <div className="relative">
        {listening && (
          <>
            <div className="absolute inset-0 rounded-full bg-amber-400/30 animate-[pulse-ring_1.5s_ease-out_infinite]" />
            <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-[pulse-ring_1.5s_ease-out_infinite_0.5s]" />
          </>
        )}
        <button onClick={start} className={`relative w-16 h-16 rounded-full flex items-center justify-center ${listening ? 'bg-amber-500/30 border-amber-400' : 'bg-white/10 border-white/20'} border-2`}>
          <Mic size={28} className={listening ? 'text-amber-400' : accentText} />
        </button>
      </div>

      {listening ? (
        <>
          <div className="flex items-end gap-1 h-6">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-1 bg-amber-400 rounded-full animate-[voice-wave_0.5s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <div className="text-[10px] text-amber-400">Listening...</div>
        </>
      ) : result ? (
        <div className="text-center">
          <div className={`text-xs font-bold ${accentText}`}>{result}</div>
          <div className={`text-[8px] ${dimText} mt-1`}>Redirecting...</div>
        </div>
      ) : (
        <div className="text-center">
          <div className={`text-[10px] ${accentText} font-bold`}>Tap to speak</div>
          <div className={`text-[8px] ${dimText} mt-1`}>"Play music" · "Navigate" · "Call Alice"</div>
        </div>
      )}
    </div>
  );
}

/* ============================ BLUETOOTH ============================ */
function BluetoothView({ accentText }: { accentText: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2">
      <Bluetooth size={24} className="text-blue-400 animate-pulse" />
      <div className="text-xs">ALDI-BT-200</div>
      <div className={`text-[9px] ${accentText.includes('orange') ? 'text-orange-600' : 'text-blue-600'}`}>Connected · No audio</div>
    </div>
  );
}

/* ============================ AUX ============================ */
function AuxView({ accentText }: { accentText: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2">
      <Plug size={24} className={accentText} />
      <div className="text-xs">AUX IN</div>
      <div className={`text-[9px] ${accentText.includes('orange') ? 'text-orange-600' : 'text-blue-600'}`}>Plug in a device</div>
    </div>
  );
}

/* ============================ EQ ============================ */
function EqView(props: any) {
  const { eqPreset, eqBands, onCycleEqPreset, onSetEqBand, accentText, dimText } = props;
  const barColor = accentText.includes('orange') ? 'bg-orange-400' : accentText.includes('blue') ? 'bg-blue-400' : 'bg-green-400';
  const barBg = accentText.includes('orange') ? 'bg-orange-950/60' : accentText.includes('blue') ? 'bg-blue-950/60' : 'bg-green-950/60';
  return (
    <div className="h-full flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold">EQUALIZER</span>
        <button onClick={onCycleEqPreset} className={`text-[10px] px-1.5 py-0.5 border ${accentText.includes('orange') ? 'border-orange-700' : 'border-blue-700'} rounded-sm hover:bg-white/10`}>{eqPreset.name} ⟳</button>
      </div>
      <div className="flex-1 flex items-end justify-between gap-1 px-1">
        {EQ_BANDS.map((label, i) => {
          const v = eqBands[i] ?? 0;
          const h = ((v + 6) / 12) * 100;
          return (
            <div key={label} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
              <div className={`text-[7px] ${dimText}`}>{v > 0 ? `+${v}` : v}</div>
              <div className={`relative w-2 flex-1 ${barBg} rounded-full overflow-hidden flex flex-col-reverse`}>
                <div className={`w-full rounded-full ${v >= 0 ? barColor : 'bg-amber-500'}`} style={{ height: `${Math.max(h, 4)}%` }} />
              </div>
              <div className={`text-[7px] ${dimText}`}>{label}</div>
              <div className="flex flex-col">
                <button onClick={() => onSetEqBand(i, Math.min(6, v + 1))} className="text-[8px] hover:text-amber-300">+</button>
                <button onClick={() => onSetEqBand(i, Math.max(-6, v - 1))} className="text-[8px] hover:text-amber-300">−</button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 flex-wrap">
        {EQ_PRESETS.map(p => (
          <span key={p.id} className={`text-[7px] px-1 py-0.5 rounded-sm ${p.id === eqPreset.id ? (accentText.includes('orange') ? 'bg-orange-800 text-orange-200' : 'bg-blue-800 text-blue-200') : dimText}`}>{p.name}</span>
        ))}
      </div>
    </div>
  );
}

/* ============================ SETTINGS ============================ */
function SettingsView(props: any) {
  const { settings, onUpdateSettings, onCycleEqPreset, eqPreset, clock, accentText, dimText } = props;
  return (
    <div className="h-full flex flex-col gap-1.5 text-[10px] overflow-y-auto scrollbar-none">
      <div className={`text-xs font-bold border-b ${dimText.includes('orange') ? 'border-orange-900/50' : 'border-blue-900/50'} pb-0.5`}>SETTINGS</div>

      {/* Brightness */}
      <div className="flex items-center justify-between">
        <span className={dimText + ' flex items-center gap-1'}><Sun size={11} /> Brightness</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onUpdateSettings({ brightness: Math.max(20, settings.brightness - 10) })} className={`w-5 h-5 rounded ${dimText.includes('orange') ? 'bg-orange-950/40' : 'bg-blue-950/40'} flex items-center justify-center`}><Minus size={10} /></button>
          <div className={`w-16 h-1.5 ${dimText.includes('orange') ? 'bg-orange-950/60' : 'bg-blue-950/60'} rounded-full overflow-hidden`}>
            <div className="h-full bg-amber-400" style={{ width: `${settings.brightness}%` }} />
          </div>
          <button onClick={() => onUpdateSettings({ brightness: Math.min(100, settings.brightness + 10) })} className={`w-5 h-5 rounded ${dimText.includes('orange') ? 'bg-orange-950/40' : 'bg-blue-950/40'} flex items-center justify-center`}><Plus size={10} /></button>
        </div>
      </div>

      {/* EQ Preset */}
      <div className="flex justify-between">
        <span className={dimText}>EQ Preset</span>
        <button onClick={onCycleEqPreset} className={accentText + ' hover:text-amber-300'}>{eqPreset.name} ⟳</button>
      </div>

      {/* Theme selector */}
      <div className="flex items-center justify-between">
        <span className={dimText}>Theme</span>
        <div className="flex gap-1">
          {(['orange', 'blue', 'green'] as const).map(t => (
            <button key={t} onClick={() => onUpdateSettings({ theme: t })} className={`w-5 h-5 rounded-full border-2 ${settings.theme === t ? 'border-white' : 'border-transparent'}`} style={{ background: t === 'orange' ? '#ea580c' : t === 'blue' ? '#3b82f6' : '#22c55e' }} />
          ))}
        </div>
      </div>

      {/* Clock format */}
      <div className="flex items-center justify-between">
        <span className={dimText + ' flex items-center gap-1'}><ClockIcon size={11} /> Clock Format</span>
        <div className="flex gap-1">
          {(['24h', '12h'] as const).map(f => (
            <button key={f} onClick={() => onUpdateSettings({ clockFormat: f })} className={`px-1.5 py-0.5 rounded-sm text-[8px] ${settings.clockFormat === f ? (accentText.includes('orange') ? 'bg-orange-800 text-orange-200' : 'bg-blue-800 text-blue-200') : dimText + ' bg-white/5'}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      {[
        { key: 'loudness', label: 'Loudness' },
        { key: 'autoDim', label: 'Auto Dim' },
        { key: 'fadeOut', label: 'Fade Out' },
      ].map(item => (
        <div key={item.key} className="flex items-center justify-between">
          <span className={dimText}>{item.label}</span>
          <button
            onClick={() => onUpdateSettings({ [item.key]: !settings[item.key] })}
            className={`w-8 h-4 rounded-full transition-colors ${(settings as any)[item.key] ? 'bg-amber-500/40' : 'bg-gray-700'}`}
          >
            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${(settings as any)[item.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
        </div>
      ))}

      {/* Balance / Fader sliders */}
      <div className="flex items-center justify-between">
        <span className={dimText + ' flex items-center gap-1'}><Volume2 size={11} /> Balance</span>
        <input type="range" min={-10} max={10} value={settings.balance} onChange={e => onUpdateSettings({ balance: Number(e.target.value) })} className="w-20 h-1 accent-amber-500 cursor-pointer" />
      </div>
      <div className="flex items-center justify-between">
        <span className={dimText}>Fader</span>
        <input type="range" min={-10} max={10} value={settings.fader} onChange={e => onUpdateSettings({ fader: Number(e.target.value) })} className="w-20 h-1 accent-amber-500 cursor-pointer" />
      </div>

      <div className={`mt-auto text-[7px] ${dimText.includes('orange') ? 'text-orange-900' : 'text-blue-900'}`}>ALDI BAUHN ACDV-0621 · v2.0.1</div>
    </div>
  );
}

/* ============================ CLOCK ============================ */
function ClockView({ clock, accentText, dimText }: { clock: string; accentText: string; dimText: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-1">
      <div className="text-3xl font-bold tracking-wider">{clock}</div>
      <div className={`text-[9px] ${dimText}`}>CLOCK</div>
    </div>
  );
}

