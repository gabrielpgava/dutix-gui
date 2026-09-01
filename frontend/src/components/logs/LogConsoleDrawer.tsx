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

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const data = await GetLogs()
      setLogList(data.reverse())
      if (data.length > 0 && !selectedLog) {
        setSelectedLog(data[0])
      }
    } catch (e) {
      console.error(e)
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
    try {
      await ClearLogs()
      setLogList([])
      setSelectedLog(null)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCopyRaw = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredLogs = logList.filter(l => {
    const text = `${l.command} ${l.args?.join(' ')} ${l.stdout} ${l.stderr}`.toLowerCase()
    return text.includes(searchQuery.toLowerCase())
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-3xl bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Console de Execução CLI</h2>
            <p className="text-[11px] text-slate-400">Histórico de chamadas e saídas brutas do dutix</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
            title="Atualizar logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
            title="Limpar histórico"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Drawer Body - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left column: List */}
        <div className="w-72 border-r border-slate-800/80 flex flex-col bg-slate-900/30">
          <div className="p-3 border-b border-slate-800/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filtrar execuções..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">Nenhum log registrado</div>
            ) : (
              filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id
                return (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/40 text-white'
                        : 'bg-slate-900/40 border-slate-800/40 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        {log.success ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-400" />
                        )}
                        <span className="font-mono font-medium text-[11px] text-slate-200">
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
        <div className="flex-1 flex flex-col bg-slate-950/70 overflow-hidden">
          {selectedLog ? (
            <div className="flex-1 flex flex-col p-4 overflow-hidden space-y-4">
              {/* Command Details */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Comando Executado:</span>
                  <button
                    onClick={() => handleCopyRaw(`dutix ${selectedLog.args?.join(' ')}`)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copiado' : 'Copiar CLI'}</span>
                  </button>
                </div>
                <code className="text-xs font-mono text-indigo-300 bg-slate-950 p-2 rounded-lg border border-slate-800 block break-all">
                  dutix {selectedLog.args?.join(' ')}
                </code>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Tempo: <strong className="text-slate-300">{selectedLog.duration_ms}ms</strong>
                  </span>
                  <span>
                    Exit Code: <strong className={selectedLog.exit_code === 0 ? 'text-emerald-400' : 'text-rose-400'}>{selectedLog.exit_code}</strong>
                  </span>
                </div>
              </div>

              {/* Output Tabs / Viewer */}
              <div className="flex-1 flex flex-col min-h-0 bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-medium text-slate-400">
                  <span>Saída Padrão (STDOUT / STDERR)</span>
                  <button
                    onClick={() => handleCopyRaw(selectedLog.stdout || selectedLog.stderr)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> Copiar Saída
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
                  {selectedLog.stdout ? (
                    <span className="text-emerald-300/90">{selectedLog.stdout}</span>
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
