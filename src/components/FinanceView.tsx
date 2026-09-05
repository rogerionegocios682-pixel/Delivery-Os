import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Wallet, DollarSign, ArrowUpRight, ArrowDownLeft, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export const FinanceView: React.FC = () => {
  const { fetchWithAuth, currentStore } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  const [movementForm, setMovementForm] = useState({
    type: 'sangria',
    amount: '',
    description: '',
    paymentMethod: 'dinheiro',
  });

  const loadFinance = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/finance');
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinance();
  }, [currentStore?.id]);

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/finance/cash-movement', {
        method: 'POST',
        body: JSON.stringify(movementForm),
      });
      if (res.ok) {
        setIsMovementModalOpen(false);
        setMovementForm({ type: 'sangria', amount: '', description: '', paymentMethod: 'dinheiro' });
        await loadFinance();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const cashMovements = data?.cashMovements || [];
  const accountsPayable = data?.accountsPayable || [];
  const accountsReceivable = data?.accountsReceivable || [];
  const driverPayments = data?.driverPayments || [];

  const totalInflows = cashMovements
    .filter((m: any) => m.type === 'inflow' || m.type === 'suprimento')
    .reduce((sum: number, m: any) => sum + Number(m.amount || 0), 0);

  const totalOutflows = cashMovements
    .filter((m: any) => m.type === 'outflow' || m.type === 'sangria')
    .reduce((sum: number, m: any) => sum + Number(m.amount || 0), 0);

  const currentCashBalance = totalInflows - totalOutflows;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Financeiro, Caixa & Repasses</h1>
          <p className="text-xs text-slate-400">Controle de caixa diário, sangrias, contas a pagar e repasses a entregadores</p>
        </div>

        <button
          onClick={() => setIsMovementModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar no Caixa (Sangria/Suprimento)</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Saldo em Caixa Hoje</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            R$ {currentCashBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-500">Aberto por Maria • Operando</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Contas a Pagar (Pendentes)</span>
            <ArrowDownLeft className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 font-mono">
            R$ {accountsPayable.reduce((s: number, a: any) => s + Number(a.amount || 0), 0).toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-500">{accountsPayable.length} lançamentos de fornecedores</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Repasses a Entregadores</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400 font-mono">
            R$ {driverPayments.reduce((s: number, d: any) => s + Number(d.totalAmount || 0), 0).toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-500">Taxas e corridas acumuladas</span>
        </div>
      </div>

      {/* Cash Movements Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Movimentações de Caixa do Turno</h2>
          <span className="text-xs text-slate-400 font-mono">{cashMovements.length} transações</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                <th className="pb-2.5">Horário</th>
                <th className="pb-2.5">Tipo</th>
                <th className="pb-2.5">Descrição</th>
                <th className="pb-2.5">Forma</th>
                <th className="pb-2.5 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {cashMovements.map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-850 transition">
                  <td className="py-2.5 font-mono text-[11px] text-slate-400">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      m.type === 'inflow' || m.type === 'suprimento'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-200">{m.description}</td>
                  <td className="py-2.5 uppercase font-mono text-[10px] text-slate-400">{m.paymentMethod || 'dinheiro'}</td>
                  <td className={`py-2.5 text-right font-mono font-bold ${
                    m.type === 'inflow' || m.type === 'suprimento' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {m.type === 'inflow' || m.type === 'suprimento' ? '+' : '-'} R$ {Number(m.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accounts Payable & Driver Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-white">Contas a Pagar / Insumos</h2>
          <div className="space-y-2">
            {accountsPayable.map((a: any) => (
              <div key={a.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-slate-200">{a.description}</p>
                  <p className="text-[10px] text-slate-400">Fornecedor: {a.supplier || 'Geral'} • Vencimento: {a.dueDate}</p>
                </div>
                <span className="font-mono font-bold text-rose-400">R$ {Number(a.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-white">Fechamento de Entregadores</h2>
          <div className="space-y-2">
            {driverPayments.map((dp: any) => (
              <div key={dp.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-slate-200">Período: {dp.periodStart} a {dp.periodEnd}</p>
                  <p className="text-[10px] text-slate-400">{dp.deliveriesCount} entregas realizadas</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400 block">R$ {Number(dp.totalAmount).toFixed(2)}</span>
                  <span className="text-[9px] font-bold uppercase text-slate-400">{dp.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Lançamento no Caixa</h3>
              <button onClick={() => setIsMovementModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateMovement} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Tipo de Movimentação</label>
                <select
                  value={movementForm.type}
                  onChange={e => setMovementForm({ ...movementForm, type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="sangria">Sangria (Retirada de Caixa)</option>
                  <option value="suprimento">Suprimento (Entrada de Troco)</option>
                  <option value="outflow">Despesa Geral</option>
                  <option value="inflow">Entrada Avulsa</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={movementForm.amount}
                  onChange={e => setMovementForm({ ...movementForm, amount: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Motivo / Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pagamento fornecedor hortifruti, troco extra..."
                  value={movementForm.description}
                  onChange={e => setMovementForm({ ...movementForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
