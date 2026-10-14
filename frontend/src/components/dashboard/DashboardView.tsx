import React from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Code2,
  Compass,
  FileText,
  Grid,
  SearchCode,
  Sparkles
} from 'lucide-react'
import { NavTab } from '../layout/Sidebar'

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void
  appCount: number | null
  targetCount: number | null
  conflictCount: number | null
  onQuickSetDefault: (app: string, exts: string[], utis: string[], schemes: string[]) => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  appCount,
  targetCount,
  conflictCount,
  onQuickSetDefault
}) => {
  const metricClass = 'w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40 focus-visible:outline-none'
  const shortcutClass = 'flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none'

  return (
    <div className="app-page max-w-6xl mx-auto space-y-7 overflow-y-auto h-full">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Configure suas associações</h2>
          <p className="mt-1 text-sm text-slate-600">
            Escolha um app para arquivos ou links e revise as mudanças antes de aplicar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('set')}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none"
        >
          <Sparkles className="h-4 w-4" />
          Nova associação
        </button>
      </section>

      <section aria-label="Resumo do sistema" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => onNavigate('apps')} className={metricClass} aria-label={appCount === null ? 'Contagem de aplicativos indisponível. Abrir catálogo' : `${appCount} aplicativos. Abrir catálogo`}>
          <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Grid className="h-4 w-4 text-brand-600" /> Aplicativos
          </span>
          <span className="mt-3 flex items-baseline justify-between">
            <strong className="text-2xl font-semibold tabular-nums text-slate-900">{appCount ?? '—'}</strong>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700">
              Abrir catálogo <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </span>
        </button>

        <button type="button" onClick={() => onNavigate('targets')} className={metricClass} aria-label={targetCount === null ? 'Contagem de associações indisponível. Inspecionar alvos' : `${targetCount} associações. Inspecionar alvos`}>
          <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <SearchCode className="h-4 w-4 text-brand-600" /> Associações detectadas
          </span>
          <span className="mt-3 flex items-baseline justify-between">
            <strong className="text-2xl font-semibold tabular-nums text-slate-900">{targetCount ?? '—'}</strong>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700">
              Inspecionar <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </span>
        </button>

        <button type="button" onClick={() => onNavigate('targets')} className={metricClass} aria-label={conflictCount === null ? 'Contagem de conflitos indisponível. Abrir diagnóstico' : `${conflictCount} conflitos. Abrir diagnóstico`}>
          <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
            {conflictCount === null ? <AlertTriangle className="h-4 w-4 text-slate-500" /> : conflictCount > 0 ? <AlertTriangle className="h-4 w-4 text-amber-700" /> : <CheckCircle2 className="h-4 w-4 text-emerald-700" />}
            Diagnóstico
          </span>
          <span className="mt-3 flex items-baseline justify-between">
            <strong className="text-2xl font-semibold tabular-nums text-slate-900">{conflictCount ?? '—'}</strong>
            <span className={`text-xs font-medium ${conflictCount === null ? 'text-slate-600' : conflictCount > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
              {conflictCount === null ? 'Indisponível' : conflictCount > 0 ? 'Ver conflitos' : 'Sem conflitos'}
            </span>
          </span>
        </button>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Atalhos de configuração</h2>
          <p className="mt-1 text-xs text-slate-500">
            Os atalhos preenchem o formulário; a prévia aparece antes de qualquer alteração.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Compass className="h-4 w-4 text-brand-600" /> Navegador
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => onQuickSetDefault('Google Chrome', ['html', 'htm'], [], ['http', 'https'])} className={shortcutClass}>
                Chrome <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => onQuickSetDefault('Safari', ['html', 'htm'], [], ['http', 'https'])} className={shortcutClass}>
                Safari <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Code2 className="h-4 w-4 text-brand-600" /> Código e texto
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => onQuickSetDefault('Visual Studio Code', ['ts', 'tsx', 'js', 'jsx', 'json', 'py', 'go', 'md', 'yaml'], [], [])} className={shortcutClass}>
                VS Code <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => onQuickSetDefault('TextEdit', ['txt', 'rtf'], [], [])} className={shortcutClass}>
                TextEdit <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <FileText className="h-4 w-4 text-brand-600" /> PDFs
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => onQuickSetDefault('Preview', ['pdf'], ['com.adobe.pdf'], [])} className={shortcutClass}>
                Preview <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => onQuickSetDefault('Google Chrome', ['pdf'], ['com.adobe.pdf'], [])} className={shortcutClass}>
                Chrome <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
