import React, { useState } from 'react'
import {
  BookmarkPlus,
  Sparkles,
  Code2,
  Palette,
  Film,
  Apple,
  Play,
  Upload,
  Download,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  FileJson,
  Layers
} from 'lucide-react'
import { presets } from '../../../wailsjs/go/models'
import {
  ListPresets,
  ApplyPreset,
  SavePreset,
  DeletePreset,
  ExportPresetJSON,
  ImportPresetJSON
} from '../../../wailsjs/go/main/App'

interface PresetsViewProps {
  presetsList: presets.Preset[]
  loading: boolean
  onRefresh: () => void
}

export const PresetsView: React.FC<PresetsViewProps> = ({
  presetsList,
  loading,
  onRefresh
}) => {
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // New Preset Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [newPresetDesc, setNewPresetDesc] = useState('')
  const [newPresetCategory, setNewPresetCategory] = useState('Personalizado')
  const [newPresetAppName, setNewPresetAppName] = useState('')
  const [newPresetExts, setNewPresetExts] = useState('')

  // Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importJsonText, setImportJsonText] = useState('')

  // Export Modal
  const [exportModalPreset, setExportModalPreset] = useState<presets.Preset | null>(null)
  const [exportedJson, setExportedJson] = useState('')

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return Code2
      case 'Palette':
        return Palette
      case 'Film':
        return Film
      case 'Apple':
        return Apple
      default:
        return Sparkles
    }
  }

  const handleApply = async (preset: presets.Preset) => {
    setApplyingId(preset.id)
    setAlert(null)

    try {
      await ApplyPreset(preset, false)
      setAlert({
        type: 'success',
        message: `Preset '${preset.name}' aplicado com sucesso! Um snapshot de segurança foi criado.`
      })
      onRefresh()
    } catch (e: any) {
      setAlert({ type: 'error', message: e?.message || 'Falha ao aplicar preset.' })
    } finally {
      setApplyingId(null)
    }
  }

  const handleExport = async (preset: presets.Preset) => {
    try {
      const json = await ExportPresetJSON(preset)
      setExportedJson(json)
      setExportModalPreset(preset)
    } catch (e: any) {
      setAlert({ type: 'error', message: 'Falha ao exportar preset.' })
    }
  }

  const handleImport = async () => {
    if (!importJsonText.trim()) return
    try {
      await ImportPresetJSON(importJsonText.trim())
      setIsImportModalOpen(false)
      setImportJsonText('')
      setAlert({ type: 'success', message: 'Preset importado com sucesso!' })
      onRefresh()
    } catch (e: any) {
      setAlert({ type: 'error', message: e?.message || 'JSON de preset inválido.' })
    }
  }

  const handleSaveNew = async () => {
    if (!newPresetName.trim() || !newPresetAppName.trim()) {
      setAlert({ type: 'error', message: 'Preencha o nome do preset e o app padrão.' })
      return
    }

    const exts = newPresetExts
      .split(/[\s,]+/)
      .map((e) => e.replace(/^\./, '').trim())
      .filter((e) => e.length > 0)

    const preset = presets.Preset.createFrom({
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      description: newPresetDesc.trim() || 'Preset personalizado do usuário',
      category: newPresetCategory,
      icon: 'Sparkles',
      is_builtin: false,
      mappings: [
        {
          app_name: newPresetAppName.trim(),
          extensions: exts,
          utis: [],
          schemes: []
        }
      ]
    })

    try {
      await SavePreset(preset)
      setIsNewModalOpen(false)
      setNewPresetName('')
      setNewPresetDesc('')
      setNewPresetAppName('')
      setNewPresetExts('')
      setAlert({ type: 'success', message: 'Preset personalizado salvo com sucesso!' })
      onRefresh()
    } catch (e: any) {
      setAlert({ type: 'error', message: e?.message || 'Erro ao salvar preset.' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await DeletePreset(id)
      setAlert({ type: 'success', message: 'Preset removido com sucesso.' })
      onRefresh()
    } catch (e: any) {
      setAlert({ type: 'error', message: e?.message || 'Falha ao remover preset.' })
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Presets Rápidos & Dotfiles</h2>
          <p className="text-xs text-slate-400">
            Configure seu novo Mac com 1 clique usando perfis prontos ou exporte suas preferências em JSON.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Importar JSON</span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Preset</span>
          </button>
        </div>
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

      {/* Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {presetsList.map((p) => {
          const Icon = getPresetIcon(p.icon)
          const isApplying = applyingId === p.id

          return (
            <div
              key={p.id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 backdrop-blur-sm relative"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{p.name}</h3>
                      {p.is_builtin ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Oficial
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Custom
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">{p.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleExport(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Exportar JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {!p.is_builtin && (
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Excluir preset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>

              {/* Mappings Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  Mapeamentos Incluídos ({p.mappings?.length || 0})
                </span>
                <div className="space-y-1.5">
                  {p.mappings?.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-mono">
                      <span className="text-indigo-300 font-semibold truncate max-w-xs">{m.app_name}</span>
                      <span className="text-[10px] text-slate-400">
                        {m.extensions?.length ? `${m.extensions.length} extensões` : ''}
                        {m.schemes?.length ? ` ${m.schemes.join(', ')}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => handleApply(p)}
                disabled={isApplying}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isApplying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Aplicando Preset...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Aplicar Preset com 1-Clique</span>
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Export Modal */}
      {exportModalPreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Exportar Preset: {exportModalPreset.name}</h3>
              <button onClick={() => setExportModalPreset(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              readOnly
              value={exportedJson}
              rows={10}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 focus:outline-none select-all"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportedJson)
                  setAlert({ type: 'success', message: 'JSON copiado para a área de transferência!' })
                  setExportModalPreset(null)
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Copiar JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Importar Preset (.json)</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              placeholder="Cole a estrutura JSON do preset aqui..."
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              rows={10}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Preset Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Criar Novo Preset</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome do Preset</label>
                <input
                  type="text"
                  placeholder="Ex: Meu Setup Dev 2026"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Associações para projetos React e Rust"
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Aplicativo Padrão</label>
                <input
                  type="text"
                  placeholder="Ex: Visual Studio Code"
                  value={newPresetAppName}
                  onChange={(e) => setNewPresetAppName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Extensões (separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: ts, tsx, js, json, rs, toml"
                  value={newPresetExts}
                  onChange={(e) => setNewPresetExts(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNew}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Salvar Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
