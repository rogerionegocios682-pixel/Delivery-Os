import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { MapPin, Plus, Bike, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { DeliveryRoute } from '../types.ts';

export const RoutesView: React.FC = () => {
  const { fetchWithAuth, currentStore } = useAuth();
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const loadData = async () => {
    try {
      const [rRes, dRes, oRes] = await Promise.all([
        fetchWithAuth('/api/routes'),
        fetchWithAuth('/api/drivers'),
        fetchWithAuth('/api/orders'),
      ]);
      if (rRes.ok) setRoutes(await rRes.json());
      if (dRes.ok) setDrivers(await dRes.json());
      if (oRes.ok) setOrders(await oRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentStore?.id]);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/routes', {
        method: 'POST',
        body: JSON.stringify({
          name: routeName,
          driverId: selectedDriver || drivers[0]?.id,
          orderIds: selectedOrders,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setRouteName('');
        setSelectedOrders([]);
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Roteirização Inteligente</h1>
          <p className="text-xs text-slate-400">Agrupamento de entregas por proximidade e otimização de rotas</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Rota</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map(r => (
          <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 bg-slate-800 px-2 py-0.5 rounded">
                  {r.id}
                </span>
                <h3 className="text-sm font-bold text-white mt-1">{r.name}</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {r.status}
              </span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Entregador Responsável:</span>
                <span className="text-slate-200 font-medium">
                  {drivers.find(d => d.id === r.driverId)?.name || 'Lucas Gabriel'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Paradas de Entrega:</span>
                <span className="text-slate-200 font-bold font-mono">{r.totalOrders || 1} paradas</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tempo Estimado:</span>
                <span className="text-emerald-400 font-bold font-mono">~{r.estimatedTimeMin || 25} minutos</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Criar Nova Rota de Entrega</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateRoute} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nome da Rota</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rota Centro / Consolação"
                  value={routeName}
                  onChange={e => setRouteName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Entregador</label>
                <select
                  value={selectedDriver}
                  onChange={e => setSelectedDriver(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Selecione os Pedidos para a Rota</label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 border border-slate-800 p-2 rounded-lg">
                  {orders.map(o => (
                    <label key={o.id} className="flex items-center gap-2 p-1 hover:bg-slate-800 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(o.id)}
                        onChange={e => {
                          if (e.target.checked) setSelectedOrders([...selectedOrders, o.id]);
                          else setSelectedOrders(selectedOrders.filter(id => id !== o.id));
                        }}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      <span className="font-mono font-bold text-white">#{o.id.slice(-6)}</span>
                      <span className="text-slate-400 truncate text-[11px]">{o.address}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold"
                >
                  Salvar Rota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
