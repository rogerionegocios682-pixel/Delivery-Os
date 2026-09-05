import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserCheck, Shield, Key, Check, X } from 'lucide-react';

export const UsersView: React.FC = () => {
  const { fetchWithAuth, currentStore } = useAuth();
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    fetchWithAuth('/api/users').then(r => r.json()).then(setTeam).catch(console.error);
  }, [currentStore?.id]);

  const permissionMatrix = [
    { module: 'Pedidos', perm: 'Criar e editar pedidos', admin: true, gerente: true, vendedor: true, caixa: false },
    { module: 'Pedidos', perm: 'Cancelar pedidos', admin: true, gerente: true, vendedor: false, caixa: false },
    { module: 'Despacho', perm: 'Despachar pedidos para entregadores', admin: true, gerente: true, vendedor: true, caixa: false },
    { module: 'Financeiro', perm: 'Abertura e sangria de caixa', admin: true, gerente: true, vendedor: false, caixa: true },
    { module: 'Financeiro', perm: 'Contas a pagar e despesas', admin: true, gerente: false, vendedor: false, caixa: false },
    { module: 'Entregadores', perm: 'Configurar taxas de entregadores', admin: true, gerente: true, vendedor: false, caixa: false },
    { module: 'Configurações', perm: 'Alterar dados da empresa e horários', admin: true, gerente: false, vendedor: false, caixa: false },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Equipe & Matriz de Permissões</h1>
          <p className="text-xs text-slate-400">Controle de acessos baseado em perfis (RBAC) com isolamento por loja</p>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Colaboradores da Empresa ({currentStore?.name})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                <th className="pb-2.5">Nome</th>
                <th className="pb-2.5">E-mail</th>
                <th className="pb-2.5">Perfil de Acesso</th>
                <th className="pb-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {team.map(m => (
                <tr key={m.id} className="hover:bg-slate-850 transition">
                  <td className="py-3 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {m.name.charAt(0)}
                      </div>
                      <span>{m.name}</span>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-slate-400">{m.email}</td>
                  <td className="py-3">
                    <span className="bg-slate-800 border border-slate-700 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-emerald-400 font-medium text-[11px]">Ativo</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Matriz de Autorização por Perfil</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                <th className="pb-2.5">Módulo</th>
                <th className="pb-2.5">Permissão</th>
                <th className="pb-2.5 text-center">ADMIN</th>
                <th className="pb-2.5 text-center">GERENTE</th>
                <th className="pb-2.5 text-center">VENDEDOR</th>
                <th className="pb-2.5 text-center">CAIXA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {permissionMatrix.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-850 transition">
                  <td className="py-2.5 font-bold text-slate-400 font-mono text-[11px]">{p.module}</td>
                  <td className="py-2.5 text-slate-200">{p.perm}</td>
                  <td className="py-2.5 text-center">
                    {p.admin ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="py-2.5 text-center">
                    {p.gerente ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="py-2.5 text-center">
                    {p.vendedor ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="py-2.5 text-center">
                    {p.caixa ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
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
