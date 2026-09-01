import React from 'react'
import { RefreshCw, ShieldCheck, Terminal, Sparkles } from 'lucide-react'
import { cn } from '../../utils/cn'

interface HeaderProps {
  title: string
  subtitle?: string
  loading?: boolean
  onRefresh?: () => void
  onOpenBinaryModal: () => void
  onOpenLogs: () => void
  onOpenQuickPreset?: () => void
  onOpenUpdateModal?: () => void
  version?: string
  updateAvailable?: boolean
  latestAppVersion?: string
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  loading = false,
  onRefresh,
  onOpenBinaryModal,
  onOpenLogs,
  onOpenQuickPreset,
  onOpenUpdateModal,
  version,
  updateAvailable,
  latestAppVersion
}) => {
  return (
    <header className="h-[84px] pt-4 border-b border-slate-200 bg-white/80 backdrop-blur-2xl px-6 flex items-center justify-between shrink-0 select-none window-drag-region shadow-xs">
      {/* Title & info */}
      <div className="flex flex-col window-no-drag">
        <h1 className="text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
          {title}
          {loading && <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />}
        </h1>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-2.5 window-no-drag">
        {updateAvailable && onOpenUpdateModal && (
          <button
            onClick={onOpenUpdateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer active:scale-[0.98] animate-pulse"
            title="Nova versão disponível no GitHub"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Update v{latestAppVersion || 'novo'}</span>
          </button>
        )}

        {onOpenQuickPreset && (
          <button
            onClick={onOpenQuickPreset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            title="Aplicar Preset Rápido"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Preset Rápido</span>
          </button>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.96] shadow-xs"
            title="Atualizar dados"
            aria-label="Atualizar dados"
          >
            <RefreshCw className={cn('w-4 h-4', loading ? 'animate-spin text-indigo-600' : 'text-slate-600')} />
          </button>
        )}

        <button
          onClick={onOpenBinaryModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-mono font-semibold transition-all cursor-pointer active:scale-[0.98] shadow-xs"
          title="Gerenciar binário dutix"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>v{version || '0.2.2'}</span>
        </button>

        <button
          onClick={onOpenLogs}
          className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all cursor-pointer active:scale-[0.96] shadow-xs"
          title="Abrir Console de Logs"
          aria-label="Abrir Console de Logs"
        >
          <Terminal className="w-4 h-4 text-indigo-600" />
        </button>
      </div>
    </header>
  )
}
