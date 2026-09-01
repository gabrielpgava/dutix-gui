import React from 'react'
import {
  Grid,
  SearchCode,
  Sparkles,
  ArrowRightLeft,
  History,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Code2,
  FileText,
  CheckCircle2,
  ChevronRight
} from 'lucide-react'
import { NavTab } from '../layout/Sidebar'
import { dutix, snapshots } from '../../../wailsjs/go/models'

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void
  appCount: number
  targetCount: number
  conflictCount: number
  binaryStatus: dutix.BinaryStatus | null
  recentSnapshots: snapshots.Snapshot[]
  onOpenBinaryModal: () => void
  onQuickSetDefault: (app: string, exts: string[], utis: string[], schemes: string[]) => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  appCount,
  targetCount,
  conflictCount,
  binaryStatus,
  recentSnapshots,
  onOpenBinaryModal,
  onQuickSetDefault
}) => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto h-full">
      {/* Hero / Welcome macOS Surface Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/70 border border-white/[0.09] p-8 backdrop-blur-2xl shadow-2xl shadow-black/20">
        {/* Subtle macOS radial background illumination */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> Controle Total de Associações macOS
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
              Gerencie manipuladores de arquivos e URLs com velocidade nativa
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Interface visual avançada para o utilitário <strong className="text-indigo-300 font-medium">dutix</strong>. Configure navegadores padrão, editores de código, associações em lote e migrações seguras.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => onNavigate('set')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30 cursor-pointer active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Associação Rápida</span>
            </button>
            <button
              onClick={() => onNavigate('presets')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-white/[0.08] transition-all cursor-pointer active:scale-[0.98]"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Aplicar Dotfiles / Preset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Apps Metric */}
        <div
          onClick={() => onNavigate('apps')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer group backdrop-blur-md active:scale-[0.99]"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Apps Instalados</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
              <Grid className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono tracking-tight">{appCount}</div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>Ver catálogo completo</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-indigo-400" />
          </div>
        </div>

        {/* Targets Metric */}
        <div
          onClick={() => onNavigate('targets')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] hover:border-purple-500/40 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer group backdrop-blur-md active:scale-[0.99]"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Alvos & Extensões</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
              <SearchCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono tracking-tight">{targetCount}</div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>Inspecionar associações</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-purple-400" />
          </div>
        </div>

        {/* Conflicts / Diagnostic Metric */}
        <div
          onClick={() => onNavigate('targets')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] hover:border-amber-500/40 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer group backdrop-blur-md active:scale-[0.99]"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Diagnóstico de Conflitos</span>
            <div className={`p-2 rounded-xl ${conflictCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono tracking-tight">{conflictCount}</div>
          <div className="text-xs mt-2">
            {conflictCount > 0 ? (
              <span className="text-amber-300 font-medium">Bundles órfãos detectados</span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 inline" /> Sistema íntegro
              </span>
            )}
          </div>
        </div>

        {/* Binary Status */}
        <div
          onClick={onOpenBinaryModal}
          className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer group backdrop-blur-md active:scale-[0.99]"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Binário Core</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight truncate">
            {binaryStatus?.installed ? `v${binaryStatus.version || '0.2.2'}` : 'Não Instalado'}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>Gerenciar e atualizar</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Quick macOS Default Switchers */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/[0.08] space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Troca Instantânea de Padrões Frequentes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Clique para alternar o manipulador padrão com 1 toque</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Default Browser Quick Switch */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>Navegador Web (HTTP / HTTPS)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onQuickSetDefault('Google Chrome', ['html', 'htm'], [], ['http', 'https'])}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] text-xs font-medium text-slate-200 transition-all cursor-pointer text-center active:scale-[0.98]"
              >
                Chrome
              </button>
              <button
                onClick={() => onQuickSetDefault('Safari', ['html', 'htm'], [], ['http', 'https'])}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] text-xs font-medium text-slate-200 transition-all cursor-pointer text-center active:scale-[0.98]"
              >
                Safari
              </button>
            </div>
          </div>

          {/* Default Code Editor */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Editor de Código (.ts, .js, .json)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onQuickSetDefault('Visual Studio Code', ['ts', 'tsx', 'js', 'jsx', 'json', 'py', 'go', 'md', 'yaml'], [], [])}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] text-xs font-medium text-slate-200 transition-all cursor-pointer text-center active:scale-[0.98]"
              >
                VS Code
              </button>
              <button
                onClick={() => onQuickSetDefault('TextEdit', ['txt', 'rtf'], [], [])}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] text-xs font-medium text-slate-200 transition-all cursor-pointer text-center active:scale-[0.98]"
              >
                TextEdit
              </button>
            </div>
          </div>

          {/* Default PDF Viewer */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs">
              <FileText className="w-4 h-4 text-rose-400" />
              <span>Leitor de Documentos (.pdf)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onQuickSetDefault('Preview', ['pdf'], ['com.adobe.pdf'], [])}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] text-xs font-medium text-slate-200 transition-all cursor-pointer text-center active:scale-[0.98]"
              >
                Preview (Apple)
              </button>
              <button
                onClick={() => onQuickSetDefault('Google Chrome', ['pdf'], ['com.adobe.pdf'], [])}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] text-xs font-medium text-slate-200 transition-all cursor-pointer text-center active:scale-[0.98]"
              >
                Chrome PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigate('migrate')}
          className="p-6 rounded-3xl bg-slate-900/50 border border-white/[0.08] hover:border-purple-500/40 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer group flex items-start gap-4 active:scale-[0.99] backdrop-blur-md"
        >
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors shrink-0">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
              Migração Completa entre Apps
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Transfira todas as associações de um aplicativo antigo para um novo automaticamente (ex: TextEdit → VS Code, Safari → Chrome).
            </p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('snapshots')}
          className="p-6 rounded-3xl bg-slate-900/50 border border-white/[0.08] hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer group flex items-start gap-4 active:scale-[0.99] backdrop-blur-md"
        >
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
              Histórico & Rollback Automático
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {recentSnapshots.length > 0
                ? `${recentSnapshots.length} snapshots salvos. Restaure o estado do sistema a qualquer momento.`
                : 'Snapshots de segurança são gerados antes de qualquer modificação em lote.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
