import React, { useState, useEffect } from 'react'
import {
  X,
  Terminal,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Search,
  Clock
} from 'lucide-react'
import { GetLogs, ClearLogs } from '../../../wailsjs/go/main/App'
import { logs } from '../../../wailsjs/go/models'
import { useAccessibleDialog } from '../../utils/useAccessibleDialog'

interface LogConsoleDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const LogConsoleDrawer: React.FC<LogConsoleDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const [logList, setLogList] = useState<logs.ExecutionLog[]>([])
  const [selectedLog, setSelectedLog] = useState<logs.ExecutionLog | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState('')

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const data = await GetLogs()
      setLogList(data.reverse())
      setError('')
      if (data.length > 0 && !selectedLog) {
        setSelectedLog(data[0])
      }
    } catch (e) {
      console.error(e)
      setError('Não foi possível carregar o histórico de logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchLogs()
    }
  }, [isOpen])

  const handleClear = async () => {
    setClearing(true)
    setError('')
    try {
      await ClearLogs()
      setLogList([])
      setSelectedLog(null)
    } catch (e) {
      console.error(e)
      setError('Não foi possível limpar o histórico de logs.')
    } finally {
      setClearing(false)
    }
  }

  const handleCopyRaw = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setError('')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
      setError('Não foi possível copiar o texto para a área de transferência.')
    }
  }

  const filteredLogs = logList.filter((l) => {
    const text = `${l.command} ${l.args?.join(' ')} ${l.stdout} ${l.stderr}`.toLowerCase()
    return text.includes(searchQuery.toLowerCase())
  })

  const dialogRef = useAccessibleDialog(isOpen, onClose, { modal: false })

  if (!isOpen) return null

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="logs-dialog-title"
      tabIndex={-1}
      className="fixed inset-y-0 right-0 z-50 w-full max-w-3xl bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
    >
      {/* Drawer Header */}
      <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 id="logs-dialog-title" className="text-sm font-semibold text-slate-900">Console de Execução CLI</h2>
            <p className="text-[11px] text-slate-500">Histórico de chamadas e saídas brutas do dutix</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading || clearing}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 transition-colors disabled:opacity-50 cursor-pointer border border-slate-200 active:scale-[0.96] shadow-2xs"
            title="Atualizar logs"
            aria-label="Atualizar logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleClear}
            disabled={loading || clearing}
            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors cursor-pointer border border-slate-200 active:scale-[0.96] shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            title="Limpar histórico"
            aria-label="Limpar histórico"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Fechar logs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Drawer Body - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left column: List */}
        <div className="w-72 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                aria-label="Filtrar execuções do dutix"
                placeholder="Filtrar execuções..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-2xs"
              />
            </div>
          </div>

          {error && <div role="alert" className="px-3 py-2 text-xs text-rose-800 bg-rose-50 border-b border-rose-200">{error}</div>}

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredLogs.length === 0 ? (
              <div role={loading && logList.length === 0 ? 'status' : undefined} className="text-center py-8 text-xs text-slate-500">
                {loading && logList.length === 0 ? 'Carregando logs...' : error ? 'O histórico de logs está indisponível.' : 'Nenhum log registrado'}
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id
                return (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-50 border-brand-300 text-brand-950 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        {log.success ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-600" />
                        )}
                        <span className="font-mono font-medium text-[11px] text-slate-900">
                          dutix {log.args?.[0] || ''}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {log.duration_ms}ms
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      {log.args?.slice(1).join(' ')}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right column: Log Details */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {selectedLog ? (
            <div className="flex-1 flex flex-col p-4 overflow-hidden space-y-4">
              {/* Command Details */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Comando Executado:</span>
                  <button
                    onClick={() => handleCopyRaw(`dutix ${selectedLog.args?.join(' ')}`)}
                    className="text-[11px] text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span aria-live="polite">{copied ? 'Copiado' : 'Copiar CLI'}</span>
                  </button>
                </div>
                <code className="text-xs font-mono text-brand-700 bg-white p-2.5 rounded-xl border border-slate-200 block break-all shadow-2xs">
                  dutix {selectedLog.args?.join(' ')}
                </code>

                <div className="flex items-center gap-4 text-[11px] text-slate-600 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Tempo: <strong className="text-slate-900">{selectedLog.duration_ms}ms</strong>
                  </span>
                  <span>
                    Exit Code: <strong className={selectedLog.exit_code === 0 ? 'text-emerald-600' : 'text-rose-600'}>{selectedLog.exit_code}</strong>
                  </span>
                </div>
              </div>

              {/* Output Tabs / Viewer */}
              <div className="flex-1 flex flex-col min-h-0 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-medium text-slate-300">
                  <span>Saída Padrão (STDOUT / STDERR)</span>
                  <button
                    onClick={() => handleCopyRaw(selectedLog.stdout || selectedLog.stderr)}
                    className="text-[11px] text-slate-500 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> <span aria-live="polite">{copied ? 'Copiado' : 'Copiar Saída'}</span>
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-100 whitespace-pre-wrap leading-relaxed select-text">
                  {selectedLog.stdout ? (
                    <span className="text-emerald-400">{selectedLog.stdout}</span>
                  ) : selectedLog.stderr ? (
                    <span className="text-rose-400">{selectedLog.stderr}</span>
                  ) : (
                    <span className="text-slate-500 italic">Nenhuma saída retornada</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
              Selecione uma execução para ver os detalhes
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
