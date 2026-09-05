import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Users, Plus, Search, MapPin, Phone, Mail, UserCheck } from 'lucide-react';
import { Customer } from '../types.ts';

export const CustomersView: React.FC = () => {
  const { fetchWithAuth, currentStore } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'São Paulo',
    reference: '',
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/customers');
      if (res.ok) {
        setCustomers(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [currentStore?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/customers', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: 'São Paulo',
          reference: '',
        });
        await loadCustomers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Cadastro de Clientes</h1>
          <p className="text-xs text-slate-400">Histórico de endereços de entrega e contato por empresa</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou rua..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">{filtered.length} clientes registrados</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold bg-slate-950/40">
              <th className="p-3.5">Nome</th>
              <th className="p-3.5">Telefone / WhatsApp</th>
              <th className="p-3.5">Endereço Principal</th>
              <th className="p-3.5">Bairro / Cidade</th>
              <th className="p-3.5">Ponto de Referência</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-slate-850/60 transition">
                <td className="p-3.5 font-semibold text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      {c.name.charAt(0)}
                    </div>
                    <span>{c.name}</span>
                  </div>
                </td>
                <td className="p-3.5 font-mono text-slate-300">{c.phone}</td>
                <td className="p-3.5 text-slate-200">
                  {c.address}, {c.number} {c.complement && `(${c.complement})`}
                </td>
                <td className="p-3.5 text-slate-400">
                  {c.neighborhood} • {c.city}
                </td>
                <td className="p-3.5 text-slate-400 italic">
                  {c.reference || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Cadastrar Cliente</h3>
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
                  <label className="text-slate-400 block mb-1">Telefone (WhatsApp)</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98765-4321"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">E-mail (opcional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-slate-400 block mb-1">Logradouro / Rua</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Número</label>
                  <input
                    type="text"
                    required
                    value={formData.number}
                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Complemento</label>
                  <input
                    type="text"
                    placeholder="Apto, Bloco..."
                    value={formData.complement}
                    onChange={e => setFormData({ ...formData, complement: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Bairro</label>
                  <input
                    type="text"
                    required
                    value={formData.neighborhood}
                    onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Ponto de Referência</label>
                <input
                  type="text"
                  placeholder="Ex: portão branco ao lado da farmácia..."
                  value={formData.reference}
                  onChange={e => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
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
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
