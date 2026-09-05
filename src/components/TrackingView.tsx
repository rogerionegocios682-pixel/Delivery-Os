import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Navigation, Bike, MapPin, Radio, Compass, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

export const TrackingView: React.FC = () => {
  const { fetchWithAuth, currentStore } = useAuth();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [simulatedLat, setSimulatedLat] = useState<number>(-23.561684);
  const [simulatedLng, setSimulatedLng] = useState<number>(-46.655981);
  const [updating, setUpdating] = useState(false);

  const loadDrivers = async () => {
    try {
      const res = await fetchWithAuth('/api/drivers');
      if (res.ok) {
        const data = await res.json();
        setDrivers(data);
        if (!selectedDriver && data.length > 0) {
          setSelectedDriver(data[0]);
          if (data[0].location) {
            setSimulatedLat(Number(data[0].location.latitude));
            setSimulatedLng(Number(data[0].location.longitude));
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDrivers();
    const interval = setInterval(loadDrivers, 8000);
    return () => clearInterval(interval);
  }, [currentStore?.id]);

  const sendGpsPing = async (deltaLat = 0.001, deltaLng = 0.001) => {
    if (!selectedDriver) return;
    setUpdating(true);
    const newLat = simulatedLat + deltaLat;
    const newLng = simulatedLng + deltaLng;
    setSimulatedLat(newLat);
    setSimulatedLng(newLng);

    try {
      await fetchWithAuth('/api/tracking/update-location', {
        method: 'POST',
        body: JSON.stringify({
          driverId: selectedDriver.id,
          latitude: newLat,
          longitude: newLng,
          accuracy: 5.2,
        }),
      });
      await loadDrivers();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Rastreamento GPS em Tempo Real</h1>
          <p className="text-xs text-slate-400">Telemetria de entregadores, rotas ativas e radar de geolocalização</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-emerald-400 font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>Telemetria Ativa • PostgreSQL GPS Feed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Visual Map Stage */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Radar Operacional da Região de Atendimento</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Raio: 8km • São Paulo</span>
          </div>

          {/* Map Canvas / Visual Radar Presentation */}
          <div className="w-full h-80 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center p-4">
            {/* Grid Lines */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute inset-0 border border-slate-800/60 rounded-xl pointer-events-none" />

            {/* Radar Sweep Animation */}
            <div className="absolute w-72 h-72 rounded-full border border-emerald-500/20 animate-ping opacity-20 pointer-events-none" />
            <div className="absolute w-44 h-44 rounded-full border border-emerald-500/30 pointer-events-none" />

            {/* Store Hub Center Marker */}
            <div className="absolute flex flex-col items-center z-20">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40 font-black text-xs border-2 border-white">
                HUB
              </div>
              <span className="text-[10px] font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded mt-1 border border-slate-700">
                {currentStore?.name}
              </span>
            </div>

            {/* Driver Marker Representation */}
            {drivers.map((d, idx) => {
              const offsets = [
                { top: '30%', left: '68%' },
                { top: '65%', left: '32%' },
                { top: '75%', left: '72%' },
              ];
              const pos = offsets[idx % offsets.length];
              const isSelected = selectedDriver?.id === d.id;

              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDriver(d)}
                  style={{ top: pos.top, left: pos.left }}
                  className={`absolute flex flex-col items-center cursor-pointer transition-all z-30 ${
                    isSelected ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-md ${
                    d.status === 'DELIVERING'
                      ? 'bg-cyan-500 text-slate-950 animate-pulse border-2 border-cyan-200'
                      : 'bg-slate-800 text-emerald-400 border border-slate-600'
                  }`}>
                    <Bike className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-200 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800 mt-1 whitespace-nowrap">
                    {d.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* GPS Telemetry Simulation Controls */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400">Entregador em Telemetria:</span>
              <p className="font-bold text-white text-sm">{selectedDriver?.name || 'Selecione um motorista'}</p>
              <p className="text-[11px] font-mono text-emerald-400">
                Lat: {simulatedLat.toFixed(6)} | Lng: {simulatedLng.toFixed(6)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => sendGpsPing(0.0012, 0.0008)}
                disabled={updating}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg font-medium transition"
              >
                + Deslocar Norte
              </button>
              <button
                onClick={() => sendGpsPing(-0.0008, 0.0014)}
                disabled={updating}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg font-medium transition"
              >
                + Deslocar Leste
              </button>
              <button
                onClick={() => sendGpsPing(0.0001, -0.001)}
                disabled={updating}
                className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition"
              >
                {updating ? 'Enviando...' : 'Enviar Pulso GPS'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Drivers List and Statuses */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-white">Status da Frota Conectada</h2>

          <div className="space-y-2.5">
            {drivers.map(d => (
              <div
                key={d.id}
                onClick={() => {
                  setSelectedDriver(d);
                  if (d.location) {
                    setSimulatedLat(Number(d.location.latitude));
                    setSimulatedLng(Number(d.location.longitude));
                  }
                }}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedDriver?.id === d.id
                    ? 'bg-slate-800/90 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="font-bold text-slate-200 text-xs">{d.name}</div>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    d.status === 'DELIVERING'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {d.status === 'DELIVERING' ? 'Em Rota' : 'Disponível'}
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-slate-400 space-y-0.5 font-mono">
                  <div>Veículo: {d.vehicleType.toUpperCase()} ({d.vehiclePlate || 'N/A'})</div>
                  <div>Taxa Base: R$ {Number(d.baseRate).toFixed(2)}</div>
                  {d.location && (
                    <div className="text-slate-500 text-[10px]">
                      Último ping: {new Date(d.location.timestamp || Date.now()).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
