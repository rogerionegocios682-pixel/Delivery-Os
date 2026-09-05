import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Bike,
  CalendarClock,
  Send,
  MapPin,
  Navigation,
  MessageSquare,
  Wallet,
  BarChart3,
  UserCheck,
  ShieldCheck,
  Settings,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isMaster } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Operacional', icon: LayoutDashboard },
    { id: 'orders', label: 'Central de Corridas', icon: ShoppingBag },
    { id: 'drivers', label: 'Motoboys / Frota', icon: Bike },
    { id: 'dispatch', label: 'Despacho & Expedição', icon: Send },
    { id: 'routes', label: 'Roteirização', icon: MapPin },
    { id: 'tracking', label: 'Rastreamento GPS', icon: Navigation },
    { id: 'shifts', label: 'Escalas de Plantão', icon: CalendarClock },
    { id: 'finance', label: 'Financeiro & Taxas', icon: Wallet },
    { id: 'reports', label: 'Ranking & Relatórios', icon: BarChart3 },
    { id: 'customers', label: 'Pontos & Clientes', icon: Users },
    { id: 'communication', label: 'Comunicação Interna', icon: MessageSquare },
    { id: 'users', label: 'Equipe & Permissões', icon: UserCheck },
    { id: 'security_tests', label: 'Testes de Isolamento', icon: ShieldCheck, highlight: true },
    { id: 'settings', label: 'Configurações da Loja', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-53px)]">
      <div className="p-3 space-y-1">
        {isMaster && (
          <div className="mb-3 pb-2 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('master')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'master'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Painel Master Global</span>
            </button>
          </div>
        )}

        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
          Gestão de Motoboys
        </div>

        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/10'
                  : item.highlight
                  ? 'text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.highlight && !isActive && (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded font-mono font-bold">
                  RLS
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tenancy Security Note Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 m-2 rounded-lg text-[11px] text-slate-400 leading-relaxed">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Isolamento RLS Ativo</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Todas as corridas e motoboys são confinados pelo <code className="text-emerald-300">store_id</code> da empresa.
        </p>
      </div>
    </aside>
  );
};
