import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
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
import { UpdateModal } from './components/updater/UpdateModal'
import { LogConsoleDrawer } from './components/logs/LogConsoleDrawer'
import { dutix, presets, snapshots, autoupdate } from '../wailsjs/go/models'
import {
  GetBinaryStatus,
  ListApps,
  ListTargets,
  DetectConflicts,
  ListPresets,
  ListSnapshots,
  GetAppVersion,
  CheckForAppUpdate
} from '../wailsjs/go/main/App'

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard')
  const [useCssRouteTransition, setUseCssRouteTransition] = useState(false)
  const [binaryStatus, setBinaryStatus] = useState<dutix.BinaryStatus | null>(null)
  const [apps, setApps] = useState<dutix.AppInfo[]>([])
  const [targets, setTargets] = useState<dutix.TargetItem[]>([])
  const [conflicts, setConflicts] = useState<dutix.ConflictItem[]>([])
  const [presetsList, setPresetsList] = useState<presets.Preset[]>([])
  const [snapshotsList, setSnapshotsList] = useState<snapshots.Snapshot[]>([])

  const [appVersion, setAppVersion] = useState<string | null>(null)
  const [updateInfo, setUpdateInfo] = useState<autoupdate.UpdateCheckResult | null>(null)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)

  const [loading, setLoading] = useState(false)
  const [loadFailures, setLoadFailures] = useState<string[]>([])
  const loadSequence = useRef(0)
  const routeFocusPending = useRef(false)
  const mainContentRef = useRef<HTMLElement | null>(null)
  const [binaryModalOpen, setBinaryModalOpen] = useState(false)
  const [logsDrawerOpen, setLogsDrawerOpen] = useState(false)

  // Context for transferring to Set Handlers or Migration from other views
  const [selectedAppForSet, setSelectedAppForSet] = useState<string | null>(null)
  const [selectedExtsForSet, setSelectedExtsForSet] = useState<string[]>([])
  const [selectedUTIsForSet, setSelectedUTIsForSet] = useState<string[]>([])
  const [selectedSchemesForSet, setSelectedSchemesForSet] = useState<string[]>([])
  const [selectedAppForMigrate, setSelectedAppForMigrate] = useState<string | null>(null)

  const loadAllData = useCallback(async () => {
    const sequence = ++loadSequence.current
    setLoading(true)
    setLoadFailures([])
    const failures: string[] = []
    const load = <T,>(label: string, request: Promise<T>, update: (value: T) => void) =>
      request.then((value) => {
        if (sequence === loadSequence.current) update(value)
      }).catch((e) => {
        if (sequence !== loadSequence.current) return
        failures.push(label)
        console.warn(`Failed to load ${label}:`, e)
      })

    try {
      void CheckForAppUpdate()
        .then((info) => {
          if (sequence === loadSequence.current) setUpdateInfo(info)
        })
        .catch((e) => {
          if (sequence === loadSequence.current) console.warn('Failed to check for updates:', e)
        })

      await Promise.all([
        load('versão do app', GetAppVersion(), (version) => { if (version) setAppVersion(version) }),
        load('status do binário', GetBinaryStatus(), setBinaryStatus),
        load('aplicativos', ListApps(''), (data) => setApps(data || [])),
        load('alvos', ListTargets(''), (data) => setTargets(data || [])),
        load('conflitos', DetectConflicts(), (data) => setConflicts(data || [])),
        load('presets', ListPresets(), (data) => setPresetsList(data || [])),
        load('snapshots', ListSnapshots(), (data) => setSnapshotsList(data || []))
      ])
      if (sequence === loadSequence.current) setLoadFailures(failures)
    } catch (err) {
      if (sequence !== loadSequence.current) return
      console.error('Failed to load initial data:', err)
      setLoadFailures(failures.length > 0 ? failures : ['dados essenciais'])
    } finally {
      if (sequence === loadSequence.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  useLayoutEffect(() => {
    if (!routeFocusPending.current) return
    routeFocusPending.current = false
    mainContentRef.current?.focus()
  }, [currentTab])

  const navigateToTab = (tab: NavTab) => {
    if (tab === currentTab) return
    routeFocusPending.current = true

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const transitionDocument = document as Document & {
      startViewTransition?: (updateCallback: () => void) => unknown
    }

    if (!reduceMotion && transitionDocument.startViewTransition) {
      setUseCssRouteTransition(false)
      transitionDocument.startViewTransition(() => setCurrentTab(tab))
      return
    }

    setUseCssRouteTransition(!reduceMotion)
    setCurrentTab(tab)
  }

  const handleSetAsDefaultFromApp = (appName: string, exts: string[], utis: string[]) => {
    setSelectedAppForSet(appName)
    setSelectedExtsForSet(exts)
    setSelectedUTIsForSet(utis)
    setSelectedSchemesForSet([])
    navigateToTab('set')
  }

  const handleMigrateFromApp = (appName: string) => {
    setSelectedAppForMigrate(appName)
    navigateToTab('migrate')
  }

  const handleQuickSetDefault = (appName: string, exts: string[], utis: string[], schemes: string[]) => {
    setSelectedAppForSet(appName)
    setSelectedExtsForSet(exts)
    setSelectedUTIsForSet(utis)
    setSelectedSchemesForSet(schemes)
    navigateToTab('set')
  }

  const handleNavigate = (tab: NavTab) => {
    if (tab === 'set' && currentTab !== 'set') {
      setSelectedAppForSet(null)
      setSelectedExtsForSet([])
      setSelectedUTIsForSet([])
      setSelectedSchemesForSet([])
    }
    if (tab === 'migrate' && currentTab !== 'migrate') setSelectedAppForMigrate(null)
    navigateToTab(tab)
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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 select-none">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        onOpenLogs={() => setLogsDrawerOpen(true)}
        onOpenBinaryModal={() => setBinaryModalOpen(true)}
        binaryInstalled={loadFailures.includes('status do binário') ? null : binaryStatus?.installed ?? null}
        conflictCount={loadFailures.includes('conflitos') ? null : conflicts.length}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
        <Header
          title={getTabTitle(currentTab)}
          loading={loading}
          onRefresh={loadAllData}
          onOpenUpdateModal={() => setUpdateModalOpen(true)}
          appVersion={loadFailures.includes('versão do app') ? null : appVersion}
          updateAvailable={updateInfo?.updateAvailable || false}
          latestAppVersion={updateInfo?.latestVersion}
        />

        {loadFailures.length > 0 && (
          <div role="alert" aria-atomic="true" className="mx-4 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            <span className="min-w-0 flex-1">
              Falha ao carregar {loadFailures.join(', ')}. Totais e listas podem estar incompletos.
            </span>
            <button
              type="button"
              onClick={loadAllData}
              disabled={loading}
              className="shrink-0 rounded-lg border border-rose-300 bg-white px-3 py-1.5 font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <main
          ref={mainContentRef}
          key={currentTab}
          tabIndex={-1}
          aria-label={getTabTitle(currentTab)}
          className={`app-route-surface flex-1 overflow-hidden relative${useCssRouteTransition ? ' app-route-surface-fallback' : ''}`}
        >
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              appCount={loadFailures.includes('aplicativos') ? null : apps.length}
              targetCount={loadFailures.includes('alvos') ? null : targets.length}
              conflictCount={loadFailures.includes('conflitos') ? null : conflicts.length}
              onQuickSetDefault={handleQuickSetDefault}
            />
          )}

          {currentTab === 'apps' && (
            <AppsView
              apps={apps}
              loading={loading}
              loadFailed={loadFailures.includes('aplicativos')}
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
              initialSchemes={selectedSchemesForSet}
              appsLoadFailed={loadFailures.includes('aplicativos')}
              onSuccess={loadAllData}
            />
          )}

          {currentTab === 'migrate' && (
            <MigrationView
              apps={apps}
              initialSourceApp={selectedAppForMigrate}
              appsLoadFailed={loadFailures.includes('aplicativos')}
              onSuccess={loadAllData}
            />
          )}

          {currentTab === 'targets' && (
            <TargetsView
              targets={targets}
              conflicts={conflicts}
              loading={loading}
              targetsLoadFailed={loadFailures.includes('alvos')}
              conflictsLoadFailed={loadFailures.includes('conflitos')}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'presets' && (
            <PresetsView
              presetsList={presetsList}
              loading={loading}
              loadFailed={loadFailures.includes('presets')}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'snapshots' && (
            <SnapshotsView
              snapshotList={snapshotsList}
              loading={loading}
              loadFailed={loadFailures.includes('snapshots')}
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

      {/* GUI Auto-Update Modal */}
      <UpdateModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        initialUpdateInfo={updateInfo}
        onUpdateApplied={() => setUpdateModalOpen(false)}
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
