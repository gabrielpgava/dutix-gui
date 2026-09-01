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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Inspetor de Alvos & Diagnóstico
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Consulte manipuladores padrão para extensões, UTIs e protocolos. Detecte conflitos e bundles órfãos.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 shrink-0 shadow-2xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos os Alvos ({targets.length})
          </button>
          <button
            onClick={() => setActiveTab('conflicts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'conflicts'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
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
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between font-medium ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{alert.message}</span>
          </div>
          <button onClick={() => setAlert(null)} className="text-slate-500 hover:text-slate-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Pesquisar por extensão (ex: pdf, json), UTI ou nome do app..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 transition-colors shadow-2xs font-medium"
        />
      </div>

      {/* Tab 1: All Targets */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Targets Table */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-5 py-3 font-bold">Extensão</th>
                    <th className="px-5 py-3 font-bold">UTI Resolvido</th>
                    <th className="px-5 py-3 font-bold">App Padrão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTargets.slice(0, 200).map((t, idx) => {
                    const isSelected = selectedTarget === t.extension
                    return (
                      <tr
                        key={idx}
                        onClick={() => handleInspectTarget(t.extension)}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-50/70 border-l-2 border-indigo-600' : ''
                        }`}
                      >
                        <td className="px-5 py-3 font-mono font-bold text-indigo-700">
                          .{t.extension}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-slate-500 truncate max-w-xs">
                          {t.uti}
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-800 truncate max-w-xs">
                          {t.default_app?.name || (
                            <span className="text-slate-400 italic">Não configurado</span>
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
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              <SearchCode className="w-4 h-4 text-indigo-600" />
              <span>Inspetor do Alvo: {selectedTarget ? `.${selectedTarget}` : 'Nenhum selecionado'}</span>
            </div>

            {loadingDetail ? (
              <div className="py-20 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Consultando LaunchServices...</p>
              </div>
            ) : targetDetail ? (
              <div className="space-y-4 text-xs">
                {/* Current Default App */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                    Manipulador Padrão Atual
                  </span>
                  <div className="font-bold text-sm text-emerald-700 font-mono break-all">
                    {targetDetail.defaultApp || 'Nenhum app padrão'}
                  </div>
                </div>

                {/* Resolved UTIs */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                    UTIs Resolvidos ({targetDetail.resolvedUTIs?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {targetDetail.resolvedUTIs?.map((u) => (
                      <span
                        key={u}
                        className="px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200 font-mono text-[10px] text-purple-700 font-medium"
                      >
                        {u}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Available Candidate Apps (1-Click Switch) */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                    Aplicativos Candidatos Disponíveis ({targetDetail.availableApps?.length || 0})
                  </span>
                  <p className="text-xs text-slate-600 font-normal">
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
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                              : 'bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <div className="min-w-0 flex-1 mr-2">
                            <div className="font-bold truncate">{appName}</div>
                            <div className="text-[10px] font-mono text-slate-500 truncate">{appPath}</div>
                          </div>

                          {isCurrent ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                              <Check className="w-3 h-3" /> Padrão
                            </span>
                          ) : (
                            <button
                              onClick={() => handleQuickSwitch(selectedTarget!, appName)}
                              disabled={isSwitching}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer active:scale-[0.96] shadow-2xs"
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
              <div className="py-16 text-center text-slate-400 text-xs font-medium">
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
            <div className="p-12 text-center bg-emerald-50 rounded-3xl border border-emerald-200 space-y-3 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-800">Sistema 100% Saudável!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
                Nenhum conflito ou bundle órfão foi encontrado. Todas as associações registradas apontam para aplicativos válidos e existentes no macOS.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-2xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-amber-800">
                    {conflicts.length} Associações Órfãs Encontradas
                  </span>
                  <p className="text-amber-800/90 font-medium">
                    Estes arquivos estão configurados para abrir com aplicativos que foram desinstalados ou movidos. Recomendamos reatribuir um novo app padrão.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-bold">Extensão</th>
                      <th className="px-6 py-3 font-bold">App Registrado (Inexistente)</th>
                      <th className="px-6 py-3 font-bold">Caminho do Bundle</th>
                      <th className="px-6 py-3 font-bold text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {conflicts.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-rose-600 font-bold">.{c.extension}</td>
                        <td className="px-6 py-3 text-slate-800 font-sans font-bold">{c.registered_app_name}</td>
                        <td className="px-6 py-3 text-xs text-slate-500 truncate max-w-xs">{c.registered_app_path}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => {
                              setActiveTab('all')
                              handleInspectTarget(c.extension)
                            }}
                            className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-bold transition-all cursor-pointer active:scale-[0.96] shadow-2xs"
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
