import React from 'react'
import { RefreshCw, ShieldCheck, Terminal, DownloadCloud, Sparkles } from 'lucide-react'
import { cn } from '../../utils/cn'

interface HeaderProps {
  title: string
  subtitle?: string
  loading?: boolean
  onRefresh?: () => void
  onOpenBinaryModal: () => void
  onOpenLogs: () => void
  onOpenQuickPreset?: () => void
  version?: string
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  loading = false,
  onRefresh,
  onOpenBinaryModal,
  onOpenLogs,
  onOpenQuickPreset,
  version
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none window-drag-region">
      {/* Title & info */}
      <div className="flex flex-col window-no-drag">
        <h1 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          {title}
          {loading && <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
        </h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-2.5 window-no-drag">
        {onOpenQuickPreset && (
          <button
            onClick={onOpenQuickPreset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all shadow-sm cursor-pointer"
            title="Aplicar Preset Rápido"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Preset Rápido</span>
          </button>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50 transition-colors disabled:opacity-50 cursor-pointer"
            title="Atualizar dados"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin text-indigo-400')} />
          </button>
        )}

        <button
          onClick={onOpenBinaryModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-700/50 text-xs font-mono transition-colors cursor-pointer"
          title="Gerenciar binário dutix"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>v{version || '0.2.2'}</span>
        </button>

        <button
          onClick={onOpenLogs}
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-700/50 transition-colors cursor-pointer"
          title="Abrir Console de Logs"
        >
          <Terminal className="w-4 h-4 text-slate-400 hover:text-slate-200" />
        </button>
      </div>
    </header>
  )
}
