import React, { useState } from 'react'
import {
  Search,
  Grid,
  List,
  Sparkles,
  ArrowRightLeft,
  ChevronRight,
  Info,
  Layers,
  Package,
  X
} from 'lucide-react'
import { dutix } from '../../../wailsjs/go/models'
import { AppDetailsModal } from './AppDetailsModal'

interface AppsViewProps {
  apps: dutix.AppInfo[]
  loading: boolean
  onSetAsDefault: (appName: string, exts: string[], utis: string[]) => void
  onMigrateApp: (appName: string) => void
}

export const AppsView: React.FC<AppsViewProps> = ({
  apps,
  loading,
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
    <div className="p-8 max-w-6xl mx-auto space-y-6 overflow-y-auto h-full">
      {/* Search & Header Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Aplicativos Instalados</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {apps.length} aplicativos indexados no macOS (/Applications, /System/Applications, ~/Applications)
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search box with clear button */}
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, bundle ID ou caminho..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 transition-colors shadow-2xs font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 shrink-0 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visualização em Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visualização em Tabela"
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
      ) : filteredApps.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-2 shadow-xs">
          <Package className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Nenhum aplicativo encontrado</h3>
          <p className="text-xs text-slate-500 font-medium">Tente ajustar o termo de busca pesquisado.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.bundle_id || app.name}
              onClick={() => setSelectedApp(app.name)}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3 relative overflow-hidden active:scale-[0.99] shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  {app.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
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
                <span className="text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-xs font-bold">
                  Detalhes <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
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
                    onClick={() => setSelectedApp(app.name)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3.5 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{app.name}</span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-indigo-600 font-semibold truncate max-w-xs">
                      {app.bundle_id}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-500 truncate max-w-sm">
                      {app.path}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedApp(app.name)
                        }}
                        className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all active:scale-[0.96] border border-slate-200 shadow-2xs cursor-pointer"
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
