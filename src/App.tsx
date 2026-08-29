import CarStereo from './components/CarStereo';

function App() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-amber-900/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-orange-800/8 blur-[100px] rounded-full" />
      </div>

      {/* Full screen dashboard frame */}
      <div className="relative z-10 flex-1 min-h-0 p-3 sm:p-4 lg:p-6 flex flex-col">
        {/* Dashboard bezel */}
        <div className="relative flex-1 min-h-0 rounded-[24px] bg-gradient-to-b from-[#2a2218] to-[#181410] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-amber-900/20 overflow-hidden flex flex-col">
          {/* Texture */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[24px] opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 70% 60%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px, 60px 60px' }}
          />

          {/* Top accent strip with vents */}
          <div className="flex justify-between items-center px-4 py-2 border-b border-amber-900/15 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-20 h-1.5 rounded-full bg-black/60" />
              <div className="w-20 h-1.5 rounded-full bg-black/60" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest font-bold text-amber-600">ALDI AUTO</span>
              <div className="w-1 h-1 rounded-full bg-amber-600/50" />
            </div>
            <div className="flex gap-1.5">
              <div className="w-20 h-1.5 rounded-full bg-black/60" />
              <div className="w-20 h-1.5 rounded-full bg-black/60" />
            </div>
          </div>

          {/* The stereo unit fills remaining space */}
          <div className="flex-1 min-h-0 p-2 sm:p-3">
            <CarStereo />
          </div>

          {/* Bottom strip: hazard + gear selector + climate hint */}
          <div className="px-4 py-2 border-t border-amber-900/15 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-950/60 border border-red-900/40 flex items-center justify-center">
                <span className="text-red-600 text-[8px] font-bold">!</span>
              </div>
              <span className="text-[7px] text-gray-600 tracking-wider">HAZARD</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Climate indicator */}
              <div className="flex items-center gap-1 text-[7px] text-gray-600">
                <span className="text-blue-500">21°C</span>
                <span>·</span>
                <span>AUTO</span>
              </div>

              {/* Gear selector */}
              <div className="flex gap-1">
                {['P', 'R', 'N', 'D'].map((g, i) => (
                  <div
                    key={g}
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold transition-colors ${
                      i === 3 ? 'bg-amber-500/20 text-amber-400 border border-amber-700/50' : 'bg-black/40 text-gray-700'
                    }`}
                  >
                    {g}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
