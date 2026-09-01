import React from 'react'
import {
  X,
  Play,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ban,
  ArrowRight,
  ShieldAlert
} from 'lucide-react'
import { dutix } from '../../../wailsjs/go/models'

interface DryRunPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmApply: () => void
  dryRunResult: dutix.DryRunResult | null
  applying: boolean
  appName?: string
}

export const DryRunPreviewModal: React.FC<DryRunPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirmApply,
  dryRunResult,
  applying,
  appName
}) => {
  if (!isOpen || !dryRunResult) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Simulação de Alterações (Dry Run)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Pré-visualização segura antes de aplicar no LaunchServices do macOS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-center shadow-2xs">
              <span className="text-[10px] text-indigo-600 uppercase tracking-wider block font-bold">Pendentes</span>
              <span className="text-xl font-bold font-mono text-indigo-900">
                {dryRunResult.stats?.pending || dryRunResult.items?.length || 0}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center shadow-2xs">
              <span className="text-[10px] text-emerald-600 uppercase tracking-wider block font-bold">Sucesso</span>
              <span className="text-xl font-bold font-mono text-emerald-900">
                {dryRunResult.stats?.success || 0}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center shadow-2xs">
              <span className="text-[10px] text-amber-600 uppercase tracking-wider block font-bold">Ignorados</span>
              <span className="text-xl font-bold font-mono text-amber-900">
                {dryRunResult.stats?.skipped || 0}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center shadow-2xs">
              <span className="text-[10px] text-rose-600 uppercase tracking-wider block font-bold">Falhas</span>
              <span className="text-xl font-bold font-mono text-rose-900">
                {dryRunResult.stats?.failed || 0}
              </span>
            </div>
          </div>

          {/* Warnings Section */}
          {dryRunResult.warnings && dryRunResult.warnings.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Avisos do Sistema ({dryRunResult.warnings.length})</span>
              </div>
              <ul className="space-y-1 list-disc list-inside text-[11px] text-amber-800 font-medium">
                {dryRunResult.warnings.map((w, idx) => (
                  <li key={idx} className="break-all">{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Planned Items Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-xs">
              Mapeamento de Associações ({dryRunResult.items?.length || 0} itens)
            </h3>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-[11px] text-slate-800">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5 font-bold">Alvo / Extensão</th>
                      <th className="px-4 py-2.5 font-bold">Manipulador Atual</th>
                      <th className="px-4 py-2.5 font-bold">Novo Destino</th>
                      <th className="px-4 py-2.5 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {dryRunResult.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-indigo-700 truncate max-w-xs font-semibold">
                          {item.extension ? `.${item.extension} (${item.target})` : item.target}
                        </td>
                        <td className="px-4 py-2 text-slate-600 truncate max-w-xs">
                          {item.current || 'Nenhum'}
                        </td>
                        <td className="px-4 py-2 text-emerald-700 font-bold truncate max-w-xs">
                          {item.desired || appName || '-'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              item.status === 'skipped'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : item.status === 'failed'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with safety note */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Um snapshot de backup será gerado automaticamente antes de aplicar.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              disabled={applying}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer border border-slate-200 shadow-2xs"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmApply}
              disabled={applying}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
            >
              {applying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Aplicando Associações...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Confirmar & Aplicar (--yes)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
