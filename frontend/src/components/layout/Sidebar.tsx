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
  binaryInstalled: boolean
  conflictCount: number
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
      badge: conflictCount > 0 ? conflictCount : undefined,
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    },
    { id: 'presets' as NavTab, label: 'Presets & Dotfiles', icon: BookmarkPlus },
    { id: 'snapshots' as NavTab, label: 'Snapshots & Rollback', icon: History },
  ]

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-white/[0.07] backdrop-blur-2xl flex flex-col justify-between select-none h-full z-20 shrink-0">
      {/* App Branding with macOS Traffic Lights Inset Spacing */}
      <div>
        {/* Top titlebar / drag region for macOS traffic lights */}
        <div className="h-[84px] pt-9 px-4 pb-3 flex items-center gap-3 border-b border-white/[0.06] window-drag-region">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/10 border border-indigo-500/30 shrink-0 bg-slate-950 window-no-drag">
            <img src="/appicon.png" alt="Dutix Logo" className="w-full h-full object-cover select-none pointer-events-none" />
          </div>
          <div className="window-no-drag min-w-0 flex-1">
            <div className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span className="truncate">Dutix GUI</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold tracking-wider shrink-0">macOS</span>
            </div>
            <p className="text-xs text-slate-400 font-normal truncate">Gestor de Associações</p>
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
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group cursor-pointer active:scale-[0.99]',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold border border-indigo-400/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
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
      <div className="p-3 border-t border-white/[0.06] space-y-2 bg-slate-950/40">
        {/* Binary status indicator */}
        <button
          onClick={onOpenBinaryModal}
          className={cn(
            'w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all cursor-pointer active:scale-[0.99]',
            binaryInstalled
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/15'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
          )}
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Binário dutix</span>
          </div>
          <span className="font-mono text-[11px] font-semibold">
            {binaryInstalled ? 'Pronto' : 'Ausente'}
          </span>
        </button>

        {/* Logs Drawer Trigger */}
        <button
          onClick={onOpenLogs}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors border border-white/[0.05] cursor-pointer active:scale-[0.99]"
        >
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>Console de Logs</span>
        </button>
      </div>
    </aside>
  )
}
