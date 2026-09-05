import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ShoppingBag,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Bike,
  XCircle,
  Eye,
  ChevronRight,
  Package,
  MapPin,
  DollarSign,
  Phone,
} from 'lucide-react';
import { Order, OrderStatus } from '../types.ts';

export const OrdersView: React.FC = () => {
  const { fetchWithAuth, currentStore } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New Delivery Run Form state
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [pickupAddress, setPickupAddress] = useState('Central de Despacho / Hub Principal');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderNeighborhood, setOrderNeighborhood] = useState('Bela Vista');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderPayment, setOrderPayment] = useState('pix');
  const [orderNotes, setOrderNotes] = useState('');
  const [driverFee, setDriverFee] = useState('8.50');
  const [orderTotalValue, setOrderTotalValue] = useState('45.00');

  const neighborhoodOptions = [
    'Bela Vista',
    'Jardins',
    'Pinheiros',
    'Centro',
    'Consolação',
    'Vila Mariana',
    'Perdizes',
    'Itaim Bibi',
    'Moema',
    'Santana',
  ];

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const custRes = await fetchWithAuth('/api/customers');
      if (custRes.ok) setCustomers(await custRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadOrders();
    loadDependencies();
  }, [currentStore?.id]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetchWithAuth(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await loadOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const fullDeliveryAddress = `${orderAddress} - ${orderNeighborhood}`;
      const res = await fetchWithAuth('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomer || customers[0]?.id || 'cust_1',
          address: fullDeliveryAddress,
          phone: orderPhone || '(11) 98765-4321',
          paymentMethod: orderPayment,
          notes: `[Coleta: ${pickupAddress}] ${orderNotes ? '- Obs: ' + orderNotes : ''}`,
          items: [
            {
              productId: `prod_run_${Date.now()}`,
              productName: `Corrida Delivery Express (${orderNeighborhood})`,
              quantity: 1,
              unitPrice: Number(orderTotalValue || 0),
            },
          ],
        }),
      });

      if (res.ok) {
        setIsNewOrderModalOpen(false);
        setOrderAddress('');
        setOrderNotes('');
        await loadOrders();
      }
    } catch (e) {
      console.error('Error creating delivery run:', e);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const statuses = [
    { id: 'all', label: 'Todas' },
    { id: 'novo', label: 'Novas' },
    { id: 'confirmado', label: 'Confirmadas' },
    { id: 'aguardando_despacho', label: 'Aguard. Despacho' },
    { id: 'em_rota', label: 'Em Rota' },
    { id: 'entregue', label: 'Entregues' },
    { id: 'cancelado', label: 'Canceladas' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Central de Corridas & Entregas</h1>
          <p className="text-xs text-slate-400">
            Acompanhe o ciclo de cada corrida desde o despacho até a finalização pelo motoboy
          </p>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Corrida</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
            {statuses.map(s => (
              <button
                key={s.id}
                onClick={() => setFilterStatus(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  filterStatus === s.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/10'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por corrida, bairro ou fone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Corrida ID</th>
                <th className="py-3 px-4">Endereço de Entrega & Bairro</th>
                <th className="py-3 px-4">Telefone</th>
                <th className="py-3 px-4">Status da Corrida</th>
                <th className="py-3 px-4 text-right">Taxa / Valor</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhuma corrida encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const getStatusBadge = (st: string) => {
                    switch (st) {
                      case 'novo':
                        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono text-[10px]">NOVA</span>;
                      case 'em_rota':
                        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono text-[10px]">EM ROTA</span>;
                      case 'entregue':
                        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono text-[10px]">ENTREGUE</span>;
                      case 'cancelado':
                        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-mono text-[10px]">CANCELADA</span>;
                      default:
                        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono text-[10px] uppercase">{st}</span>;
                    }
                  };

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {order.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="font-medium text-slate-200">{order.address}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {order.phone}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        R$ {Number(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] font-semibold transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Detalhes</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>Corrida {selectedOrder.id}</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">Loja: {selectedOrder.storeId}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg space-y-1.5 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Destino da Entrega</span>
                <p className="font-semibold text-white">{selectedOrder.address}</p>
                <p className="text-slate-400 font-mono">WhatsApp: {selectedOrder.phone}</p>
                {selectedOrder.notes && (
                  <p className="text-amber-300/90 text-[11px] bg-amber-950/20 p-2 rounded border border-amber-500/20 mt-1">
                    {selectedOrder.notes}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center py-2 border-y border-slate-800 font-semibold">
                <span className="text-slate-400">Total a Cobrar / Taxa:</span>
                <span className="font-mono text-emerald-400 text-sm">
                  R$ {Number(selectedOrder.totalAmount).toFixed(2)} ({selectedOrder.paymentMethod.toUpperCase()})
                </span>
              </div>

              {/* Status Stepper Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelado')}
                  className="bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-600/40 px-3 py-1.5 rounded text-xs font-semibold"
                >
                  Cancelar Corrida
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'entregue')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-bold ml-auto"
                >
                  Marcar como Entregue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Delivery Run Modal (Tailored for Motoboy Fleet Operations) */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Cadastrar Nova Corrida de Entrega</h3>
              </div>
              <button onClick={() => setIsNewOrderModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Cliente / Estabelecimento Solicitante</label>
                <select
                  value={selectedCustomer}
                  onChange={e => {
                    setSelectedCustomer(e.target.value);
                    const c = customers.find(item => item.id === e.target.value);
                    if (c) {
                      setOrderAddress(`${c.address}, ${c.number || ''}`);
                      setOrderPhone(c.phone);
                      if (c.neighborhood) setOrderNeighborhood(c.neighborhood);
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Selecione um cliente salvo ou preencha manual</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.neighborhood || 'São Paulo'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Local de Coleta (Ponto de Origem)</label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={e => setPickupAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="Restaurante / Loja / HUB de Coleta"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Endereço de Entrega (Destino)</label>
                  <input
                    type="text"
                    required
                    placeholder="Rua, Número, Apto"
                    value={orderAddress}
                    onChange={e => setOrderAddress(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Bairro / Região</label>
                  <select
                    value={orderNeighborhood}
                    onChange={e => setOrderNeighborhood(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {neighborhoodOptions.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">WhatsApp / Telefone Destinatário</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98765-4321"
                    value={orderPhone}
                    onChange={e => setOrderPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Forma de Pagamento</label>
                  <select
                    value={orderPayment}
                    onChange={e => setOrderPayment(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="pix">PIX</option>
                    <option value="cartao_credito">Cartão de Crédito (Maquininha)</option>
                    <option value="cartao_debito">Cartão de Débito (Maquininha)</option>
                    <option value="dinheiro">Dinheiro (com troco)</option>
                    <option value="faturado">Faturado / Convênio Mensal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Taxa do Motoboy (Repasse R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={driverFee}
                    onChange={e => setDriverFee(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Valor Total da Mercadoria a Cobrar (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={orderTotalValue}
                    onChange={e => setOrderTotalValue(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Instruções para o Motoboy</label>
                <input
                  type="text"
                  placeholder="Ex: Tocar interfone 32, levar troco para R$ 100,00, retirar na portaria..."
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
                >
                  <Bike className="w-4 h-4" />
                  <span>Despachar Corrida</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
