import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Store, ShieldAlert, Building2, Users, ShoppingBag, DollarSign, ArrowRight, Ban, CheckCircle, Search, Eye } from 'lucide-react';

interface MasterDashboardViewProps {
  onAccessStore: (storeId: string) => void;
}

export const MasterDashboardView: React.FC<MasterDashboardViewProps> = ({ onAccessStore }) => {
  const { fetchWithAuth, accessStoreAsMaster } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingStoreId, setProcessingStoreId] = useState<string | null>(null);

  const loadMasterData = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/master/dashboard');
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Error loading master dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const handleAccessStore = async (storeId: string) => {
    setProcessingStoreId(storeId);
    await accessStoreAsMaster(storeId);
    onAccessStore(storeId);
    setProcessingStoreId(null);
  };

  const handleToggleStatus = async (storeId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await fetchWithAuth('/api/master/toggle-store-status', {
        method: 'POST',
        body: JSON.stringify({ storeId, status: nextStatus }),
      });
      if (res.ok) {
        await loadMasterData();
      }
    } catch (err) {
      console.error('Error toggling store status:', err);
    }
  };

  const filteredStores = data?.stores?.filter((s: any) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.cnpj && s.cnpj.includes(searchTerm))
  ) || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Master Warning / Privilege Header */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-600/40 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Painel Global Master • Plataforma DeliveryOS</span>
            </div>
            <h1 className="text-xl font-black text-white">Controle Central Multi-Empresa</h1>
            <p className="text-xs text-slate-400">
              O MASTER é a única função global autorizada a auditar e operar entre empresas. Toda transação gera registro criptográfico na tabela <code className="text-amber-300 font-mono">audit_logs</code>.
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-400">Acesso Restrito:</span>
            <div className="font-mono font-bold text-amber-400 text-sm">PRIVILEGED_AUDIT_MODE</div>
          </div>
        </div>
      </div>

      {/* Global SaaS KPIs */}
      {data?.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>EMPRESAS ATIVAS</span>
            </div>
            <p className="text-2xl font-black text-white">{data.metrics.activeStores}</p>
            <span className="text-[11px] text-slate-500">Operando normalmente</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-1">
              <Ban className="w-4 h-4" />
              <span>BLOQUEADAS</span>
            </div>
            <p className="text-2xl font-black text-white">{data.metrics.blockedStores}</p>
            <span className="text-[11px] text-slate-500">Inadimplentes / suspensas</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Building2 className="w-4 h-4" />
              <span>PENDENTES</span>
            </div>
            <p className="text-2xl font-black text-white">{data.metrics.pendingStores}</p>
            <span className="text-[11px] text-slate-500">Aguardando ativação</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
              <Users className="w-4 h-4" />
              <span>USUÁRIOS</span>
            </div>
            <p className="text-2xl font-black text-white">{data.metrics.totalUsers}</p>
            <span className="text-[11px] text-slate-500">Em todas as empresas</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
              <ShoppingBag className="w-4 h-4" />
              <span>TOTAL PEDIDOS</span>
            </div>
            <p className="text-2xl font-black text-white">{data.metrics.totalOrders}</p>
            <span className="text-[11px] text-slate-500">Volume na plataforma</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span>FATURAMENTO</span>
            </div>
            <p className="text-2xl font-black text-white">
              R$ {Number(data.metrics.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-slate-500">GMV acumulado</span>
          </div>
        </div>
      )}

      {/* Companies List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Empresas Cadastradas na Plataforma</h2>
            <p className="text-xs text-slate-400">Controle de ativação, planos e entrada auditada por empresa</p>
          </div>

          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ ou ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                <th className="pb-3">Empresa</th>
                <th className="pb-3">Identificador / CNPJ</th>
                <th className="pb-3">Contato</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Ações Master</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredStores.map((store: any) => (
                <tr key={store.id} className="hover:bg-slate-850 transition">
                  <td className="py-3 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-amber-400">
                        {store.name.charAt(0)}
                      </div>
                      <span>{store.name}</span>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-400">
                    <div>{store.id}</div>
                    <div className="text-slate-500 text-[10px]">{store.cnpj || 'Sem CNPJ'}</div>
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">
                    <div>{store.phone || '-'}</div>
                    <div className="text-slate-500">{store.email || '-'}</div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      store.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {store.status === 'active' ? 'Ativa' : 'Bloqueada'}
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(store.id, store.status)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border transition ${
                        store.status === 'active'
                          ? 'text-rose-400 hover:bg-rose-950/40 border-rose-600/30'
                          : 'text-emerald-400 hover:bg-emerald-950/40 border-emerald-600/30'
                      }`}
                    >
                      {store.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                    </button>

                    <button
                      onClick={() => handleAccessStore(store.id)}
                      disabled={processingStoreId === store.id}
                      className="bg-amber-500 hover:bg-amber-450 text-slate-950 px-3 py-1 rounded text-[11px] font-bold transition inline-flex items-center gap-1.5 shadow-sm shadow-amber-500/20 disabled:opacity-50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{processingStoreId === store.id ? 'Auditando...' : 'ACESSAR EMPRESA'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
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
