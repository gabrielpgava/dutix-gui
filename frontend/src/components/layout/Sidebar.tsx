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
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    { id: 'presets' as NavTab, label: 'Presets & Dotfiles', icon: BookmarkPlus },
    { id: 'snapshots' as NavTab, label: 'Snapshots & Rollback', icon: History },
  ]

  return (
    <aside className="w-64 bg-slate-900/80 border-r border-slate-800/80 backdrop-blur-xl flex flex-col justify-between select-none h-full z-20 shrink-0">
      {/* App Branding */}
      <div>
        <div className="h-16 flex items-center px-5 gap-3 border-b border-slate-800/50 pt-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
            <span className="font-mono text-sm font-bold text-white tracking-tighter">dx</span>
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
              Dutix GUI
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">macOS</span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">Gestor de Associações</p>
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
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group cursor-pointer',
                  isActive
                    ? 'bg-indigo-600/90 text-white shadow-sm shadow-indigo-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300')} />
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
      <div className="p-3 border-t border-slate-800/60 space-y-2 bg-slate-950/40">
        {/* Binary status indicator */}
        <button
          onClick={onOpenBinaryModal}
          className={cn(
            'w-full flex items-center justify-between p-2.5 rounded-lg border text-[11px] transition-all cursor-pointer',
            binaryInstalled
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
          )}
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Binário dutix</span>
          </div>
          <span className="font-mono text-[10px] font-semibold">
            {binaryInstalled ? 'Pronto' : 'Ausente'}
          </span>
        </button>

        {/* Logs Drawer Trigger */}
        <button
          onClick={onOpenLogs}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors border border-slate-800/40 cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>Console de Logs</span>
        </button>
      </div>
    </aside>
  )
}
