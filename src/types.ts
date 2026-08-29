export type Source = 'radio' | 'media' | 'cd' | 'carplay' | 'aux' | 'bluetooth';

export type Mode = Source | 'home' | 'library' | 'maps' | 'phone' | 'voice' | 'eq' | 'settings' | 'clock';

export interface RadioStation {
  id: string;
  freq: number;
  name: string;
  tagline: string;
  streamUrl?: string;
  genre?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover: string;
  url?: string;
  isUploaded?: boolean;
}

export interface EqPreset {
  id: string;
  name: string;
  bands: number[];
}

export interface SettingsState {
  brightness: number;
  loudness: boolean;
  balance: number;
  fader: number;
  autoDim: boolean;
  fadeOut: boolean;
  clockFormat: '24h' | '12h';
  theme: 'orange' | 'blue' | 'green';
}

export const DEFAULT_SETTINGS: SettingsState = {
  brightness: 80,
  loudness: true,
  balance: 0,
  fader: 0,
  autoDim: true,
  fadeOut: true,
  clockFormat: '24h',
  theme: 'orange',
};

export const EQ_PRESETS: EqPreset[] = [
  { id: 'flat', name: 'Flat', bands: [0, 0, 0, 0, 0, 0] },
  { id: 'rock', name: 'Rock', bands: [4, 2, -1, 2, 4, 5] },
  { id: 'pop', name: 'Pop', bands: [-1, 2, 4, 3, 1, 0] },
  { id: 'bass', name: 'Bass Boost', bands: [6, 5, 3, 0, 0, 0] },
  { id: 'vocal', name: 'Vocal', bands: [-2, 0, 2, 4, 3, 1] },
];

export const EQ_BANDS = ['60', '150', '400', '1K', '2.4K', '8K'];

export const RADIO_STATIONS: RadioStation[] = [
  { id: 'r1', freq: 87.5, name: 'SomaFM Drone Zone', tagline: 'Served best chilled', genre: 'Ambient', streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3' },
  { id: 'r2', freq: 92.4, name: 'SomaFM Groove Salad', tagline: 'A nicely chilled plate', genre: 'Chillout', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3' },
  { id: 'r3', freq: 97.7, name: 'SomaFM Lush', tagline: 'Sensuous & mellow vocals', genre: 'Vocals', streamUrl: 'https://ice1.somafm.com/lush-128-mp3' },
  { id: 'r4', freq: 101.5, name: 'SomaFM Indie Pop Rocks', tagline: 'New & classic indie pop', genre: 'Indie', streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3' },
  { id: 'r5', freq: 106.3, name: 'SomaFM Beat Blender', tagline: 'Late night dub & electronica', genre: 'Electronic', streamUrl: 'https://ice1.somafm.com/beatblender-128-mp3' },
];

export const TRACKS: Track[] = [
  { id: 't1', title: 'Highway Lights', artist: 'The Wanderers', album: 'Open Road', duration: 0, cover: 'https://images.pexels.com/photos/27636187/pexels-photo-27636187.jpeg?auto=compress&cs=tinysrgb&h=300&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 't2', title: 'Silver Rain', artist: 'Marlow', album: 'Quiet Sky', duration: 0, cover: 'https://images.pexels.com/photos/12813579/pexels-photo-12813579.jpeg?auto=compress&cs=tinysrgb&h=300&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 't3', title: 'Desert Mile', artist: 'Cobalt Drive', album: 'Mile Marker 7', duration: 0, cover: 'https://images.pexels.com/photos/9778633/pexels-photo-9778633.jpeg?auto=compress&cs=tinysrgb&h=300&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 't4', title: 'Nightbird', artist: 'Eloise Ray', album: 'Afterglow', duration: 0, cover: 'https://images.pexels.com/photos/6842724/pexels-photo-6842724.jpeg?auto=compress&cs=tinysrgb&h=300&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 't5', title: 'Engine Hum', artist: 'Static Parade', album: 'Garage Days', duration: 0, cover: 'https://images.pexels.com/photos/2381872/pexels-photo-2381872.jpeg?auto=compress&cs=tinysrgb&h=300&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
];

export const CD_DISC: Track[] = [
  { id: 'cd1', title: 'Open Road', artist: 'The Wanderers', album: 'Open Road', duration: 0, cover: 'https://images.pexels.com/photos/30450142/pexels-photo-30450142.jpeg?auto=compress&cs=tinysrgb&h=300&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  { id: 'cd2', title: 'Quiet Sky', artist: 'Marlow', album: 'Quiet Sky', duration: 0, cover: 'https://images.pexels.com/photos/9441530/pexels-photo-9441530.jpeg?auto=compress&cs=tinysrgb&h=300&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
  { id: 'cd3', title: 'Mile 7', artist: 'Cobalt Drive', album: 'Mile Marker 7', duration: 0, cover: 'https://images.pexels.com/photos/11903171/pexels-photo-11903171.jpeg?auto=compress&cs=tinysrgb&h=300&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
  { id: 'cd4', title: 'Afterglow', artist: 'Eloise Ray', album: 'Afterglow', duration: 0, cover: 'https://images.pexels.com/photos/36652168/pexels-photo-36652168.jpeg?auto=compress&cs=tinysrgb&h=300&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
];

export const CONTACTS = [
  { id: 'c1', name: 'Alice', number: '0401 234 567' },
  { id: 'c2', name: 'Bob', number: '0412 345 678' },
  { id: 'c3', name: 'Mum', number: '0423 456 789' },
  { id: 'c4', name: 'Roadside', number: '131 111' },
  { id: 'c5', name: 'Work', number: '03 9876 5432' },
];

export const MAP_DESTINATIONS = [
  { id: 'd1', name: 'Home', address: '12 Wattle St, Melbourne', distance: '5.2 km', eta: '14 min' },
  { id: 'd2', name: 'Aldi Store', address: '45 Market Rd, Box Hill', distance: '8.7 km', eta: '22 min' },
  { id: 'd3', name: 'Fuel Station', address: 'Shell, 78 Burwood Hwy', distance: '2.1 km', eta: '6 min' },
  { id: 'd4', name: 'Airport', address: 'Melbourne Tullamarine', distance: '23.4 km', eta: '31 min' },
];
