import React, { useState, useEffect } from 'react'
import {
  X,
  Sparkles,
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  RotateCw
} from 'lucide-react'
import {
  CheckForAppUpdate,
  DownloadAppUpdate,
  ApplyAppUpdateAndRestart
} from '../../../wailsjs/go/main/App'
import { autoupdate } from '../../../wailsjs/go/models'
import { EventsOn, EventsOff } from '../../../wailsjs/runtime/runtime'

interface UpdateModalProps {
  isOpen: boolean
  onClose: () => void
  initialUpdateInfo?: autoupdate.UpdateCheckResult | null
  onUpdateApplied?: () => void
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  initialUpdateInfo,
  onUpdateApplied
}) => {
  const [updateInfo, setUpdateInfo] = useState<autoupdate.UpdateCheckResult | null>(initialUpdateInfo || null)
  const [checking, setChecking] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [readyToRestart, setReadyToRestart] = useState(false)
  const [extractedAppPath, setExtractedAppPath] = useState('')
  const [progress, setProgress] = useState<{ percent: number; message: string }>({
    percent: 0,
    message: ''
  })
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (initialUpdateInfo) {
      setUpdateInfo(initialUpdateInfo)
    }
  }, [initialUpdateInfo])

  useEffect(() => {
    if (isOpen && !initialUpdateInfo) {
      handleCheckUpdate()
    }
  }, [isOpen])

  useEffect(() => {
    const handleProgress = (data: { percent: number; message: string }) => {
      setProgress(data)
    }
    EventsOn('autoupdate:download-progress', handleProgress)
    return () => {
      EventsOff('autoupdate:download-progress')
    }
  }, [])

  const handleCheckUpdate = async () => {
    setChecking(true)
    setErrorMsg('')
    try {
      const res = await CheckForAppUpdate()
      setUpdateInfo(res)
      if (!res.updateAvailable) {
        setSuccessMsg(`Você já está utilizando a versão mais recente (v${res.currentVersion}).`)
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Erro ao verificar atualizações no GitHub')
    } finally {
      setChecking(false)
    }
  }

  const handleStartDownload = async () => {
    setDownloading(true)
    setErrorMsg('')
    setSuccessMsg('')
    setProgress({ percent: 5, message: 'Iniciando download da atualização...' })

    try {
      const stagedPath = await DownloadAppUpdate()
      setExtractedAppPath(stagedPath)
      setReadyToRestart(true)
      setSuccessMsg('Download e preparação da nova versão concluídos!')
    } catch (e: any) {
      setErrorMsg(e?.message || 'Falha ao baixar e preparar a atualização.')
    } finally {
      setDownloading(false)
    }
  }

  const handleApplyAndRestart = async () => {
    if (!extractedAppPath) return
    setErrorMsg('')
    try {
      await ApplyAppUpdateAndRestart(extractedAppPath)
      if (onUpdateApplied) onUpdateApplied()
    } catch (e: any) {
      setErrorMsg(e?.message || 'Falha ao aplicar a atualização e reiniciar.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Atualização do Dutix GUI</h2>
              <p className="text-xs text-slate-500 font-medium">Mantenha a interface gráfica sempre atualizada com as novidades do GitHub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Version comparison banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/60 border border-indigo-100 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Versão Atual:</span>
                <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-xs">
                  v{updateInfo?.currentVersion || '...'}
                </span>
              </div>

              {updateInfo?.updateAvailable ? (
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-indigo-500" />
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Nova Versão:</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-lg border border-indigo-300 text-xs shadow-2xs">
                    v{updateInfo?.latestVersion}
                  </span>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Atualizado
                </span>
              )}
            </div>

            {updateInfo?.publishedAt && (
              <p className="text-[11px] text-slate-500">
                Publicado em: <span className="font-semibold text-slate-700">{updateInfo.publishedAt}</span>
              </p>
            )}
          </div>

          {/* Release Notes */}
          {updateInfo?.releaseNotes && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Novidades & Notas da Release</h3>
                {updateInfo.releaseUrl && (
                  <a
                    href={updateInfo.releaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline"
                  >
                    Ver no GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-relaxed">
                {updateInfo.releaseNotes}
              </div>
            </div>
          )}

          {/* Download Progress */}
          {downloading && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2 shadow-2xs">
              <div className="flex justify-between text-[11px] font-semibold text-indigo-900">
                <span>{progress.message}</span>
                <span className="font-mono font-bold">{Math.round(progress.percent)}%</span>
              </div>
              <div className="w-full h-2.5 bg-indigo-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300 shadow-2xs"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            onClick={handleCheckUpdate}
            disabled={checking || downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-[0.97] shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Verificando...' : 'Verificar Novamente'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={downloading}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200 shadow-2xs disabled:opacity-50"
            >
              {readyToRestart ? 'Mais tarde' : 'Fechar'}
            </button>

            {readyToRestart ? (
              <button
                onClick={handleApplyAndRestart}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer active:scale-[0.97]"
              >
                <RotateCw className="w-4 h-4" />
                <span>Reiniciar e Aplicar</span>
              </button>
            ) : updateInfo?.updateAvailable ? (
              <button
                onClick={handleStartDownload}
                disabled={downloading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer active:scale-[0.97] disabled:opacity-50"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>{downloading ? 'Baixando...' : 'Atualizar Agora'}</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
