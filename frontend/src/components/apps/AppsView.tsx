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
  Package
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
          <h2 className="text-xl font-bold text-white tracking-tight">Aplicativos Instalados</h2>
          <p className="text-xs text-slate-400">
            {apps.length} aplicativos indexados no macOS (/Applications, /System/Applications, ~/Applications)
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nome, bundle ID ou path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
            />
          </div>

          {/* View toggle */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visualização em Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
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
        <div className="py-24 text-center text-slate-400 space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium">Carregando catálogo de aplicativos...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="py-24 text-center bg-slate-900/30 rounded-3xl border border-slate-800/80 p-8 space-y-2">
          <Package className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">Nenhum aplicativo encontrado</h3>
          <p className="text-xs text-slate-500">Tente ajustar o termo de busca pesquisado.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.bundle_id || app.name}
              onClick={() => setSelectedApp(app.name)}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all cursor-pointer group flex flex-col justify-between space-y-3 relative overflow-hidden backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-base shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  {app.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                    {app.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                    {app.bundle_id || 'sem bundle id'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate text-slate-500 text-[10px]">
                  {app.path.startsWith('/System') ? 'Sistema' : 'Usuário'}
                </span>
                <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-[11px] font-medium">
                  Detalhes <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3 font-semibold">Aplicativo</th>
                  <th className="px-6 py-3 font-semibold">Bundle Identifier</th>
                  <th className="px-6 py-3 font-semibold">Caminho (.app)</th>
                  <th className="px-6 py-3 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredApps.map((app) => (
                  <tr
                    key={app.bundle_id || app.name}
                    onClick={() => setSelectedApp(app.name)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3 font-semibold text-white flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{app.name}</span>
                    </td>
                    <td className="px-6 py-3 font-mono text-[11px] text-indigo-300/80 truncate max-w-xs">
                      {app.bundle_id}
                    </td>
                    <td className="px-6 py-3 font-mono text-[10px] text-slate-400 truncate max-w-sm">
                      {app.path}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedApp(app.name)
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
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
