import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ShieldCheck, Store, User, LogOut, ChevronDown, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    currentStore,
    availableProfiles,
    isMaster,
    masterTargetStoreId,
    switchPersona,
    exitMasterStoreContext,
  } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding and Company Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-xl tracking-tight shadow-md shadow-emerald-500/20">
              D
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider text-white">DELIVERY<span className="text-emerald-400">OS</span></span>
                <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 font-semibold px-1.5 py-0.5 rounded">SaaS Multi-Tenant</span>
              </div>
              <p className="text-[11px] text-slate-400">PostgreSQL • RLS • Realtime</p>
            </div>
          </div>

          <div className="hidden md:block h-6 w-px bg-slate-800" />

          {/* Current Store Context */}
          {currentStore && (
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
              {currentStore.logoUrl ? (
                <img
                  src={currentStore.logoUrl}
                  alt={currentStore.name}
                  className="w-5 h-5 rounded object-cover border border-slate-700 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Store className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <div>
                <span className="font-semibold text-slate-200">{currentStore.name}</span>
                <span className="text-slate-400 ml-1.5 text-[11px] font-mono">[{currentStore.id}]</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" title="Loja Ativa" />
            </div>
          )}

          {masterTargetStoreId && (
            <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-600/60 text-amber-300 px-3 py-1 rounded-md text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Sessão Auditada de Master</span>
              <button
                onClick={exitMasterStoreContext}
                className="ml-2 hover:bg-amber-900/60 px-1.5 py-0.5 rounded text-[11px] font-medium border border-amber-500/40"
              >
                Sair da Empresa
              </button>
            </div>
          )}
        </div>

        {/* Right: Security Badge, Persona Switcher & Controls */}
        <div className="flex items-center gap-3">
          {/* Realtime database status */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL Conectado</span>
          </div>

          {/* Quick trigger for security tests */}
          <button
            onClick={() => setActiveTab('security_tests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeTab === 'security_tests'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Testes de Isolamento</span>
          </button>

          {/* Master Mode button if applicable */}
          {isMaster && (
            <button
              onClick={() => setActiveTab('master')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeTab === 'master'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              Área Master Global
            </button>
          )}

          {/* Persona Switcher Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-750 transition-colors">
              <div className="w-6 h-6 rounded-full bg-slate-700 text-emerald-300 flex items-center justify-center text-xs font-bold">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-left text-xs leading-tight">
                <p className="font-semibold text-slate-100 flex items-center gap-1">
                  {currentUser?.name || 'Carregando...'}
                </p>
                <p className="text-[10px] text-emerald-400 font-mono">{currentUser?.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Dropdown Options */}
            <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
              <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Simular Usuário / Empresa
              </div>

              <div className="text-[10px] text-slate-500 px-2 pt-1 font-mono">Empresa A (Pizzaria)</div>
              {availableProfiles
                .filter(p => ['user_rogerio', 'user_joao', 'user_maria'].includes(p.id))
                .map(p => (
                  <button
                    key={p.id}
                    onClick={() => switchPersona(p.email)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                      currentUser?.email === p.email ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{p.role}</span>
                  </button>
                ))}

              <div className="text-[10px] text-slate-500 px-2 pt-2 border-t border-slate-800 mt-1 font-mono">Empresa B (Burgers)</div>
              {availableProfiles
                .filter(p => ['user_carlos', 'user_pedro', 'user_ana'].includes(p.id))
                .map(p => (
                  <button
                    key={p.id}
                    onClick={() => switchPersona(p.email)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                      currentUser?.email === p.email ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{p.role}</span>
                  </button>
                ))}

              <div className="text-[10px] text-slate-500 px-2 pt-2 border-t border-slate-800 mt-1 font-mono">Global / Plataforma</div>
              {availableProfiles
                .filter(p => p.role === 'MASTER')
                .map(p => (
                  <button
                    key={p.id}
                    onClick={() => switchPersona(p.email)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between hover:bg-amber-950/40 text-amber-300 ${
                      currentUser?.email === p.email ? 'bg-amber-950/60 font-semibold' : ''
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] font-mono bg-amber-500/20 px-1 rounded">MASTER</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
