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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Snapshots & Rollback do Sistema
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Pontos de restauração do estado de associações de arquivos gerados automaticamente ou sob demanda.
          </p>
        </div>

        <button
          onClick={() => setIsManualModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Criar Snapshot Manual</span>
        </button>
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

      {/* Main Grid: Snapshots List & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Snapshots List */}
        <div className="lg:col-span-7 space-y-3">
          {snapshotList.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2 shadow-xs">
              <History className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Nenhum snapshot registrado</h3>
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
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-xs ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-sm'
                      : 'bg-white border-slate-200/90 hover:border-indigo-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shrink-0 shadow-2xs">
                        <History className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {snap.description}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                          <span>{new Date(snap.timestamp).toLocaleString()}</span>
                          <span>•</span>
                          <span className="text-indigo-600 font-bold">{snap.target_count} associações</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(snap.id)
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Excluir snapshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-medium">
                      Origem: {snap.created_by || 'sistema'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRestore(snap)
                      }}
                      disabled={isRestoring}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer active:scale-[0.97]"
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
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Detalhes do Snapshot</span>
            </div>
            {selectedSnapshot && (
              <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                {selectedSnapshot.id}
              </span>
            )}
          </div>

          {selectedSnapshot ? (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 font-mono text-[11px] shadow-2xs">
                <div className="text-slate-600">Total de Alvos: <strong className="text-slate-900">{selectedSnapshot.target_count}</strong></div>
                <div className="text-slate-600">Data/Hora: <strong className="text-indigo-700">{new Date(selectedSnapshot.timestamp).toLocaleString()}</strong></div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                  Mapeamentos Gravados ({selectedSnapshot.targets?.length || 0})
                </span>

                <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
                  {selectedSnapshot.targets?.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-indigo-700 font-bold truncate max-w-[120px]">
                        .{t.extension}
                      </span>
                      <span className="text-slate-700 truncate max-w-[160px] text-[11px] font-medium">
                        {t.default_app?.name || 'Nenhum'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs font-medium">
              Selecione um snapshot ao lado para ver todos os mapeamentos
            </div>
          )}
        </div>
      </div>

      {/* Create Manual Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Criar Snapshot Manual</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-700 font-bold">Descrição do Ponto de Restauração</label>
              <input
                type="text"
                placeholder="Ex: Antes de instalar ferramentas Adobe..."
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer border border-slate-200 shadow-2xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateManual}
                disabled={creating}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer active:scale-[0.98] shadow-2xs"
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
