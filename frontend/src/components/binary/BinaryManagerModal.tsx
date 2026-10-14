import React, { useState, useEffect } from 'react'
import {
  X,
  Cpu,
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  Check
} from 'lucide-react'
import {
  GetBinaryStatus,
  CheckForUpdates,
  DownloadAndInstallBinary,
  SetCustomBinaryPath
} from '../../../wailsjs/go/main/App'
import { dutix, binary } from '../../../wailsjs/go/models'
import { EventsOn, EventsOff } from '../../../wailsjs/runtime/runtime'
import { useAccessibleDialog } from '../../utils/useAccessibleDialog'

interface BinaryManagerModalProps {
  isOpen: boolean
  onClose: () => void
  onStatusChanged: () => void
}

export const BinaryManagerModal: React.FC<BinaryManagerModalProps> = ({
  isOpen,
  onClose,
  onStatusChanged
}) => {
  const [status, setStatus] = useState<dutix.BinaryStatus | null>(null)
  const [statusLoadFailed, setStatusLoadFailed] = useState(false)
  const [release, setRelease] = useState<binary.GitHubRelease | null>(null)
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<{ percent: number; message: string }>({
    percent: 0,
    message: ''
  })
  const [customPathInput, setCustomPathInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const fetchStatus = async () => {
    try {
      const s = await GetBinaryStatus()
      setStatus(s)
      setStatusLoadFailed(false)
      if (s.path) setCustomPathInput(s.path)
    } catch (e: any) {
      console.error(e)
      setStatus(null)
      setStatusLoadFailed(true)
      setErrorMsg(e?.message || 'Falha ao consultar o status do binário dutix.')
    }
  }

  useEffect(() => {
    if (isOpen) {
      setStatus(null)
      setStatusLoadFailed(false)
      setErrorMsg('')
      fetchStatus()
      setSuccessMsg('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleProgress = (data: { percent: number; message: string }) => {
      setDownloadProgress(data)
    }
    EventsOn('binary:download-progress', handleProgress)
    return () => {
      EventsOff('binary:download-progress')
    }
  }, [])

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true)
    setErrorMsg('')
    try {
      const rel = await CheckForUpdates()
      setRelease(rel)
    } catch (e: any) {
      setErrorMsg(e?.message || 'Falha ao buscar releases no GitHub')
    } finally {
      setCheckingUpdate(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    setErrorMsg('')
    setSuccessMsg('')
    setDownloadProgress({ percent: 0, message: 'Iniciando download...' })

    try {
      const installedPath = await DownloadAndInstallBinary()
      setSuccessMsg(`Binário dutix instalado com sucesso em: ${installedPath}`)
      await fetchStatus()
      onStatusChanged()
    } catch (e: any) {
      setErrorMsg(e?.message || 'Falha ao baixar e instalar o binário')
    } finally {
      setDownloading(false)
    }
  }

  const handleSaveCustomPath = async () => {
    if (!customPathInput.trim()) return
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await SetCustomBinaryPath(customPathInput.trim())
      setSuccessMsg('Caminho do binário atualizado com sucesso!')
      await fetchStatus()
      onStatusChanged()
    } catch (e: any) {
      setErrorMsg(e?.message || 'Caminho de binário inválido')
    }
  }

  const dialogRef = useAccessibleDialog(isOpen, onClose)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="binary-manager-dialog-title"
        tabIndex={-1}
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 shadow-2xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 id="binary-manager-dialog-title" className="text-base font-bold text-slate-900">Gerenciar o binário dutix</h2>
              <p className="text-xs text-slate-500 font-medium">Confira a instalação, escolha um caminho ou atualize o dutix.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar gestão do binário dutix"
            className="text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Status Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Status de Instalação:</span>
              {statusLoadFailed ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Indisponível
                </span>
              ) : status?.installed ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Instalado
                </span>
              ) : status ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Não Encontrado
                </span>
              ) : (
                <span role="status" className="text-[11px] font-medium text-slate-500">
                  Consultando...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Versão Atual</span>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {status?.version || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Arquitetura do Mac</span>
                <span className="font-mono text-sm font-bold text-slate-900 uppercase">
                  {status ? `darwin_${status.architecture || 'N/A'}` : 'N/A'}
                </span>
              </div>
            </div>

            {status?.path && (
              <div className="pt-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Localização do Binário</span>
                <code className="text-[11px] text-brand-700 font-mono font-medium break-all block bg-white p-2.5 rounded-xl border border-slate-200 mt-1 shadow-2xs">
                  {status.path}
                </code>
              </div>
            )}
          </div>

          {/* Download / Update Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Instalar ou atualizar o dutix</h3>
                <p className="text-[11px] text-slate-500 font-medium">Baixa a última release oficial do GitHub em ~/Library/Application Support/DutixGUI/bin</p>
              </div>
              <button
                onClick={handleCheckUpdate}
                disabled={checkingUpdate || downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer active:scale-[0.97] shadow-2xs font-bold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
                <span>Verificar atualização</span>
              </button>
            </div>

            {release && (
              <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span>Última Release: {release.tag_name}</span>
                  <a
                    href={`https://github.com/jackchuka/dutix/releases/tag/${release.tag_name}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-brand-600 hover:underline flex items-center gap-1"
                  >
                    Notas da versão <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {downloading && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[11px] font-medium text-slate-600">
                  <span>{downloadProgress.message}</span>
                  <span className="font-mono font-bold text-slate-900">{Math.round(downloadProgress.percent)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-300 shadow-2xs"
                    style={{ width: `${downloadProgress.percent}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all disabled:opacity-50 shadow-md shadow-brand-600/20 cursor-pointer active:scale-[0.98]"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>{status?.installed ? 'Reinstalar / Atualizar Binário' : 'Baixar e Instalar Binário dutix'}</span>
            </button>
          </div>

          {/* Custom Path Override */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
            <label htmlFor="custom-binary-path" className="font-bold text-slate-900">Caminho Personalizado</label>
            <p className="text-[11px] text-slate-500 font-medium">Se você compilou o dutix manualmente ou o instalou em um local customizado:</p>
            <div className="flex gap-2">
              <input
                id="custom-binary-path"
                type="text"
                value={customPathInput}
                onChange={(e) => setCustomPathInput(e.target.value)}
                placeholder="/caminho/para/dutix"
                className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:border-brand-500 shadow-2xs"
              />
              <button
                onClick={handleSaveCustomPath}
                className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer active:scale-[0.97] shadow-2xs"
              >
                Salvar
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div role="alert" className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div role="status" className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2 font-medium">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200 shadow-2xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
