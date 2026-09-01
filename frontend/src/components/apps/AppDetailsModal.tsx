import React, { useState, useEffect } from 'react'
import {
  X,
  Package,
  Layers,
  FileCode,
  Globe,
  ExternalLink,
  Sparkles,
  ArrowRightLeft,
  Copy,
  Check,
  Search
} from 'lucide-react'
import { ShowApp } from '../../../wailsjs/go/main/App'
import { dutix } from '../../../wailsjs/go/models'

interface AppDetailsModalProps {
  appName: string | null
  isOpen: boolean
  onClose: () => void
  onSetAsDefault: (appName: string, exts: string[], utis: string[]) => void
  onMigrateApp: (appName: string) => void
}

export const AppDetailsModal: React.FC<AppDetailsModalProps> = ({
  appName,
  isOpen,
  onClose,
  onSetAsDefault,
  onMigrateApp
}) => {
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<dutix.AppDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen && appName) {
      setLoading(true)
      setError(null)
      ShowApp(appName)
        .then((res) => {
          setDetail(res)
        })
        .catch((err) => {
          setError(err?.message || 'Falha ao carregar detalhes do app')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [isOpen, appName])

  if (!isOpen || !appName) return null

  // Extract all unique supported extensions
  const allExtensions: string[] = []
  detail?.supportedTypes?.forEach((st) => {
    st.extensions?.forEach((ext) => {
      if (ext && !allExtensions.includes(ext)) {
        allExtensions.push(ext)
      }
    })
  })

  // Extract all unique UTIs
  const allUTIs: string[] = []
  detail?.supportedTypes?.forEach((st) => {
    st.utis?.forEach((u) => {
      if (u && !allUTIs.includes(u)) {
        allUTIs.push(u)
      }
    })
  })

  const filteredExtensions = allExtensions.filter((e) =>
    e.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCopyPath = () => {
    if (detail?.app?.path) {
      navigator.clipboard.writeText(detail.app.path)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-2xs">
              {appName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{appName}</h2>
              <p className="text-xs text-slate-500 font-mono">
                {detail?.app?.bundle_id || 'Carregando...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {loading ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-medium">Consultando LaunchServices para {appName}...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {error}
            </div>
          ) : (
            <>
              {/* App Info Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">Caminho do Pacote (.app):</span>
                  <button
                    onClick={handleCopyPath}
                    className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar Caminho'}</span>
                  </button>
                </div>
                <code className="text-xs font-mono text-slate-800 block break-all bg-white p-2.5 rounded-xl border border-slate-200">
                  {detail?.app?.path}
                </code>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onSetAsDefault(appName, allExtensions, allUTIs)
                    onClose()
                  }}
                  disabled={allExtensions.length === 0}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Definir como Padrão</span>
                </button>

                <button
                  onClick={() => {
                    onMigrateApp(appName)
                    onClose()
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 transition-all cursor-pointer active:scale-[0.98] shadow-2xs"
                >
                  <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                  <span>Migrar deste App</span>
                </button>
              </div>

              {/* Supported Extensions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <FileCode className="w-4 h-4 text-indigo-600" />
                    <span>Extensões Suportadas ({allExtensions.length})</span>
                  </div>
                  {allExtensions.length > 8 && (
                    <div className="relative w-48">
                      <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Filtrar extensões..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-indigo-500 font-medium"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  {filteredExtensions.length === 0 ? (
                    <span className="text-slate-400 italic">Nenhuma extensão encontrada</span>
                  ) : (
                    filteredExtensions.map((ext) => (
                      <span
                        key={ext}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-indigo-700 font-mono text-xs font-semibold shadow-2xs"
                      >
                        .{ext}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Supported Content Types (UTIs) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>Tipos de Conteúdo / UTIs ({detail?.supportedTypes?.length || 0})</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {detail?.supportedTypes?.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                    >
                      <div className="font-bold text-slate-900 text-xs">{t.name || 'Tipo sem nome'}</div>
                      <div className="flex flex-wrap gap-1 text-[11px] font-mono text-purple-700">
                        {t.utis?.map((uti: string) => (
                          <span key={uti} className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 font-medium">
                            {uti}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 active:scale-[0.97] shadow-2xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
