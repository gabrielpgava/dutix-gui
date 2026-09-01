import React, { useState } from 'react'
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  SearchCode,
  Sparkles,
  Layers,
  FileCode,
  Globe,
  AlertCircle,
  Check,
  X,
  RefreshCw
} from 'lucide-react'
import { dutix } from '../../../wailsjs/go/models'
import { ShowTarget, SetHandler } from '../../../wailsjs/go/main/App'

interface TargetsViewProps {
  targets: dutix.TargetItem[]
  conflicts: dutix.ConflictItem[]
  loading: boolean
  onRefresh: () => void
}

export const TargetsView: React.FC<TargetsViewProps> = ({
  targets,
  conflicts,
  loading,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'conflicts'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [targetDetail, setTargetDetail] = useState<dutix.TargetDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [switchingApp, setSwitchingApp] = useState<string | null>(null)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const filteredTargets = targets.filter((t) => {
    const q = searchQuery.toLowerCase()
    return (
      t.extension?.toLowerCase().includes(q) ||
      t.uti?.toLowerCase().includes(q) ||
      t.default_app?.name?.toLowerCase().includes(q)
    )
  })

  const handleInspectTarget = async (targetId: string) => {
    setSelectedTarget(targetId)
    setLoadingDetail(true)
    try {
      const res = await ShowTarget(targetId)
      setTargetDetail(res)
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleQuickSwitch = async (targetIdentifier: string, appPathOrName: string) => {
    setSwitchingApp(appPathOrName)
    setAlert(null)

    // Extract app name from path if needed
    let cleanAppName = appPathOrName
    if (cleanAppName.includes('.app')) {
      const parts = cleanAppName.split('/')
      const last = parts[parts.length - 1]
      cleanAppName = last.replace('.app', '')
    }

    try {
      await SetHandler(cleanAppName, [targetIdentifier], [], [], false)
      setAlert({
        type: 'success',
        message: `Manipulador de '.${targetIdentifier}' alterado para '${cleanAppName}' com sucesso!`
      })
      await handleInspectTarget(targetIdentifier)
      onRefresh()
    } catch (e: any) {
      setAlert({ type: 'error', message: e?.message || 'Falha ao alterar manipulador.' })
    } finally {
      setSwitchingApp(null)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 overflow-y-auto h-full">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Inspetor de Alvos & Diagnóstico
          </h2>
          <p className="text-xs text-slate-400">
            Consulte manipuladores padrão para extensões, UTIs e protocolos. Detecte conflitos e bundles órfãos.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos os Alvos ({targets.length})
          </button>
          <button
            onClick={() => setActiveTab('conflicts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'conflicts'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Conflitos ({conflicts.length})</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            alert.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{alert.message}</span>
          </div>
          <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
        <input
          type="text"
          placeholder="Pesquisar por extensão (ex: pdf, json), UTI ou nome do app..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
        />
      </div>

      {/* Tab 1: All Targets */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Targets Table */}
          <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800/80 rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Extensão</th>
                    <th className="px-5 py-3 font-semibold">UTI Resolvido</th>
                    <th className="px-5 py-3 font-semibold">App Padrão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTargets.slice(0, 200).map((t, idx) => {
                    const isSelected = selectedTarget === t.extension
                    return (
                      <tr
                        key={idx}
                        onClick={() => handleInspectTarget(t.extension)}
                        className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-950/40 border-l-2 border-indigo-500' : ''
                        }`}
                      >
                        <td className="px-5 py-2.5 font-mono font-semibold text-indigo-300">
                          .{t.extension}
                        </td>
                        <td className="px-5 py-2.5 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                          {t.uti}
                        </td>
                        <td className="px-5 py-2.5 font-medium text-slate-200 truncate max-w-xs">
                          {t.default_app?.name || (
                            <span className="text-slate-600 italic">Não configurado</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Target Inspector Panel */}
          <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 space-y-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
              <SearchCode className="w-4 h-4 text-indigo-400" />
              <span>Inspetor do Alvo: {selectedTarget ? `.${selectedTarget}` : 'Nenhum selecionado'}</span>
            </div>

            {loadingDetail ? (
              <div className="py-20 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Consultando LaunchServices...</p>
              </div>
            ) : targetDetail ? (
              <div className="space-y-4 text-xs">
                {/* Current Default App */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Manipulador Padrão Atual
                  </span>
                  <div className="font-semibold text-sm text-emerald-400 font-mono break-all">
                    {targetDetail.defaultApp || 'Nenhum app padrão'}
                  </div>
                </div>

                {/* Resolved UTIs */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    UTIs Resolvidos ({targetDetail.resolvedUTIs?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {targetDetail.resolvedUTIs?.map((u) => (
                      <span
                        key={u}
                        className="px-2 py-0.5 rounded-md bg-purple-950/40 border border-purple-800/40 font-mono text-[10px] text-purple-300"
                      >
                        {u}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Available Candidate Apps (1-Click Switch) */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Aplicativos Candidatos Disponíveis ({targetDetail.availableApps?.length || 0})
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Clique em qualquer aplicativo para defini-lo como padrão instantaneamente:
                  </p>

                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {targetDetail.availableApps?.map((appPath) => {
                      const isCurrent = targetDetail.defaultApp === appPath
                      const appName = appPath.split('/').pop()?.replace('.app', '') || appPath
                      const isSwitching = switchingApp === appPath

                      return (
                        <div
                          key={appPath}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                            isCurrent
                              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                              : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="min-w-0 flex-1 mr-2">
                            <div className="font-semibold truncate">{appName}</div>
                            <div className="text-[9px] font-mono text-slate-500 truncate">{appPath}</div>
                          </div>

                          {isCurrent ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" /> Padrão
                            </span>
                          ) : (
                            <button
                              onClick={() => handleQuickSwitch(selectedTarget!, appName)}
                              disabled={isSwitching}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {isSwitching ? 'Alterando...' : 'Definir'}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                Selecione uma extensão na tabela para inspecionar
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Conflict Diagnostics */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          {conflicts.length === 0 ? (
            <div className="p-12 text-center bg-emerald-500/5 rounded-3xl border border-emerald-500/20 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-emerald-300">Sistema 100% Saudável!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Nenhum conflito ou bundle órfão foi encontrado. Todas as associações registradas apontam para aplicativos válidos e existentes no macOS.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-semibold text-amber-300">
                    {conflicts.length} Associações Órfãs Encontradas
                  </span>
                  <p className="text-amber-200/80">
                    Estes arquivos estão configurados para abrir com aplicativos que foram desinstalados ou movidos. Recomendamos reatribuir um novo app padrão.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Extensão</th>
                      <th className="px-6 py-3 font-semibold">App Registrado (Inexistente)</th>
                      <th className="px-6 py-3 font-semibold">Caminho do Bundle</th>
                      <th className="px-6 py-3 font-semibold text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {conflicts.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="px-6 py-3 text-rose-400 font-bold">.{c.extension}</td>
                        <td className="px-6 py-3 text-slate-200 font-sans font-medium">{c.registered_app_name}</td>
                        <td className="px-6 py-3 text-[10px] text-slate-500 truncate max-w-xs">{c.registered_app_path}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => {
                              setActiveTab('all')
                              handleInspectTarget(c.extension)
                            }}
                            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Reparar / Reatribuir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
