import React from 'react'
import { Download, RefreshCw, Sparkles } from 'lucide-react'
import { cn } from '../../utils/cn'

interface HeaderProps {
  title: string
  loading?: boolean
  onRefresh?: () => void
  onOpenUpdateModal: () => void
  appVersion: string | null
  updateAvailable?: boolean
  latestAppVersion?: string
}

export const Header: React.FC<HeaderProps> = ({
  title,
  loading = false,
  onRefresh,
  onOpenUpdateModal,
  appVersion,
  updateAvailable,
  latestAppVersion
}) => {
  return (
    <header className="app-header h-[84px] pt-4 border-b border-slate-200 bg-white/80 backdrop-blur-2xl px-6 flex items-center justify-between gap-4 shrink-0 select-none window-drag-region shadow-xs">
      {/* Title & info */}
      <div className="app-header-title min-w-0 flex items-center gap-2 window-no-drag">
        <h1 className="app-route-title min-w-0 text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
          <span className="app-header-title-text truncate">{title}</span>
        </h1>
        {loading && (
          <span role="status" className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-brand-700">
            <RefreshCw aria-hidden="true" className="w-3.5 h-3.5 animate-spin" />
            Atualizando
          </span>
        )}
      </div>

      {/* Action controls */}
      <div className="app-header-actions flex items-center gap-2.5 shrink-0 window-no-drag">
        <button
          type="button"
          onClick={onOpenUpdateModal}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer',
            updateAvailable
              ? 'bg-brand-600 hover:bg-brand-700 text-white border-brand-600'
              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
          )}
          title={updateAvailable ? 'Ver detalhes da atualização do Dutix GUI' : 'Verificar atualizações do Dutix GUI'}
          aria-label={updateAvailable ? `Atualizar para a versão ${latestAppVersion || 'mais recente'}` : 'Verificar atualizações do Dutix GUI'}
        >
          {updateAvailable ? <Sparkles aria-hidden="true" className="w-3.5 h-3.5" /> : <Download aria-hidden="true" className="w-3.5 h-3.5" />}
          <span className="app-header-update-label">{updateAvailable ? 'Atualização v' + (latestAppVersion || 'nova') : appVersion ? 'Dutix GUI v' + appVersion : 'Dutix GUI —'}</span>
        </button>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.96] shadow-xs"
            title="Atualizar dados"
            aria-label="Atualizar dados"
          >
            <RefreshCw className={cn('w-4 h-4', loading ? 'animate-spin text-brand-600' : 'text-slate-600')} />
          </button>
        )}

      </div>
    </header>
  )
}
