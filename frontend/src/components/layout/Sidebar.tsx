import React from 'react'
import {
  LayoutDashboard,
  Grid,
  Sparkles,
  ArrowRightLeft,
  SearchCode,
  BookmarkPlus,
  History,
  Terminal,
  Cpu,
  AlertTriangle
} from 'lucide-react'
import { cn } from '../../utils/cn'

export type NavTab = 
  | 'dashboard'
  | 'apps'
  | 'set'
  | 'migrate'
  | 'targets'
  | 'presets'
  | 'snapshots'

interface SidebarProps {
  currentTab: NavTab
  onSelectTab: (tab: NavTab) => void
  onOpenLogs: () => void
  onOpenBinaryModal: () => void
  onOpenUpdateModal?: () => void
  binaryInstalled: boolean
  conflictCount: number
  appVersion?: string
  updateAvailable?: boolean
  latestAppVersion?: string
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenLogs,
  onOpenBinaryModal,
  onOpenUpdateModal,
  binaryInstalled,
  conflictCount,
  appVersion,
  updateAvailable,
  latestAppVersion
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'apps' as NavTab, label: 'Aplicativos', icon: Grid },
    { id: 'set' as NavTab, label: 'Associação Rápida', icon: Sparkles },
    { id: 'migrate' as NavTab, label: 'Migração de Apps', icon: ArrowRightLeft },
    { 
      id: 'targets' as NavTab, 
      label: 'Inspetor & Diagnóstico', 
      icon: SearchCode, 
      badge: conflictCount > 0 ? conflictCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm'
    },
    { id: 'presets' as NavTab, label: 'Presets & Dotfiles', icon: BookmarkPlus },
    { id: 'snapshots' as NavTab, label: 'Snapshots & Rollback', icon: History },
  ]

  return (
    <aside className="w-64 bg-slate-50/95 border-r border-slate-200 backdrop-blur-2xl flex flex-col justify-between select-none h-full z-20 shrink-0 shadow-sm">
      {/* App Branding with macOS Traffic Lights Inset Spacing */}
      <div>
        {/* Top titlebar / drag region for macOS traffic lights */}
        <div className="h-[84px] pt-9 px-4 pb-3 flex items-center gap-3 border-b border-slate-200/80 window-drag-region">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-indigo-500/10 border border-slate-200 shrink-0 bg-white window-no-drag">
            <img src="/appicon.png" alt="Dutix Logo" className="w-full h-full object-cover select-none pointer-events-none" />
          </div>
          <div className="window-no-drag min-w-0 flex-1">
            <div className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
              <span className="truncate">Dutix GUI</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold tracking-wider shrink-0 shadow-sm">macOS</span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate">Gestor de Associações</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group cursor-pointer active:scale-[0.99]',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600')} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border font-mono font-bold', item.badgeColor)}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom status & action buttons */}
      <div className="p-3 border-t border-slate-200 space-y-2 bg-slate-100/60">
        {/* Update available indicator banner */}
        {updateAvailable && onOpenUpdateModal && (
          <button
            onClick={onOpenUpdateModal}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-indigo-300 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs font-bold transition-all cursor-pointer active:scale-[0.99] shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 animate-pulse"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Update v{latestAppVersion || 'novo'}</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono font-bold">
              Atualizar
            </span>
          </button>
        )}

        {/* Binary status indicator */}
        <button
          onClick={onOpenBinaryModal}
          className={cn(
            'w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-[0.99]',
            binaryInstalled
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 shadow-sm'
              : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100 shadow-sm'
          )}
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Binário dutix</span>
          </div>
          <span className="font-mono text-[11px] font-bold">
            {binaryInstalled ? 'Pronto' : 'Ausente'}
          </span>
        </button>

        {/* Logs Drawer Trigger & App Version */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLogs}
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors border border-slate-200 cursor-pointer active:scale-[0.99] bg-white shadow-xs"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Logs</span>
          </button>

          {onOpenUpdateModal && (
            <button
              onClick={onOpenUpdateModal}
              className="px-2.5 py-2 rounded-xl text-[11px] font-mono font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-200/70 transition-colors border border-slate-200 cursor-pointer active:scale-[0.99] bg-white shadow-xs"
              title="Verificar atualizações do Dutix GUI"
            >
              v{appVersion || '1.0.1'}
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
