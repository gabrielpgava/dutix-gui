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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Simulação de Alterações (Dry Run)
              </h2>
              <p className="text-xs text-slate-400">
                Pré-visualização segura antes de aplicar no LaunchServices do macOS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-center">
              <span className="text-[10px] text-indigo-300 uppercase tracking-wider block">Pendentes</span>
              <span className="text-xl font-bold font-mono text-indigo-200">
                {dryRunResult.stats?.pending || dryRunResult.items?.length || 0}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center">
              <span className="text-[10px] text-emerald-300 uppercase tracking-wider block">Sucesso</span>
              <span className="text-xl font-bold font-mono text-emerald-200">
                {dryRunResult.stats?.success || 0}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-center">
              <span className="text-[10px] text-amber-300 uppercase tracking-wider block">Ignorados</span>
              <span className="text-xl font-bold font-mono text-amber-200">
                {dryRunResult.stats?.skipped || 0}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-center">
              <span className="text-[10px] text-rose-300 uppercase tracking-wider block">Falhas</span>
              <span className="text-xl font-bold font-mono text-rose-200">
                {dryRunResult.stats?.failed || 0}
              </span>
            </div>
          </div>

          {/* Warnings Section */}
          {dryRunResult.warnings && dryRunResult.warnings.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Avisos do Sistema ({dryRunResult.warnings.length})</span>
              </div>
              <ul className="space-y-1 list-disc list-inside text-[11px] text-amber-300/80">
                {dryRunResult.warnings.map((w, idx) => (
                  <li key={idx} className="break-all">{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Planned Items Table */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-200 text-xs">
              Mapeamento de Associações ({dryRunResult.items?.length || 0} itens)
            </h3>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-[11px] text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Alvo / Extensão</th>
                      <th className="px-4 py-2.5 font-semibold">Manipulador Atual</th>
                      <th className="px-4 py-2.5 font-semibold">Novo Destino</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {dryRunResult.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="px-4 py-2 text-indigo-300 truncate max-w-xs font-medium">
                          {item.extension ? `.${item.extension} (${item.target})` : item.target}
                        </td>
                        <td className="px-4 py-2 text-slate-400 truncate max-w-xs">
                          {item.current || 'Nenhum'}
                        </td>
                        <td className="px-4 py-2 text-emerald-400 font-semibold truncate max-w-xs">
                          {item.desired || appName || '-'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              item.status === 'skipped'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : item.status === 'failed'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
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
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Um snapshot de backup será gerado automaticamente antes de aplicar.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              disabled={applying}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmApply}
              disabled={applying}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
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
