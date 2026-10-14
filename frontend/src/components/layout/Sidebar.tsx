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
  Cpu
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
  binaryInstalled: boolean | null
  conflictCount: number | null
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenLogs,
  onOpenBinaryModal,
  binaryInstalled,
  conflictCount
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
      badge: conflictCount !== null && conflictCount > 0 ? conflictCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm'
    },
    { id: 'presets' as NavTab, label: 'Presets & Dotfiles', icon: BookmarkPlus },
    { id: 'snapshots' as NavTab, label: 'Snapshots & Rollback', icon: History },
  ]

  return (
    <aside className="app-sidebar w-64 bg-slate-50/95 border-r border-slate-200 backdrop-blur-2xl flex flex-col justify-between select-none h-full z-20 shrink-0 shadow-sm">
      {/* App Branding with macOS Traffic Lights Inset Spacing */}
      <div>
        {/* Top titlebar / drag region for macOS traffic lights */}
        <div className="app-sidebar-brand h-[84px] pt-9 px-4 pb-3 flex items-center gap-3 border-b border-slate-200/80 window-drag-region">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-brand-500/10 border border-slate-200 shrink-0 bg-white window-no-drag">
            <img src="/appicon.png" alt="Dutix Logo" className="w-full h-full object-cover select-none pointer-events-none" />
          </div>
          <div className="app-sidebar-brand-copy window-no-drag min-w-0 flex-1">
            <div className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
              <span className="truncate">Dutix GUI</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 font-bold tracking-wider shrink-0 shadow-sm">macOS</span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate">Gestor de Associações</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="app-sidebar-nav p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.id

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                title={item.label}
                className={cn(
                  'app-sidebar-link w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group cursor-pointer active:scale-[0.99]',
                  isActive
                    ? 'app-route-nav-current bg-brand-600 text-white shadow-md shadow-brand-600/25 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                )}
              >
                <div className="app-sidebar-link-content flex items-center gap-2.5">
                  <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-white' : 'text-slate-500 group-hover:text-brand-600')} />
                  <span className="app-sidebar-label">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={cn('app-sidebar-badge text-[10px] px-1.5 py-0.5 rounded-full border font-mono font-bold', item.badgeColor)}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom status & action buttons */}
      <div className="app-sidebar-footer p-3 border-t border-slate-200 space-y-2 bg-slate-100/60">
        {/* Binary status indicator */}
        <button
          onClick={onOpenBinaryModal}
          type="button"
          aria-label={binaryInstalled === null ? 'Status do binário dutix indisponível' : binaryInstalled ? 'Binário dutix: pronto' : 'Binário dutix: ausente'}
          title={binaryInstalled === null ? 'Status do binário dutix indisponível' : binaryInstalled ? 'Binário dutix: pronto' : 'Binário dutix: ausente'}
          className={cn(
            'app-sidebar-footer-action w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-[0.99]',
            binaryInstalled === null
              ? 'bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
              : binaryInstalled
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 shadow-sm'
              : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100 shadow-sm'
          )}
        >
          <div className="app-sidebar-footer-action-content flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5" />
            <span className="app-sidebar-label">Binário dutix</span>
          </div>
          <span className="app-sidebar-label font-mono text-[11px] font-bold">
            {binaryInstalled === null ? 'Indisponível' : binaryInstalled ? 'Pronto' : 'Ausente'}
          </span>
        </button>

        <button
          onClick={onOpenLogs}
          type="button"
          aria-label="Logs de execução"
          title="Logs de execução"
          className="app-sidebar-footer-action w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors border border-slate-200 cursor-pointer active:scale-[0.99] bg-white"
        >
          <Terminal className="w-3.5 h-3.5 text-brand-600" />
          <span className="app-sidebar-label">Logs de execução</span>
        </button>
      </div>
    </aside>
  )
}
