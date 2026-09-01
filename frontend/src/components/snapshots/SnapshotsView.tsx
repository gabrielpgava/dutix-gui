import React, { useState } from 'react'
import {
  History,
  RotateCcw,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  X,
  Layers,
  FileCode
} from 'lucide-react'
import { snapshots, dutix } from '../../../wailsjs/go/models'
import {
  CreateSnapshot,
  RestoreSnapshot,
  DeleteSnapshot,
  GetSnapshot
} from '../../../wailsjs/go/main/App'

interface SnapshotsViewProps {
  snapshotList: snapshots.Snapshot[]
  loading: boolean
  onRefresh: () => void
}

export const SnapshotsView: React.FC<SnapshotsViewProps> = ({
  snapshotList,
  loading,
  onRefresh
}) => {
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [selectedSnapshot, setSelectedSnapshot] = useState<snapshots.Snapshot | null>(null)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [manualDescription, setManualDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleCreateManual = async () => {
    setCreating(true)
    setAlert(null)
    try {
      const snap = await CreateSnapshot(manualDescription.trim() || 'Snapshot manual do usuário')
      setIsManualModalOpen(false)
      setManualDescription('')
      setAlert({
        type: 'success',
        message: `Snapshot '${snap.id}' criado com sucesso (${snap.target_count} alvos)!`
      })
      onRefresh()
    } catch (e: any) {
      setAlert({ type: 'error', message: e?.message || 'Falha ao criar snapshot.' })
    } finally {
      setCreating(false)
    }
  }

  const handleRestore = async (snap: snapshots.Snapshot) => {
    if (!window.confirm(`Tem certeza que deseja restaurar as associações do snapshot '${snap.description}'?`)) {
      return
    }

    setRestoringId(snap.id)
    setAlert(null)

    try {
      const rep = await RestoreSnapshot(snap.id)
      if (rep.success) {
        setAlert({
          type: 'success',
          message: `Rollback concluído! ${rep.total_restored} associações restauradas com sucesso.`
        })
      } else {
        setAlert({
          type: 'error',
          message: `Rollback parcial: ${rep.total_restored} restauradas, ${rep.failed_count} falharam.`
        })
      }
      onRefresh()
    } catch (e: any) {
      setAlert({ type: 'error', message: e?.message || 'Falha ao restaurar snapshot.' })
    } finally {
      setRestoringId(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await DeleteSnapshot(id)
      if (selectedSnapshot?.id === id) setSelectedSnapshot(null)
      setAlert({ type: 'success', message: 'Snapshot excluído com sucesso.' })
      onRefresh()
    } catch (e: any) {
      setAlert({ type: 'error', message: e?.message || 'Falha ao excluir snapshot.' })
    }
  }

  const handleInspect = async (id: string) => {
    try {
      const data = await GetSnapshot(id)
      setSelectedSnapshot(data)
    } catch (e: any) {
      console.error(e)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Snapshots & Rollback do Sistema
          </h2>
          <p className="text-xs text-slate-400">
            Pontos de restauração do estado de associações de arquivos gerados automaticamente ou sob demanda.
          </p>
        </div>

        <button
          onClick={() => setIsManualModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Criar Snapshot Manual</span>
        </button>
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

      {/* Main Grid: Snapshots List & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Snapshots List */}
        <div className="lg:col-span-7 space-y-3">
          {snapshotList.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-2">
              <History className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">Nenhum snapshot registrado</h3>
              <p className="text-xs text-slate-500">
                Snapshots são criados automaticamente antes de aplicar alterações ou pelo botão &quot;Criar Snapshot Manual&quot;.
              </p>
            </div>
          ) : (
            snapshotList.map((snap) => {
              const isRestoring = restoringId === snap.id
              const isSelected = selectedSnapshot?.id === snap.id

              return (
                <div
                  key={snap.id}
                  onClick={() => handleInspect(snap.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 backdrop-blur-sm ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                        <History className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">
                          {snap.description}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{new Date(snap.timestamp).toLocaleString()}</span>
                          <span>•</span>
                          <span className="text-indigo-400">{snap.target_count} associações</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(snap.id)
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Excluir snapshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      Origem: {snap.created_by || 'sistema'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRestore(snap)
                      }}
                      disabled={isRestoring}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isRestoring ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      <span>Restaurar / Rollback</span>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Right: Snapshot Inspector Panel */}
        <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 space-y-4 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Detalhes do Snapshot</span>
            </div>
            {selectedSnapshot && (
              <span className="text-[10px] font-mono text-indigo-300">
                {selectedSnapshot.id}
              </span>
            )}
          </div>

          {selectedSnapshot ? (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="text-slate-400">Total de Alvos: <strong className="text-white">{selectedSnapshot.target_count}</strong></div>
                <div className="text-slate-400">Data/Hora: <strong className="text-indigo-300">{new Date(selectedSnapshot.timestamp).toLocaleString()}</strong></div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Mapeamentos Gravados ({selectedSnapshot.targets?.length || 0})
                </span>

                <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
                  {selectedSnapshot.targets?.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-indigo-300 font-semibold truncate max-w-[120px]">
                        .{t.extension}
                      </span>
                      <span className="text-slate-300 truncate max-w-[160px] text-[11px]">
                        {t.default_app?.name || 'Nenhum'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 text-xs">
              Selecione um snapshot ao lado para ver todos os mapeamentos
            </div>
          )}
        </div>
      </div>

      {/* Create Manual Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Criar Snapshot Manual</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-300 font-semibold">Descrição do Ponto de Restauração</label>
              <input
                type="text"
                placeholder="Ex: Antes de instalar ferramentas Adobe..."
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateManual}
                disabled={creating}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
              >
                {creating ? 'Criando...' : 'Salvar Snapshot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
