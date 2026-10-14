import React, { useState } from 'react'
import {
  Search,
  Grid,
  List,
  ChevronRight,
  Package,
  X
} from 'lucide-react'
import { dutix } from '../../../wailsjs/go/models'
import { AppDetailsModal } from './AppDetailsModal'

interface AppsViewProps {
  apps: dutix.AppInfo[]
  loading: boolean
  loadFailed: boolean
  onSetAsDefault: (appName: string, exts: string[], utis: string[]) => void
  onMigrateApp: (appName: string) => void
}

export const AppsView: React.FC<AppsViewProps> = ({
  apps,
  loading,
  loadFailed,
  onSetAsDefault,
  onMigrateApp
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const filteredApps = apps.filter((app) => {
    const query = searchQuery.toLowerCase()
    return (
      app.name?.toLowerCase().includes(query) ||
      app.bundle_id?.toLowerCase().includes(query) ||
      app.path?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="app-page max-w-6xl mx-auto space-y-6 overflow-y-auto h-full">
      {/* Search & Header Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Aplicativos Instalados</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {loadFailed ? 'Dados indisponíveis' : searchQuery ? `${filteredApps.length} de ${apps.length} aplicativos` : `${apps.length} aplicativos encontrados`}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search box with clear button */}
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              aria-label="Buscar aplicativos"
              placeholder="Buscar por nome, bundle ID ou caminho..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-500 focus:border-brand-500 transition-colors shadow-2xs font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-600 cursor-pointer"
                title="Limpar busca"
                aria-label="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-brand-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visualização em Grid"
              aria-label="Visualização em grade"
              aria-pressed={viewMode === 'grid'}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-brand-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visualização em Tabela"
              aria-label="Visualização em tabela"
              aria-pressed={viewMode === 'table'}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Zero-CLS Skeleton Loading Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded-md w-full" />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <div className="h-2.5 bg-slate-100 rounded w-12" />
                <div className="h-2.5 bg-slate-100 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : loadFailed && apps.length === 0 ? (
        <div role="status" className="py-24 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-2 shadow-xs">
          <Package className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Não foi possível carregar os aplicativos</h3>
          <p className="text-xs text-slate-500 font-medium">Tente novamente pelo aviso de erro no topo da janela.</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-2 shadow-xs">
          <Package className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Nenhum aplicativo encontrado</h3>
          <p className="text-xs text-slate-500 font-medium">Tente ajustar o termo de busca pesquisado.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredApps.map((app) => (
            <button
              type="button"
              key={app.bundle_id || app.name}
              onClick={() => setSelectedApp(app.name)}
              aria-label={`Inspecionar ${app.name}`}
              className="w-full p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-400 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3 relative overflow-hidden text-left focus-visible:outline-none"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-base shrink-0">
                  {Array.from(app.name)[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2" title={app.name}>
                    {app.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
                    {app.bundle_id || 'sem bundle id'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate text-slate-500 text-xs font-medium">
                  {app.path.startsWith('/System') ? 'Sistema' : 'Usuário'}
                </span>
                <span className="text-brand-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-xs font-bold">
                  Detalhes <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Aplicativo</th>
                  <th className="px-6 py-3.5 font-bold">Bundle Identifier</th>
                  <th className="px-6 py-3.5 font-bold">Caminho (.app)</th>
                  <th className="px-6 py-3.5 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr
                    key={app.bundle_id || app.name}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
                        {Array.from(app.name)[0]?.toUpperCase()}
                      </div>
                      <span className="truncate" title={app.name}>{app.name}</span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-brand-600 font-semibold truncate max-w-xs select-text">
                      {app.bundle_id}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-500 truncate max-w-sm select-text">
                      {app.path}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApp(app.name)
                        }}
                        className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all active:scale-[0.96] border border-slate-200 shadow-2xs cursor-pointer"
                        aria-label={`Inspecionar ${app.name}`}
                      >
                        Inspecionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* App Details Modal */}
      <AppDetailsModal
        appName={selectedApp}
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        onSetAsDefault={onSetAsDefault}
        onMigrateApp={onMigrateApp}
      />
    </div>
  )
}
