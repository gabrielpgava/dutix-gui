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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/40 border border-indigo-100/80 p-8 backdrop-blur-xl shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Controle Total de Associações macOS
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              Gerencie manipuladores de arquivos e URLs com velocidade nativa
            </h1>
            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              Interface visual avançada para o utilitário <strong className="text-indigo-600 font-semibold">dutix</strong>. Configure navegadores padrão, editores de código, associações em lote e migrações seguras.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => onNavigate('set')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Associação Rápida</span>
            </button>
            <button
              onClick={() => onNavigate('presets')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer active:scale-[0.98] shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
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
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all duration-200 cursor-pointer group active:scale-[0.99] shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-600 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Apps Instalados</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors border border-indigo-100">
              <Grid className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">{appCount}</div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-medium">
            <span>Ver catálogo completo</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-indigo-600" />
          </div>
        </div>

        {/* Targets Metric */}
        <div
          onClick={() => onNavigate('targets')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-purple-400 hover:shadow-md transition-all duration-200 cursor-pointer group active:scale-[0.99] shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-600 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Alvos & Extensões</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors border border-purple-100">
              <SearchCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">{targetCount}</div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-medium">
            <span>Inspecionar associações</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-purple-600" />
          </div>
        </div>

        {/* Conflicts / Diagnostic Metric */}
        <div
          onClick={() => onNavigate('targets')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all duration-200 cursor-pointer group active:scale-[0.99] shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-600 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Diagnóstico de Conflitos</span>
            <div className={`p-2 rounded-xl border ${conflictCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">{conflictCount}</div>
          <div className="text-xs mt-2 font-semibold">
            {conflictCount > 0 ? (
              <span className="text-amber-700">Bundles órfãos detectados</span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 inline" /> Sistema íntegro
              </span>
            )}
          </div>
        </div>

        {/* Binary Status */}
        <div
          onClick={onOpenBinaryModal}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition-all duration-200 cursor-pointer group active:scale-[0.99] shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-600 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Binário Core</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight truncate">
            {binaryStatus?.installed ? `v${binaryStatus.version || '0.2.2'}` : 'Não Instalado'}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-medium">
            <span>Gerenciar e atualizar</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Quick macOS Default Switchers */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Troca Instantânea de Padrões Frequentes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Clique para alternar o manipulador padrão com 1 toque</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Default Browser Quick Switch */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <Compass className="w-4 h-4 text-sky-600" />
              <span>Navegador Web (HTTP / HTTPS)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onQuickSetDefault('Google Chrome', ['html', 'htm'], [], ['http', 'https'])}
                className="px-3 py-2 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-xs font-semibold text-slate-700 transition-all cursor-pointer text-center active:scale-[0.98] shadow-2xs"
              >
                Chrome
              </button>
              <button
                onClick={() => onQuickSetDefault('Safari', ['html', 'htm'], [], ['http', 'https'])}
                className="px-3 py-2 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-xs font-semibold text-slate-700 transition-all cursor-pointer text-center active:scale-[0.98] shadow-2xs"
              >
                Safari
              </button>
            </div>
          </div>

          {/* Default Code Editor */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>Editor de Código (.ts, .js, .json)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onQuickSetDefault('Visual Studio Code', ['ts', 'tsx', 'js', 'jsx', 'json', 'py', 'go', 'md', 'yaml'], [], [])}
                className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-semibold text-slate-700 transition-all cursor-pointer text-center active:scale-[0.98] shadow-2xs"
              >
                VS Code
              </button>
              <button
                onClick={() => onQuickSetDefault('TextEdit', ['txt', 'rtf'], [], [])}
                className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-semibold text-slate-700 transition-all cursor-pointer text-center active:scale-[0.98] shadow-2xs"
              >
                TextEdit
              </button>
            </div>
          </div>

          {/* Default PDF Viewer */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <FileText className="w-4 h-4 text-rose-600" />
              <span>Leitor de Documentos (.pdf)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onQuickSetDefault('Preview', ['pdf'], ['com.adobe.pdf'], [])}
                className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-xs font-semibold text-slate-700 transition-all cursor-pointer text-center active:scale-[0.98] shadow-2xs"
              >
                Preview (Apple)
              </button>
              <button
                onClick={() => onQuickSetDefault('Google Chrome', ['pdf'], ['com.adobe.pdf'], [])}
                className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-xs font-semibold text-slate-700 transition-all cursor-pointer text-center active:scale-[0.98] shadow-2xs"
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
          className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-purple-400 hover:shadow-md transition-all duration-200 cursor-pointer group flex items-start gap-4 active:scale-[0.99] shadow-xs"
        >
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors border border-purple-100 shrink-0">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
              Migração Completa entre Apps
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
              Transfira todas as associações de um aplicativo antigo para um novo automaticamente (ex: TextEdit → VS Code, Safari → Chrome).
            </p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('snapshots')}
          className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all duration-200 cursor-pointer group flex items-start gap-4 active:scale-[0.99] shadow-xs"
        >
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors border border-indigo-100 shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
              Histórico & Rollback Automático
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
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
