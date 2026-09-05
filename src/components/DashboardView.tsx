import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  ShoppingBag,
  Bike,
  Send,
  Navigation,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Store,
  RefreshCw,
  Layers,
  MapPin,
  Users,
} from 'lucide-react';

interface DashboardStats {
  pedidosHoje: number;
  pendentes: number;
  preparando: number;
  aguardandoDespacho: number;
  emRota: number;
  entregues: number;
  cancelamentos: number;
  faturamento: number;
  ticketMedio: number;
  motoristasDisponiveis: number;
  motoristasEmRota: number;
  custosEntrega: number;
}

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { fetchWithAuth, currentStore, isMaster } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [statsRes, ordersRes, driversRes] = await Promise.all([
        fetchWithAuth('/api/dashboard/stats'),
        fetchWithAuth('/api/orders'),
        fetchWithAuth('/api/drivers'),
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        setRecentOrders(orders.slice(0, 7));
      }
      if (driversRes.ok) {
        const drvs = await driversRes.json();
        setDrivers(drvs);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadDashboardData();
  }, [currentStore?.id]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const totalDrivers = drivers.length;
  const availableDrivers = stats?.motoristasDisponiveis ?? drivers.filter(d => d.status === 'AVAILABLE').length;
  const deliveringDrivers = stats?.motoristasEmRota ?? drivers.filter(d => d.status === 'DELIVERING').length;
  const offlineDrivers = Math.max(0, totalDrivers - availableDrivers - deliveringDrivers);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-200">
      {/* Header com Boas-Vindas e Contexto Operacional */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div className="flex items-center gap-3.5">
          {currentStore?.logoUrl ? (
            <img
              src={currentStore.logoUrl}
              alt={currentStore.name}
              className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30 shadow-sm"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Store className="w-6 h-6 text-emerald-400" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {currentStore?.name || 'Central de Operações DeliveryOS'}
              </h1>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
                OPERACIONAL ATIVO
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestão centralizada de motoboys, expedição de pedidos e controle de taxas em tempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
          </button>
          <button
            onClick={() => onNavigate('dispatch')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition shadow-md shadow-emerald-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Mesa de Despacho</span>
          </button>
        </div>
      </div>

      {/* Alerta se houver pedidos aguardando despacho */}
      {Number(stats?.aguardandoDespacho || 0) > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-xl flex items-center justify-between gap-4 text-amber-200 text-xs shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-amber-300 text-sm">
                {stats?.aguardandoDespacho} {stats?.aguardandoDespacho === 1 ? 'pedido pronto aguardando' : 'pedidos prontos aguardando'} motoboy
              </p>
              <p className="text-amber-200/80 text-xs">
                Acesse a expedição para alocar os entregadores disponíveis da frota.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('dispatch')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs shrink-0 transition"
          >
            Despachar Agora
          </button>
        </div>
      )}

      {/* 4 Indicadores Operacionais Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Pedidos / Corridas Hoje */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Corridas Hoje</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {stats?.pedidosHoje ?? 0}
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> {stats?.entregues ?? 0} concluídas
            </span>
            <span className="text-slate-500">
              {stats?.emRota ?? 0} em rota
            </span>
          </div>
        </div>

        {/* 2. Frota Operacional em Campo */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Motoboys em Campo</span>
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {deliveringDrivers + availableDrivers} <span className="text-xs font-normal text-slate-400">/ {totalDrivers} cadastrados</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> {availableDrivers} disponíveis
            </span>
            <span className="text-blue-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> {deliveringDrivers} em rota
            </span>
          </div>
        </div>

        {/* 3. Taxas de Entrega / Custos */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Taxas da Frota</span>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300 tracking-tight font-mono">
            R$ {Number(stats?.custosEntrega ?? 0).toFixed(2).replace('.', ',')}
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80 text-slate-400">
            <span>Repasses de frete</span>
            <span className="text-amber-400 font-medium">Dia atual</span>
          </div>
        </div>

        {/* 4. Faturamento Bruto e Ticket Médio */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Faturamento Loja</span>
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight font-mono">
            R$ {Number(stats?.faturamento ?? 0).toFixed(2).replace('.', ',')}
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80 text-slate-400">
            <span>Ticket médio:</span>
            <span className="text-purple-300 font-mono font-medium">
              R$ {Number(stats?.ticketMedio ?? 0).toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>

      {/* Funil Operacional do Dia (Pipeline de Estados) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Pipeline Operacional de Pedidos & Despacho
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Fluxo em Tempo Real</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {/* 1. Pendente / Novo */}
          <div className="bg-slate-800/50 border border-slate-800 p-3 rounded-lg text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Pendentes / Novos</span>
            <p className="text-xl font-black text-slate-200">{stats?.pendentes ?? 0}</p>
            <span className="text-[10px] text-slate-500 block">Aguardando aceite</span>
          </div>

          {/* 2. Em Preparação */}
          <div className="bg-slate-800/50 border border-slate-800 p-3 rounded-lg text-center space-y-1">
            <span className="text-[11px] text-blue-400 font-medium">Em Preparação</span>
            <p className="text-xl font-black text-blue-300">{stats?.preparando ?? 0}</p>
            <span className="text-[10px] text-slate-500 block">Cozinha / Separação</span>
          </div>

          {/* 3. Aguardando Despacho */}
          <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-lg text-center space-y-1">
            <span className="text-[11px] text-amber-400 font-medium">Pronto / Despacho</span>
            <p className="text-xl font-black text-amber-300">{stats?.aguardandoDespacho ?? 0}</p>
            <span className="text-[10px] text-amber-300/80 block font-semibold">Chamar motoboy</span>
          </div>

          {/* 4. Em Rota */}
          <div className="bg-indigo-950/20 border border-indigo-500/30 p-3 rounded-lg text-center space-y-1">
            <span className="text-[11px] text-indigo-400 font-medium">Em Rota de Entrega</span>
            <p className="text-xl font-black text-indigo-300">{stats?.emRota ?? 0}</p>
            <span className="text-[10px] text-indigo-300/80 block">Com o motoboy</span>
          </div>

          {/* 5. Entregues */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-lg text-center space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-emerald-400 font-medium">Concluídos Hoje</span>
            <p className="text-xl font-black text-emerald-300">{stats?.entregues ?? 0}</p>
            <span className="text-[10px] text-emerald-400/80 block">Entregas finalizadas</span>
          </div>
        </div>
      </div>

      {/* Painel Central com Atalhos Operacionais e Últimas Corridas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Lado Esquerdo (7 cols): Últimas Corridas / Pedidos */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Últimas Corridas Registradas</h3>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2.5 px-2">Pedido</th>
                  <th className="pb-2.5 px-2">Destino / Bairro</th>
                  <th className="pb-2.5 px-2">Status</th>
                  <th className="pb-2.5 px-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      Nenhuma corrida registrada para hoje ainda.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-2 font-mono font-bold text-white">
                        #{order.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-2.5 px-2 text-slate-300">
                        <span className="truncate max-w-[150px] inline-block">
                          {order.customerAddress || 'Endereço Principal'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            order.status === 'entregue'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : order.status === 'em_rota'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : order.status === 'aguardando_despacho'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-200">
                        R$ {Number(order.total || 0).toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lado Direito (5 cols): Monitor Rápido da Frota & Atalhos Rápidos */}
        <div className="lg:col-span-5 space-y-4">
          {/* Status dos Entregadores */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Status da Frota</h3>
              </div>
              <button
                onClick={() => onNavigate('drivers')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition"
              >
                <span>Gerenciar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {drivers.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center">Nenhum motoboy cadastrado.</p>
              ) : (
                drivers.slice(0, 5).map(driver => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          driver.status === 'AVAILABLE'
                            ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                            : driver.status === 'DELIVERING'
                            ? 'bg-blue-400 shadow-sm shadow-blue-400/50'
                            : 'bg-slate-600'
                        }`}
                      />
                      <div>
                        <p className="font-bold text-white">{driver.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {driver.vehicleType || 'Moto'} • Taxa: R$ {Number(driver.baseRate || 8.5).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        driver.status === 'AVAILABLE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : driver.status === 'DELIVERING'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {driver.status === 'AVAILABLE' ? 'Disponível' : driver.status === 'DELIVERING' ? 'Em Rota' : 'Offline'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ações Rápidas de Navegação */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ações Rápidas do Sistema
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('orders')}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition text-left"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">Nova Corrida</span>
              </button>

              <button
                onClick={() => onNavigate('dispatch')}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition text-left"
              >
                <Send className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="font-semibold">Expedição</span>
              </button>

              <button
                onClick={() => onNavigate('tracking')}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition text-left"
              >
                <Navigation className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold">GPS da Frota</span>
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition text-left"
              >
                <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold">Relatórios</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
