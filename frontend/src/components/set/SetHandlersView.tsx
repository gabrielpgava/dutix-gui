import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Search,
  Check,
  Plus,
  X,
  Play,
  Clock,
  Layers,
  FileCode,
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
  Globe,
  AlertCircle,
  CheckCircle2,
  Command
} from 'lucide-react'
import { dutix } from '../../../wailsjs/go/models'
import { SetHandler } from '../../../wailsjs/go/main/App'
import { DryRunPreviewModal } from './DryRunPreviewModal'

interface SetHandlersViewProps {
  apps: dutix.AppInfo[]
  initialApp?: string | null
  initialExtensions?: string[]
  initialUTIs?: string[]
  onSuccess: () => void
}

interface ExtensionCategory {
  id: string
  name: string
  icon: any
  extensions: string[]
}

const CATEGORIES: ExtensionCategory[] = [
  {
    id: 'code',
    name: 'Código & Web Dev',
    icon: FileCode,
    extensions: ['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'scss', 'py', 'go', 'rs', 'c', 'cpp', 'h', 'php', 'rb', 'java', 'sql', 'sh', 'yaml', 'yml', 'toml', 'env']
  },
  {
    id: 'docs',
    name: 'Documentos & Texto',
    icon: FileText,
    extensions: ['txt', 'md', 'rtf', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'log']
  },
  {
    id: 'images',
    name: 'Imagens & Vetores',
    icon: ImageIcon,
    extensions: ['png', 'jpg', 'jpeg', 'svg', 'svgz', 'webp', 'gif', 'bmp', 'ico', 'tiff', 'tif', 'heic', 'avif', 'psd', 'ai']
  },
  {
    id: 'media',
    name: 'Áudio & Vídeo',
    icon: Film,
    extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'mp3', 'flac', 'wav', 'm4a', 'aac', 'ogg', 'opus']
  },
  {
    id: 'archives',
    name: 'Arquivos & Pacotes',
    icon: Archive,
    extensions: ['zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar', 'dmg', 'iso']
  }
]

const COMMON_SCHEMES = ['http', 'https', 'mailto', 'ssh', 'ftp', 'tg', 'slack']

export const SetHandlersView: React.FC<SetHandlersViewProps> = ({
  apps,
  initialApp,
  initialExtensions = [],
  initialUTIs = [],
  onSuccess
}) => {
  const [selectedApp, setSelectedApp] = useState<string>(initialApp || '')
  const [appSearch, setAppSearch] = useState('')
  const [isAppDropdownOpen, setIsAppDropdownOpen] = useState(false)

  const [selectedExtensions, setSelectedExtensions] = useState<string[]>(initialExtensions)
  const [customInput, setCustomInput] = useState('')
  const [selectedSchemes, setSelectedSchemes] = useState<string[]>([])
  const [selectedUTIs, setSelectedUTIs] = useState<string[]>(initialUTIs)

  const [dryRunModalOpen, setDryRunModalOpen] = useState(false)
  const [dryRunResult, setDryRunResult] = useState<dutix.DryRunResult | null>(null)
  const [loadingDryRun, setLoadingDryRun] = useState(false)
  const [applying, setApplying] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (initialApp) setSelectedApp(initialApp)
    if (initialExtensions.length > 0) setSelectedExtensions(initialExtensions)
    if (initialUTIs.length > 0) setSelectedUTIs(initialUTIs)
  }, [initialApp, initialExtensions, initialUTIs])

  // Keyboard shortcut listener for Cmd + Enter to simulate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (selectedApp && (selectedExtensions.length > 0 || selectedSchemes.length > 0 || selectedUTIs.length > 0)) {
          handleSimulate()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedApp, selectedExtensions, selectedSchemes, selectedUTIs])

  const filteredApps = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.bundle_id?.toLowerCase().includes(appSearch.toLowerCase())
  )

  const toggleExtension = (ext: string) => {
    setSelectedExtensions((prev) =>
      prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext]
    )
  }

  const toggleCategory = (cat: ExtensionCategory) => {
    const allSelected = cat.extensions.every((e) => selectedExtensions.includes(e))
    if (allSelected) {
      setSelectedExtensions((prev) => prev.filter((e) => !cat.extensions.includes(e)))
    } else {
      setSelectedExtensions((prev) => Array.from(new Set([...prev, ...cat.extensions])))
    }
  }

  const toggleScheme = (scheme: string) => {
    setSelectedSchemes((prev) =>
      prev.includes(scheme) ? prev.filter((s) => s !== scheme) : [...prev, scheme]
    )
  }

  const handleAddCustom = () => {
    if (!customInput.trim()) return
    const cleaned = customInput
      .toLowerCase()
      .replace(/^\./, '')
      .split(/[\s,]+/)
      .filter((s) => s.length > 0)

    setSelectedExtensions((prev) => Array.from(new Set([...prev, ...cleaned])))
    setCustomInput('')
  }

  const handleSimulate = async () => {
    if (!selectedApp) {
      setAlert({ type: 'error', message: 'Selecione um aplicativo de destino primeiro.' })
      return
    }
    if (selectedExtensions.length === 0 && selectedSchemes.length === 0 && selectedUTIs.length === 0) {
      setAlert({ type: 'error', message: 'Selecione ao menos uma extensão, UTI ou esquema URL.' })
      return
    }

    setLoadingDryRun(true)
    setAlert(null)

    try {
      const res = await SetHandler(selectedApp, selectedExtensions, selectedUTIs, selectedSchemes, true)
      setDryRunResult(res)
      setDryRunModalOpen(true)
    } catch (e: any) {
      setAlert({ type: 'error', message: e?.message || 'Falha ao executar simulação dry-run.' })
    } finally {
      setLoadingDryRun(false)
    }
  }

  const handleApplyChanges = async () => {
    if (!selectedApp) return
    setApplying(true)
    setAlert(null)

    try {
      await SetHandler(selectedApp, selectedExtensions, selectedUTIs, selectedSchemes, false)
      setDryRunModalOpen(false)
      setAlert({
        type: 'success',
        message: `Associações para '${selectedApp}' aplicadas com sucesso! Snapshot de segurança gerado.`
      })
      onSuccess()
    } catch (e: any) {
      setAlert({ type: 'error', message: e?.message || 'Erro ao aplicar alterações no sistema.' })
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto h-full">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Associação Rápida de Aplicativos</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Defina o aplicativo padrão do macOS para extensões de arquivo, identificadores de tipo (UTIs) e protocolos web.
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

      {/* Step 1: Target App Selection */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-mono font-bold shadow-2xs">
            1
          </div>
          <span>Selecione o Aplicativo de Destino</span>
        </div>

        <div className="relative">
          <div
            onClick={() => setIsAppDropdownOpen(!isAppDropdownOpen)}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 hover:border-indigo-400 rounded-2xl flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
          >
            {selectedApp ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                  {selectedApp.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">{selectedApp}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {apps.find((a) => a.name === selectedApp)?.bundle_id || 'App selecionado'}
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-slate-400 text-xs font-medium">Clique para selecionar um aplicativo...</span>
            )}
            <Search className="w-4 h-4 text-slate-400" />
          </div>

          {/* Searchable Dropdown */}
          {isAppDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-64 flex flex-col">
              <div className="p-3 border-b border-slate-200">
                <input
                  type="text"
                  placeholder="Pesquisar aplicativo..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-indigo-500 font-medium"
                />
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredApps.map((a) => (
                  <button
                    key={a.bundle_id || a.name}
                    onClick={() => {
                      setSelectedApp(a.name)
                      setIsAppDropdownOpen(false)
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-100 flex items-center gap-3 text-xs text-slate-800 transition-colors cursor-pointer active:scale-[0.99]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                      {a.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate">{a.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{a.bundle_id}</div>
                    </div>
                    {selectedApp === a.name && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Extensions & Categories */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-mono font-bold shadow-2xs">
              2
            </div>
            <span>Selecione as Extensões e Tipos de Arquivo</span>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            <strong className="text-indigo-600 font-bold">{selectedExtensions.length}</strong> extensões selecionadas
          </div>
        </div>

        {/* Categories Chips */}
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isAllSelected = cat.extensions.every((e) => selectedExtensions.includes(e))

            return (
              <div key={cat.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Icon className="w-4 h-4 text-indigo-600" />
                    <span>{cat.name}</span>
                  </div>
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                  >
                    {isAllSelected ? 'Desmarcar Todos' : 'Selecionar Categoria'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cat.extensions.map((ext) => {
                    const isSelected = selectedExtensions.includes(ext)
                    return (
                      <button
                        key={ext}
                        onClick={() => toggleExtension(ext)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer active:scale-[0.95] ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-slate-900'
                        }`}
                      >
                        .{ext}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Custom Extension Input */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Adicionar Extensões Personalizadas</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite extensões (ex: log, ini, dat, rfb) e pressione Enter..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCustom()
                }
              }}
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 font-mono font-medium"
            />
            <button
              onClick={handleAddCustom}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer active:scale-[0.97] shadow-2xs"
            >
              Adicionar
            </button>
          </div>
        </div>

        {/* URL Schemes */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-600" />
            <span>Esquemas de Protocolo / URL Schemes</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMON_SCHEMES.map((scheme) => {
              const isSelected = selectedSchemes.includes(scheme)
              return (
                <button
                  key={scheme}
                  onClick={() => toggleScheme(scheme)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer active:scale-[0.95] ${
                    isSelected
                      ? 'bg-sky-600 border-sky-600 text-white shadow-2xs font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-sky-300 hover:text-slate-900'
                  }`}
                >
                  {scheme}://
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="text-xs text-slate-600 font-medium">
          Pronto para associar <strong className="text-slate-900 font-bold">{selectedExtensions.length} extensões</strong> ao app{' '}
          <strong className="text-indigo-600 font-bold">{selectedApp || '(Nenhum app selecionado)'}</strong>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleSimulate}
            disabled={loadingDryRun || !selectedApp}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98] shadow-2xs"
            title="Simular alterações (Atalho: ⌘ + Enter)"
          >
            {loadingDryRun ? (
              <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Clock className="w-4 h-4 text-indigo-600" />
            )}
            <span>Simular Alterações (--dry-run)</span>
          </button>

          <button
            onClick={handleApplyChanges}
            disabled={applying || !selectedApp}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
          >
            {applying ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>Aplicar Alterações</span>
          </button>
        </div>
      </div>

      {/* Dry Run Preview Modal */}
      <DryRunPreviewModal
        isOpen={dryRunModalOpen}
        onClose={() => setDryRunModalOpen(false)}
        onConfirmApply={handleApplyChanges}
        dryRunResult={dryRunResult}
        applying={applying}
        appName={selectedApp}
      />
    </div>
  )
}
