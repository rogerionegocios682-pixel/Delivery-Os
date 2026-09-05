import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { CalendarClock, Plus, Bike, Clock, CheckCircle2 } from 'lucide-react';
import { DriverShift } from '../types.ts';

export const ShiftsView: React.FC = () => {
  const { fetchWithAuth, currentStore } = useAuth();
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    fetchWithAuth('/api/drivers').then(res => res.json()).then(setDrivers).catch(console.error);
  }, [currentStore?.id]);

  const shiftsSample = [
    { id: 'shift_1', driver: 'Lucas Gabriel Santana', type: 'Escala Fixa Noturna', start: '18:00', end: '23:45', status: 'Confirmada' },
    { id: 'shift_2', driver: 'Marcelo Antunes Ribeiro', type: 'Escala Fixa Noturna', start: '18:30', end: '00:00', status: 'Confirmada' },
    { id: 'shift_3', driver: 'Rodrigo Mendonça', type: 'Escala Variável / Pico', start: '19:00', end: '23:00', status: 'Confirmada' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Escalas & Plantões de Entregadores</h1>
          <p className="text-xs text-slate-400">Organização de turnos fixos, variáveis, folgas e substituições</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shiftsSample.map(s => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase bg-slate-800 text-emerald-400 px-2 py-0.5 rounded">
                {s.type}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {s.status}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white">{s.driver}</h3>

            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Horário do Plantão:</span>
              </div>
              <span className="font-mono font-bold text-white">{s.start} às {s.end}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
