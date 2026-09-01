import React, { useState, useEffect, useCallback } from 'react'
import { Sidebar, NavTab } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { DashboardView } from './components/dashboard/DashboardView'
import { AppsView } from './components/apps/AppsView'
import { SetHandlersView } from './components/set/SetHandlersView'
import { MigrationView } from './components/migrate/MigrationView'
import { TargetsView } from './components/targets/TargetsView'
import { PresetsView } from './components/presets/PresetsView'
import { SnapshotsView } from './components/snapshots/SnapshotsView'
import { BinaryManagerModal } from './components/binary/BinaryManagerModal'
import { LogConsoleDrawer } from './components/logs/LogConsoleDrawer'
import { dutix, presets, snapshots } from '../wailsjs/go/models'
import {
  GetBinaryStatus,
  ListApps,
  ListTargets,
  DetectConflicts,
  ListPresets,
  ListSnapshots,
  SetHandler
} from '../wailsjs/go/main/App'

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard')
  const [binaryStatus, setBinaryStatus] = useState<dutix.BinaryStatus | null>(null)
  const [apps, setApps] = useState<dutix.AppInfo[]>([])
  const [targets, setTargets] = useState<dutix.TargetItem[]>([])
  const [conflicts, setConflicts] = useState<dutix.ConflictItem[]>([])
  const [presetsList, setPresetsList] = useState<presets.Preset[]>([])
  const [snapshotsList, setSnapshotsList] = useState<snapshots.Snapshot[]>([])

  const [loading, setLoading] = useState(false)
  const [binaryModalOpen, setBinaryModalOpen] = useState(false)
  const [logsDrawerOpen, setLogsDrawerOpen] = useState(false)

  // Context for transferring to Set Handlers or Migration from other views
  const [selectedAppForSet, setSelectedAppForSet] = useState<string | null>(null)
  const [selectedExtsForSet, setSelectedExtsForSet] = useState<string[]>([])
  const [selectedUTIsForSet, setSelectedUTIsForSet] = useState<string[]>([])
  const [selectedAppForMigrate, setSelectedAppForMigrate] = useState<string | null>(null)

  const loadAllData = useCallback(async () => {
    setLoading(true)
    try {
      // Binary status
      const bStatus = await GetBinaryStatus()
      setBinaryStatus(bStatus)

      // Fetch apps
      const appsData = await ListApps('')
      setApps(appsData || [])

      // Fetch targets
      const targetsData = await ListTargets('')
      setTargets(targetsData || [])

      // Detect conflicts
      const conflictsData = await DetectConflicts()
      setConflicts(conflictsData || [])

      // Fetch presets & snapshots
      const presetsData = await ListPresets()
      setPresetsList(presetsData || [])

      const snapsData = await ListSnapshots()
      setSnapshotsList(snapsData || [])
    } catch (err) {
      console.error('Failed to load initial data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  const handleSetAsDefaultFromApp = (appName: string, exts: string[], utis: string[]) => {
    setSelectedAppForSet(appName)
    setSelectedExtsForSet(exts)
    setSelectedUTIsForSet(utis)
    setCurrentTab('set')
  }

  const handleMigrateFromApp = (appName: string) => {
    setSelectedAppForMigrate(appName)
    setCurrentTab('migrate')
  }

  const handleQuickSetDefault = async (appName: string, exts: string[], utis: string[], schemes: string[]) => {
    try {
      await SetHandler(appName, exts, utis, schemes, false)
      await loadAllData()
    } catch (e) {
      console.error(e)
    }
  }

  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Painel Geral'
      case 'apps':
        return 'Catálogo de Aplicativos'
      case 'set':
        return 'Associação Rápida'
      case 'migrate':
        return 'Migração de Aplicativos'
      case 'targets':
        return 'Inspetor de Alvos & Conflitos'
      case 'presets':
        return 'Presets & Dotfiles'
      case 'snapshots':
        return 'Snapshots & Rollback'
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-900 select-none">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenLogs={() => setLogsDrawerOpen(true)}
        onOpenBinaryModal={() => setBinaryModalOpen(true)}
        binaryInstalled={binaryStatus?.installed || false}
        conflictCount={conflicts.length}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e8eef6]">
        <Header
          title={getTabTitle(currentTab)}
          subtitle={
            binaryStatus?.path ? `Binário: ${binaryStatus.path}` : 'Binário dutix não configurado'
          }
          loading={loading}
          onRefresh={loadAllData}
          onOpenBinaryModal={() => setBinaryModalOpen(true)}
          onOpenLogs={() => setLogsDrawerOpen(true)}
          onOpenQuickPreset={() => setCurrentTab('presets')}
          version={binaryStatus?.version}
        />

        <main className="flex-1 overflow-hidden relative">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setCurrentTab(tab)}
              appCount={apps.length}
              targetCount={targets.length}
              conflictCount={conflicts.length}
              binaryStatus={binaryStatus}
              recentSnapshots={snapshotsList}
              onOpenBinaryModal={() => setBinaryModalOpen(true)}
              onQuickSetDefault={handleQuickSetDefault}
            />
          )}

          {currentTab === 'apps' && (
            <AppsView
              apps={apps}
              loading={loading}
              onSetAsDefault={handleSetAsDefaultFromApp}
              onMigrateApp={handleMigrateFromApp}
            />
          )}

          {currentTab === 'set' && (
            <SetHandlersView
              apps={apps}
              initialApp={selectedAppForSet}
              initialExtensions={selectedExtsForSet}
              initialUTIs={selectedUTIsForSet}
              onSuccess={loadAllData}
            />
          )}

          {currentTab === 'migrate' && (
            <MigrationView
              apps={apps}
              initialSourceApp={selectedAppForMigrate}
              onSuccess={loadAllData}
            />
          )}

          {currentTab === 'targets' && (
            <TargetsView
              targets={targets}
              conflicts={conflicts}
              loading={loading}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'presets' && (
            <PresetsView
              presetsList={presetsList}
              loading={loading}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'snapshots' && (
            <SnapshotsView
              snapshotList={snapshotsList}
              loading={loading}
              onRefresh={loadAllData}
            />
          )}
        </main>
      </div>

      {/* Binary Manager Modal */}
      <BinaryManagerModal
        isOpen={binaryModalOpen}
        onClose={() => setBinaryModalOpen(false)}
        onStatusChanged={loadAllData}
      />

      {/* Log Console Drawer */}
      <LogConsoleDrawer
        isOpen={logsDrawerOpen}
        onClose={() => setLogsDrawerOpen(false)}
      />
    </div>
  )
}
export default App
