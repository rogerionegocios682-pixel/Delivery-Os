import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Send, Bike, Package, Clock, CheckCircle2, AlertTriangle, Play, Sparkles } from 'lucide-react';

export const DispatchView: React.FC = () => {
  const { fetchWithAuth, currentStore } = useAuth();
  const [readyOrders, setReadyOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [selectedDriverForOrder, setSelectedDriverForOrder] = useState<{ [orderId: string]: string }>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, driversRes, dispRes] = await Promise.all([
        fetchWithAuth('/api/orders'),
        fetchWithAuth('/api/drivers'),
        fetchWithAuth('/api/dispatches'),
      ]);

      if (ordersRes.ok) {
        const allOrders = await ordersRes.json();
        setReadyOrders(allOrders.filter((o: any) => o.status === 'aguardando_despacho' || o.status === 'pronto'));
      }
      if (driversRes.ok) {
        setDrivers(await driversRes.json());
      }
      if (dispRes.ok) {
        setDispatches(await dispRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentStore?.id]);

  const handleDispatch = async (orderId: string) => {
    const driverId = selectedDriverForOrder[orderId] || drivers.find(d => d.status === 'AVAILABLE')?.id;
    if (!driverId) {
      alert('Nenhum entregador disponível selecionado.');
      return;
    }

    try {
      const res = await fetchWithAuth('/api/dispatches', {
        method: 'POST',
        body: JSON.stringify({ orderId, driverId }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error('Error dispatching:', e);
    }
  };

  const handleAutoDispatchAll = async () => {
    const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE');
    if (availableDrivers.length === 0) {
      alert('Nenhum entregador livre no momento.');
      return;
    }

    for (let i = 0; i < readyOrders.length; i++) {
      const order = readyOrders[i];
      const driver = availableDrivers[i % availableDrivers.length];
      await fetchWithAuth('/api/dispatches', {
        method: 'POST',
        body: JSON.stringify({ orderId: order.id, driverId: driver.id }),
      });
    }
    await loadData();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Mesa de Despacho & Expedição</h1>
          <p className="text-xs text-slate-400">Distribuição ágil de pedidos para os entregadores da frota</p>
        </div>

        <div>
          {readyOrders.length > 0 && (
            <button
              onClick={handleAutoDispatchAll}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition shadow-md shadow-purple-500/20"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Despacho Automático ({readyOrders.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Orders Ready for Delivery */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">
              Pedidos Prontos Aguardando Saída ({readyOrders.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Expedição da Cozinha</span>
        </div>

        {readyOrders.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-lg border border-slate-800/80">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-xs text-slate-300 font-medium">Nenhum pedido aguardando despacho no momento.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Novos pedidos finalizados na cozinha aparecerão automaticamente aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyOrders.map(order => (
              <div key={order.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-white text-sm">#{order.id.slice(-6)}</span>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    R$ {Number(order.total).toFixed(2)}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  <div className="font-medium text-slate-200">{order.address}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{order.phone}</div>
                  {order.notes && <div className="text-[10px] text-amber-400">Obs: {order.notes}</div>}
                </div>

                {/* Driver Selector & Dispatch Button */}
                <div className="flex items-center gap-2 pt-1">
                  <select
                    value={selectedDriverForOrder[order.id] || ''}
                    onChange={e => setSelectedDriverForOrder({ ...selectedDriverForOrder, [order.id]: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 p-2 rounded-lg"
                  >
                    <option value="">Selecione o Entregador</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.status === 'AVAILABLE' ? 'Livre' : 'Ocupado'})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleDispatch(order.id)}
                    className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs shrink-0 flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Despachar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dispatches History */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Histórico Recente de Despachos</h2>
          <span className="text-xs text-slate-400 font-mono">{dispatches.length} despachos registrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                <th className="pb-2.5">Horário</th>
                <th className="pb-2.5">Pedido</th>
                <th className="pb-2.5">Entregador Responsável</th>
                <th className="pb-2.5">Despachado Por</th>
                <th className="pb-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {dispatches.map(d => (
                <tr key={d.id} className="hover:bg-slate-850 transition">
                  <td className="py-2.5 font-mono text-[11px] text-slate-400">
                    {new Date(d.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 font-mono font-bold text-white">#{d.orderId.slice(-6)}</td>
                  <td className="py-2.5 font-medium text-slate-200">
                    {drivers.find(drv => drv.id === d.driverId)?.name || d.driverId}
                  </td>
                  <td className="py-2.5 text-slate-400">{d.dispatchedBy}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      d.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {d.status === 'completed' ? 'Entregue' : 'Em Trânsito'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
