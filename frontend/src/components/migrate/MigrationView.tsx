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
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Migração de Aplicativos</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Transfira automaticamente todas as associações de arquivos registradas de um aplicativo para outro.
        </p>
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

      {/* Visual Source -> Target Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
        {/* Source App (Origem) */}
        <div className="md:col-span-5 p-6 rounded-3xl bg-white border border-slate-200/90 space-y-4 relative shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Origem (De)
            </span>
            <span className="text-[10px] text-purple-700 font-mono font-semibold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">App Atual</span>
          </div>

          <div className="relative">
            <div
              onClick={() => setFromOpen(!fromOpen)}
              className="w-full p-4 bg-slate-50 border border-slate-200 hover:border-purple-400 rounded-2xl flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
            >
              {fromApp ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-sm shadow-2xs">
                    {fromApp.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{fromApp}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {apps.find((a) => a.name === fromApp)?.bundle_id || 'App de Origem'}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-slate-400 text-xs font-medium">Selecione o app de origem...</span>
              )}
              <Search className="w-4 h-4 text-slate-400" />
            </div>

            {fromOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-64 flex flex-col">
                <div className="p-3 border-b border-slate-200">
                  <input
                    type="text"
                    placeholder="Pesquisar aplicativo de origem..."
                    value={fromSearch}
                    onChange={(e) => setFromSearch(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-purple-500 font-medium"
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
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-100 flex items-center gap-3 text-xs text-slate-800 transition-colors cursor-pointer active:scale-[0.99]"
                    >
                      <div className="w-6 h-6 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold shrink-0">
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold truncate">{a.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{a.bundle_id}</div>
                      </div>
                      {fromApp === a.name && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Arrow Divider */}
        <div className="md:col-span-1 flex justify-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-indigo-600 shadow-2xs">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
        </div>

        {/* Destination App (Destino) */}
        <div className="md:col-span-5 p-6 rounded-3xl bg-white border border-slate-200/90 space-y-4 relative shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Destino (Para)
            </span>
            <span className="text-[10px] text-emerald-700 font-mono font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Novo App</span>
          </div>

          <div className="relative">
            <div
              onClick={() => setToOpen(!toOpen)}
              className="w-full p-4 bg-slate-50 border border-slate-200 hover:border-emerald-400 rounded-2xl flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
            >
              {toApp ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm shadow-2xs">
                    {toApp.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{toApp}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {apps.find((a) => a.name === toApp)?.bundle_id || 'App de Destino'}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-slate-400 text-xs font-medium">Selecione o app de destino...</span>
              )}
              <Search className="w-4 h-4 text-slate-400" />
            </div>

            {toOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-64 flex flex-col">
                <div className="p-3 border-b border-slate-200">
                  <input
                    type="text"
                    placeholder="Pesquisar aplicativo de destino..."
                    value={toSearch}
                    onChange={(e) => setToSearch(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 font-medium"
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
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-100 flex items-center gap-3 text-xs text-slate-800 transition-colors cursor-pointer active:scale-[0.99]"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold truncate">{a.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{a.bundle_id}</div>
                      </div>
                      {toApp === a.name && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Migration Presets */}
      <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800">Migrações Populares no macOS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => {
              setFromApp('TextEdit')
              setToApp('Visual Studio Code')
            }}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm text-left transition-all cursor-pointer group active:scale-[0.98] shadow-2xs"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
              TextEdit → VS Code
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Arquivos de texto puro, markdown e código</div>
          </button>

          <button
            onClick={() => {
              setFromApp('Safari')
              setToApp('Google Chrome')
            }}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm text-left transition-all cursor-pointer group active:scale-[0.98] shadow-2xs"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
              Safari → Google Chrome
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Documentos web, HTTP/HTTPS e bookmarks</div>
          </button>

          <button
            onClick={() => {
              setFromApp('QuickTime Player')
              setToApp('VLC')
            }}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm text-left transition-all cursor-pointer group active:scale-[0.98] shadow-2xs"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
              QuickTime → VLC
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Vídeos, áudios e containers de mídia</div>
          </button>
        </div>
      </div>

      {/* Migration Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>O dutix analisará todos os tipos suportados por ambos os apps antes de aplicar.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleAnalyzeMigration}
            disabled={analyzing || !fromApp || !toApp}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
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
