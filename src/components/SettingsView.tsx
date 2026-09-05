import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Settings, Store, Save, Upload, Image, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentStore, settings, fetchWithAuth, refreshContext } = useAuth();
  const [minOrder, setMinOrder] = useState('30.00');
  const [deliveryFee, setDeliveryFee] = useState('8.00');
  const [businessHours, setBusinessHours] = useState('18:00 - 23:45');
  const [autoDispatch, setAutoDispatch] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);

  // Logo state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setMinOrder(settings.minOrderValue || '30.00');
      setDeliveryFee(settings.defaultDeliveryFee || '8.00');
      setBusinessHours(settings.businessHours || '18:00 - 23:45');
      setAutoDispatch(settings.autoDispatch ?? false);
      setSoundAlerts(settings.soundAlerts ?? true);
    }
    if (currentStore?.logoUrl) {
      setLogoPreview(currentStore.logoUrl);
    }
  }, [settings, currentStore]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecione um arquivo de imagem válido (PNG, JPG, WEBP, SVG).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage('O tamanho máximo permitido para o logotipo é de 3MB.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setLogoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      // 1. Save store settings
      const settingsRes = await fetchWithAuth('/api/store/settings', {
        method: 'PUT',
        body: JSON.stringify({
          minOrderValue: minOrder,
          defaultDeliveryFee: deliveryFee,
          autoDispatch,
          soundAlerts,
          businessHours,
        }),
      });

      // 2. Save store logo
      const logoRes = await fetchWithAuth('/api/store/logo', {
        method: 'POST',
        body: JSON.stringify({
          logoUrl: logoPreview,
        }),
      });

      if (settingsRes.ok && logoRes.ok) {
        await refreshContext();
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        throw new Error('Falha ao salvar dados da loja');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Ocorreu um erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Configurações da Empresa</h1>
          <p className="text-xs text-slate-400">Identidade visual, regras de entrega e parâmetros operacionais de motoboys</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
        {/* Company Identification & Logo Upload */}
        <div className="border-b border-slate-800 pb-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Identidade Visual & Logomarca</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Store details */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Razão / Nome Fantasia</span>
                <p className="font-semibold text-white bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {currentStore?.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block mb-1">CNPJ</span>
                  <p className="font-mono text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                    {currentStore?.cnpj || 'Sem CNPJ'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Código da Loja</span>
                  <p className="font-mono text-emerald-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                    {currentStore?.id}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Endereço Principal</span>
                <p className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                  {currentStore?.address || 'São Paulo - SP'}
                </p>
              </div>
            </div>

            {/* Logo Upload Box with Drag & Drop and Manual File Selection */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Logomarca do Estabelecimento</span>
              <p className="text-[11px] text-slate-400">
                Aparecerá no cabeçalho, comprovantes e no painel operacional de despacho.
              </p>

              {logoPreview ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                  <img
                    src={logoPreview}
                    alt="Pré-visualização do logotipo"
                    className="w-16 h-16 rounded-lg object-contain bg-slate-900 border border-slate-700 p-1 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white block">Logotipo Carregado</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Pronto para exibição</span>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded font-medium border border-slate-700 transition"
                      >
                        Trocar Imagem
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="text-[11px] text-rose-400 hover:text-rose-300 px-2 py-1 rounded flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remover</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 ${
                    isDragging
                      ? 'border-emerald-400 bg-emerald-950/20'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-950/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      Arraste e solte o logotipo aqui
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ou clique para selecionar do computador
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    PNG, JPG, WEBP ou SVG (Máx. 3MB)
                  </span>
                </div>
              )}

              {/* Hidden native input for manual file selection */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Operational & Delivery Parameters */}
        <div className="space-y-4 text-xs">
          <h2 className="text-sm font-bold text-white">Parâmetros Operacionais de Delivery</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Pedido Mínimo de Corrida (R$)</label>
              <input
                type="number"
                step="0.01"
                value={minOrder}
                onChange={e => setMinOrder(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Taxa Padrão de Entrega (R$)</label>
              <input
                type="number"
                step="0.01"
                value={deliveryFee}
                onChange={e => setDeliveryFee(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium">Horário de Operação da Frota</label>
            <input
              type="text"
              value={businessHours}
              onChange={e => setBusinessHours(e.target.value)}
              placeholder="18:00 - 23:45"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-950 transition">
              <input
                type="checkbox"
                checked={autoDispatch}
                onChange={e => setAutoDispatch(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-white block">Despacho Automático Inteligente</span>
                <span className="text-[11px] text-slate-400">
                  Atribuir automaticamente novas corridas ao motoboy disponível mais próximo
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-950 transition">
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={e => setSoundAlerts(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-white block">Sons de Alerta de Nova Corrida</span>
                <span className="text-[11px] text-slate-400">
                  Emitir alerta sonoro ao receber nova corrida de delivery ou aviso operacional
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Action and feedback footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div>
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Logomarca e configurações salvas com sucesso!</span>
              </span>
            )}
            {errorMessage && (
              <span className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{errorMessage}</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="ml-auto bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
