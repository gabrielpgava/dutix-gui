import React, { useState, useEffect } from 'react'
import {
  ArrowRightLeft,
  Search,
  Check,
  Play,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react'
import { dutix } from '../../../wailsjs/go/models'
import { MigrateApps } from '../../../wailsjs/go/main/App'
import { DryRunPreviewModal } from '../set/DryRunPreviewModal'

interface MigrationViewProps {
  apps: dutix.AppInfo[]
  initialSourceApp?: string | null
  onSuccess: () => void
}

export const MigrationView: React.FC<MigrationViewProps> = ({
  apps,
  initialSourceApp,
  onSuccess
}) => {
  const [fromApp, setFromApp] = useState<string>(initialSourceApp || '')
  const [toApp, setToApp] = useState<string>('')
  const [fromSearch, setFromSearch] = useState('')
  const [toSearch, setToSearch] = useState('')
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)

  const [dryRunResult, setDryRunResult] = useState<dutix.DryRunResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (initialSourceApp) setFromApp(initialSourceApp)
  }, [initialSourceApp])

  const filteredFromApps = apps.filter((a) =>
    a.name.toLowerCase().includes(fromSearch.toLowerCase())
  )
  const filteredToApps = apps.filter(
    (a) => a.name !== fromApp && a.name.toLowerCase().includes(toSearch.toLowerCase())
  )

  const handleAnalyzeMigration = async () => {
    if (!fromApp || !toApp) {
      setAlert({ type: 'error', message: 'Selecione o aplicativo de origem e o de destino.' })
      return
    }

    setAnalyzing(true)
    setAlert(null)

    try {
      const res = await MigrateApps(fromApp, toApp, true)
      setDryRunResult(res)
      setModalOpen(true)
    } catch (e: any) {
      setAlert({ type: 'error', message: e?.message || 'Falha ao analisar plano de migração.' })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleExecuteMigration = async () => {
    if (!fromApp || !toApp) return
    setMigrating(true)
    setAlert(null)

    try {
      await MigrateApps(fromApp, toApp, false)
      setModalOpen(false)
      setAlert({
        type: 'success',
        message: `Migração de '${fromApp}' para '${toApp}' executada com sucesso! Snapshot de segurança criado.`
      })
      onSuccess()
    } catch (e: any) {
      setAlert({ type: 'error', message: e?.message || 'Erro ao executar migração.' })
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto h-full">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Migração de Aplicativos</h2>
        <p className="text-xs text-slate-400">
          Transfira automaticamente todas as associações de arquivos registradas de um aplicativo para outro.
        </p>
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

      {/* Visual Source -> Target Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
        {/* Source App (Origem) */}
        <div className="md:col-span-5 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 backdrop-blur-sm relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Origem (De)
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">App Atual</span>
          </div>

          <div className="relative">
            <div
              onClick={() => setFromOpen(!fromOpen)}
              className="w-full p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
            >
              {fromApp ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                    {fromApp.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{fromApp}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {apps.find((a) => a.name === fromApp)?.bundle_id || 'App de Origem'}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-slate-500 text-xs">Selecione o app de origem...</span>
              )}
              <Search className="w-4 h-4 text-slate-500" />
            </div>

            {fromOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-64 flex flex-col">
                <div className="p-3 border-b border-slate-800">
                  <input
                    type="text"
                    placeholder="Pesquisar aplicativo de origem..."
                    value={fromSearch}
                    onChange={(e) => setFromSearch(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredFromApps.map((a) => (
                    <button
                      key={a.bundle_id || a.name}
                      onClick={() => {
                        setFromApp(a.name)
                        setFromOpen(false)
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center gap-3 text-xs text-slate-200 transition-colors cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs font-bold shrink-0">
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{a.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{a.bundle_id}</div>
                      </div>
                      {fromApp === a.name && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Arrow Divider */}
        <div className="md:col-span-1 flex justify-center">
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-md">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
        </div>

        {/* Destination App (Destino) */}
        <div className="md:col-span-5 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 backdrop-blur-sm relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Destino (Para)
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Novo App</span>
          </div>

          <div className="relative">
            <div
              onClick={() => setToOpen(!toOpen)}
              className="w-full p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
            >
              {toApp ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    {toApp.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{toApp}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {apps.find((a) => a.name === toApp)?.bundle_id || 'App de Destino'}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-slate-500 text-xs">Selecione o app de destino...</span>
              )}
              <Search className="w-4 h-4 text-slate-500" />
            </div>

            {toOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-64 flex flex-col">
                <div className="p-3 border-b border-slate-800">
                  <input
                    type="text"
                    placeholder="Pesquisar aplicativo de destino..."
                    value={toSearch}
                    onChange={(e) => setToSearch(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredToApps.map((a) => (
                    <button
                      key={a.bundle_id || a.name}
                      onClick={() => {
                        setToApp(a.name)
                        setToOpen(false)
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center gap-3 text-xs text-slate-200 transition-colors cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{a.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{a.bundle_id}</div>
                      </div>
                      {toApp === a.name && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Migration Presets */}
      <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300">Migrações Populares no macOS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => {
              setFromApp('TextEdit')
              setToApp('Visual Studio Code')
            }}
            className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="font-semibold text-xs text-white group-hover:text-indigo-300">
              TextEdit → VS Code
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Arquivos de texto puro, markdown e código</div>
          </button>

          <button
            onClick={() => {
              setFromApp('Safari')
              setToApp('Google Chrome')
            }}
            className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="font-semibold text-xs text-white group-hover:text-indigo-300">
              Safari → Google Chrome
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Documentos web, HTTP/HTTPS e bookmarks</div>
          </button>

          <button
            onClick={() => {
              setFromApp('QuickTime Player')
              setToApp('VLC')
            }}
            className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="font-semibold text-xs text-white group-hover:text-indigo-300">
              QuickTime → VLC
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Vídeos, áudios e containers de mídia</div>
          </button>
        </div>
      </div>

      {/* Migration Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>O dutix analisará todos os tipos suportados por ambos os apps antes de aplicar.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleAnalyzeMigration}
            disabled={analyzing || !fromApp || !toApp}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
          >
            {analyzing ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span>Analisar Plano de Migração (--dry-run)</span>
          </button>
        </div>
      </div>

      {/* Dry Run Preview Modal */}
      <DryRunPreviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirmApply={handleExecuteMigration}
        dryRunResult={dryRunResult}
        applying={migrating}
        appName={toApp}
      />
    </div>
  )
}
