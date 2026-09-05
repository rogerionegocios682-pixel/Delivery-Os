import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Bike,
  Award,
  DollarSign,
  MapPin,
  Calendar,
  Filter,
  Search,
  CheckCircle,
  FileText,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface DriverRanking {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  status: string;
  baseRate: number;
  totalCorridas: number;
  taxasAcumuladas: number;
  regiaoMaisEntregou: string;
  regiaoMaisEntregouPct: number;
  tempoMedioMin: number;
  taxaSucessoPct: string;
}

interface RankingReportData {
  month: string;
  totalCorridasMes: number;
  totalTaxasAcumuladasMes: number;
  mediaCorridasPorMotoboy: number;
  topFleetRegion: string;
  rankings: DriverRanking[];
}

export const ReportsView: React.FC = () => {
  const { fetchWithAuth, currentStore } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<RankingReportData | null>(null);

  const monthsList = [
    { value: '2026-09', label: 'Setembro / 2026 (Mês Atual)' },
    { value: '2026-08', label: 'Agosto / 2026' },
    { value: '2026-07', label: 'Julho / 2026' },
    { value: '2026-06', label: 'Junho / 2026' },
    { value: '2026-05', label: 'Maio / 2026' },
  ];

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`/api/reports/drivers-ranking?month=${selectedMonth}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching drivers ranking report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, currentStore?.id]);

  const filteredRankings = (data?.rankings || []).filter(item => {
    const matchesVehicle = vehicleFilter === 'all' || item.vehicleType.toLowerCase() === vehicleFilter.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.phone.includes(searchQuery) ||
                          item.regiaoMaisEntregou.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVehicle && matchesSearch;
  });

  // Region breakdown calculation
  const regionBreakdown: Record<string, number> = {};
  (data?.rankings || []).forEach(d => {
    const reg = d.regiaoMaisEntregou;
    regionBreakdown[reg] = (regionBreakdown[reg] || 0) + d.totalCorridas;
  });
  const sortedRegions = Object.entries(regionBreakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header and Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Ranking de Desempenho dos Motoboys</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Relatório mensal de corridas entregues, taxas acumuladas e região com maior volume de entregas por motoboy
          </p>
        </div>

        {/* Month Selector Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400 font-medium">Período:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {monthsList.map(m => (
                <option key={m.value} value={m.value} className="bg-slate-900 text-white">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs shadow-sm">
            <Filter className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              value={vehicleFilter}
              onChange={e => setVehicleFilter(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">Todos os Veículos</option>
              <option value="moto" className="bg-slate-900 text-white">Apenas Moto</option>
              <option value="bicicleta" className="bg-slate-900 text-white">Apenas Bicicleta</option>
              <option value="carro" className="bg-slate-900 text-white">Apenas Carro</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards: Total Corridas do Mês, Soma de Taxas Acumuladas, etc. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Corridas do Mês */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Total de Corridas do Mês</span>
            <Bike className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {data?.totalCorridasMes ?? 0}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
            <span className="text-emerald-400 font-bold">100%</span>
            <span>entregas concluídas no período</span>
          </div>
        </div>

        {/* Soma de Taxas Acumuladas no Mês */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Soma de Taxas Acumuladas</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono tracking-tight">
            R$ {Number(data?.totalTaxasAcumuladasMes ?? 0).toFixed(2)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
            <span>Repasse acumulado da frota no mês</span>
          </div>
        </div>

        {/* Média de Corridas por Motoboy */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Média Corridas / Motoboy</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-blue-300 font-mono tracking-tight">
            {data?.mediaCorridasPorMotoboy ?? 0}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
            <span>Produtividade média mensal</span>
          </div>
        </div>

        {/* Região com Maior Volume */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Região Mais Entregue</span>
            <MapPin className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-300 font-sans tracking-tight">
            {data?.topFleetRegion || 'Bela Vista'}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-purple-400">
            <span>Bairro com maior demanda na cidade</span>
          </div>
        </div>
      </div>

      {/* Driver Performance Ranking Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">
              Tabela de Desempenho & Taxas por Motoboy
            </h2>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {filteredRankings.length} motoboys avaliados
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por motoboy ou bairro..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <th className="pb-3 px-3">Ranking</th>
                <th className="pb-3">Motoboy</th>
                <th className="pb-3">Veículo / Placa</th>
                <th className="pb-3 text-center">Corridas no Mês</th>
                <th className="pb-3">Região que Mais Entregou</th>
                <th className="pb-3 text-right">Taxa Base</th>
                <th className="pb-3 text-right">Taxas Acumuladas no Mês</th>
                <th className="pb-3 text-center">Tempo Médio</th>
                <th className="pb-3 text-center">Eficiência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredRankings.map((d, index) => {
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;

                return (
                  <tr key={d.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {isTop1 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-mono border border-amber-500/40 text-xs">
                            🥇
                          </span>
                        ) : isTop2 ? (
                          <span className="w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 font-bold flex items-center justify-center font-mono border border-slate-400/40 text-xs">
                            🥈
                          </span>
                        ) : isTop3 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 font-bold flex items-center justify-center font-mono border border-amber-700/40 text-xs">
                            🥉
                          </span>
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center font-mono text-[11px]">
                            #{index + 1}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Motoboy Name & Phone */}
                    <td className="py-3">
                      <div>
                        <span className="font-bold text-white block">{d.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{d.phone}</span>
                      </div>
                    </td>

                    {/* Vehicle */}
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="uppercase font-mono text-[11px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                          {d.vehicleType}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {d.vehiclePlate || 'N/D'}
                        </span>
                      </div>
                    </td>

                    {/* Total de Corridas no Mês */}
                    <td className="py-3 text-center">
                      <div className="inline-block bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                        <span className="font-mono font-black text-sm text-emerald-400">
                          {d.totalCorridas}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-sans">corridas</span>
                      </div>
                    </td>

                    {/* Região que Ele Mais Entregou */}
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 bg-purple-950/60 border border-purple-500/40 text-purple-300 px-2.5 py-1 rounded-lg font-medium text-xs">
                          <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                          <span>{d.regiaoMaisEntregou}</span>
                        </span>
                        <span className="text-[10px] font-mono text-purple-300 font-semibold">
                          ({d.regiaoMaisEntregouPct}%)
                        </span>
                      </div>
                    </td>

                    {/* Base Rate */}
                    <td className="py-3 text-right font-mono text-slate-400">
                      R$ {d.baseRate.toFixed(2)}
                    </td>

                    {/* Soma de Taxas Acumuladas no Mês */}
                    <td className="py-3 text-right">
                      <div className="inline-block bg-emerald-950/30 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                        <span className="font-mono font-black text-sm text-emerald-400">
                          R$ {d.taxasAcumuladas.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    {/* Average Time */}
                    <td className="py-3 text-center font-mono text-slate-300">
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {d.tempoMedioMin} min
                      </span>
                    </td>

                    {/* Efficiency / Success Rate */}
                    <td className="py-3 text-center">
                      <span className="font-mono text-emerald-400 font-semibold">
                        {d.taxaSucessoPct}%
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredRankings.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    Nenhum motoboy encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regional Demand Breakdown & Delivery Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Deliveries Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">
                Distribuição de Corridas por Bairro / Região
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Volume no mês</span>
          </div>

          <div className="space-y-3">
            {sortedRegions.map(([region, count], idx) => {
              const maxCount = sortedRegions[0]?.[1] || 1;
              const pct = Math.round((count / (data?.totalCorridasMes || 1)) * 100);

              return (
                <div key={region} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{region}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400">{count} corridas</span>
                      <span className="text-purple-400 font-bold">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(pct * 2, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motoboy Operations Summary & Settlement */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Resumo para Fechamento de Taxas</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Os valores acumulados refletem as corridas efetivamente entregues no mês selecionado{' '}
              <strong className="text-white">({selectedMonth})</strong>. Os repasses são calculados
              multiplicando a quantidade de entregas pela taxa base contratada por motoboy.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Total de Corridas da Frota:</span>
                <span className="font-mono font-bold text-white">{data?.totalCorridasMes || 0} corridas</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Total Geral de Taxas a Pagar:</span>
                <span className="font-mono font-bold text-emerald-400">
                  R$ {Number(data?.totalTaxasAcumuladasMes || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Média por Motoboy:</span>
                <span className="font-mono text-slate-200">
                  {data?.mediaCorridasPorMotoboy || 0} corridas (R${' '}
                  {data?.rankings.length
                    ? (Number(data.totalTaxasAcumuladasMes) / data.rankings.length).toFixed(2)
                    : '0.00'}
                  )
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Conferido com base no banco Cloud SQL</span>
            </span>
            <button
              onClick={() => window.print()}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              Imprimir Relatório
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
