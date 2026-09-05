import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Bike, Plus, Search, Phone, FileText, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { DeliveryDriver, DriverStatus } from '../types.ts';

export const DriversView: React.FC = () => {
  const { fetchWithAuth, currentStore } = useAuth();
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    document: '',
    vehicleType: 'moto',
    vehiclePlate: '',
    paymentModel: 'per_delivery',
    baseRate: '7.50',
    perKmRate: '1.50',
  });

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/drivers');
      if (res.ok) setDrivers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, [currentStore?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/drivers', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          name: '',
          phone: '',
          document: '',
          vehicleType: 'moto',
          vehiclePlate: '',
          paymentModel: 'per_delivery',
          baseRate: '7.50',
          perKmRate: '1.50',
        });
        await loadDrivers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Gestão de Entregadores</h1>
          <p className="text-xs text-slate-400">Frota própria e parceira, taxas de entrega e modelos de remuneração</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Entregador</span>
        </button>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map(d => (
          <div key={d.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center font-bold">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{d.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{d.phone}</p>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                d.status === 'AVAILABLE'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : d.status === 'DELIVERING'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {d.status === 'AVAILABLE' ? 'Disponível' : d.status === 'DELIVERING' ? 'Em Rota' : d.status}
              </span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Veículo:</span>
                <span className="text-slate-200 font-medium uppercase">{d.vehicleType} {d.vehiclePlate ? `(${d.vehiclePlate})` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Modelo de Taxa:</span>
                <span className="text-slate-200 font-medium">
                  {d.paymentModel === 'per_delivery' ? 'Por Entrega' : d.paymentModel === 'fixed' ? 'Diária Fixa' : 'Híbrido'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Valor Base:</span>
                <span className="text-emerald-400 font-mono font-bold">R$ {Number(d.baseRate).toFixed(2)}</span>
              </div>
            </div>

            {/* Simulated Earnings */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Simulação (15 corridas):</span>
              <span className="text-emerald-400 font-bold font-mono">
                R$ {(15 * Number(d.baseRate)).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Cadastrar Entregador</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Telefone WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Veículo</label>
                  <select
                    value={formData.vehicleType}
                    onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="moto">Moto</option>
                    <option value="bike">Bicicleta</option>
                    <option value="carro">Carro</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Placa</label>
                  <input
                    type="text"
                    placeholder="BRA2E19"
                    value={formData.vehiclePlate}
                    onChange={e => setFormData({ ...formData, vehiclePlate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">CPF / Documento</label>
                  <input
                    type="text"
                    value={formData.document}
                    onChange={e => setFormData({ ...formData, document: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Modelo de Pagamento</label>
                  <select
                    value={formData.paymentModel}
                    onChange={e => setFormData({ ...formData, paymentModel: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="per_delivery">Por Entrega</option>
                    <option value="fixed">Diária Fixa</option>
                    <option value="per_km">Por Quilômetro</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Valor da Taxa Base (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={formData.baseRate}
                    onChange={e => setFormData({ ...formData, baseRate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
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
                  Salvar Entregador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
