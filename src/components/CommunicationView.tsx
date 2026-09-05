import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { MessageSquare, Send, Bell, User, Radio } from 'lucide-react';

export const CommunicationView: React.FC = () => {
  const { fetchWithAuth, currentStore, currentUser } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<'operations' | 'drivers' | 'general'>('operations');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetchWithAuth('/api/communication');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [currentStore?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetchWithAuth('/api/communication/messages', {
        method: 'POST',
        body: JSON.stringify({
          channel: activeChannel,
          content: newMessage,
        }),
      });
      if (res.ok) {
        setNewMessage('');
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter(m => m.channel === activeChannel);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Comunicação & Mensagens Internas</h1>
          <p className="text-xs text-slate-400">Canal direto entre atendimento, cozinha, expedição e entregadores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages / Chat Board */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm flex flex-col h-[520px]">
          {/* Channel Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'operations', label: 'Operacional & Cozinha' },
              { id: 'drivers', label: 'Canal Entregadores' },
              { id: 'general', label: 'Geral & Avisos' },
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setActiveChannel(c.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeChannel === c.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Nenhuma mensagem neste canal ainda. Seja o primeiro a enviar!
              </div>
            ) : (
              filteredMessages.map(m => (
                <div key={m.id} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">{m.senderName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{m.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Message Composer */}
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder={`Enviar mensagem no canal ${activeChannel}...`}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={sending}
              className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </form>
        </div>

        {/* Notifications & System Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Alertas Operacionais Automáticos</h2>
          </div>

          <div className="space-y-2.5">
            {notifications.map(n => (
              <div key={n.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{n.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
