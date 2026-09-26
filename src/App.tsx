/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, UserRole, Dataset, ThemePalette, AppNotification, PredictionGoal } from './types';
import { SAMPLE_DATASETS } from './data/sampleDatasets';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { UploadView } from './views/UploadView';
import { VisualizationView } from './views/VisualizationView';
import { PredictionView } from './views/PredictionView';
import { AdminView } from './views/AdminView';
import { AuthView } from './views/AuthView';
import { DatabaseStudioView } from './views/DatabaseStudioView';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { 
  getSessionUser, 
  setSessionUser, 
  getStoredNotifications, 
  saveStoredNotifications, 
  addStoredNotification 
} from './utils/userStorage';

export default function App() {
  // Pre-seed authenticated user or load active session
  const [currentUser, setCurrentUser] = useState<User | null>(() => getSessionUser());

  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [themePalette, setThemePalette] = useState<ThemePalette>('indigo');
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const search = window.location.search;
      if (path === '/database' || path.startsWith('/database') || search.includes('tab=database')) {
        return 'database';
      }
    }
    return 'dashboard';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [datasets, setDatasets] = useState<Dataset[]>(SAMPLE_DATASETS);
  const [currentDataset, setCurrentDataset] = useState<Dataset>(SAMPLE_DATASETS[0]);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Live persistent notifications system
  const [notifications, setNotifications] = useState<AppNotification[]>(() => 
    getStoredNotifications(SAMPLE_DATASETS[0].name)
  );

  // Synchronize URL with active tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (activeTab === 'database') {
        window.history.replaceState(null, '', '/database');
      } else if (window.location.pathname === '/database') {
        window.history.replaceState(null, '', '/');
      }
    }
  }, [activeTab]);

  // Synchronize document dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('bg-slate-50', 'text-slate-800');
      document.body.classList.add('bg-slate-950', 'text-slate-100');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-slate-950', 'text-slate-100');
      document.body.classList.add('bg-slate-50', 'text-slate-800');
    }
  }, [darkMode]);

  const handleDatasetLoaded = (newDataset: Dataset, targetTab: NavTab = 'predictions') => {
    setDatasets((prev) => [newDataset, ...prev.filter((d) => d.id !== newDataset.id)]);
    setCurrentDataset(newDataset);
    setActiveTab(targetTab);

    // Trigger real-time intelligence notification
    const updatedNotifs = addStoredNotification({
      title: `Dataset Ingested: ${newDataset.name}`,
      message: `Verified ${newDataset.rowCount} rows & ${newDataset.columnCount} columns. Moving averages and predictions updated.`,
      type: 'dataset',
      read: false,
      targetTab,
    });
    setNotifications(updatedNotifs);
  };

  const handleUpdateDatasetGoal = (goal: PredictionGoal) => {
    const updated: Dataset = { ...currentDataset, predictionGoal: goal };
    setCurrentDataset(updated);
    setDatasets((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    const notifs = addStoredNotification({
      title: `Goals Tailored: ${updated.name}`,
      message: `Prediction engine calibrated for metric "${goal.primaryTargetMetric || 'primary series'}" with objective "${goal.businessObjective}".`,
      type: 'prediction',
      read: false,
      targetTab: 'predictions',
    });
    setNotifications(notifs);
  };

  const handleDeleteDataset = (id: string) => {
    const updated = datasets.filter((d) => d.id !== id);
    setDatasets(updated);
    if (currentDataset.id === id && updated.length > 0) {
      setCurrentDataset(updated[0]);
    }
  };

  const handleSwitchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, role: newRole };
    setCurrentUser(updatedUser);
    setSessionUser(updatedUser);

    const updatedNotifs = addStoredNotification({
      title: `Role Switched to ${newRole === 'admin' ? 'Administrator' : newRole === 'analyst' ? 'Data Analyst' : 'Standard User'}`,
      message: `Workspace view, telemetry, and capabilities updated for ${newRole.toUpperCase()} mode.`,
      type: 'user',
      read: false,
      targetTab: 'dashboard',
    });
    setNotifications(updatedNotifs);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    const updated = notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n));
    setNotifications(updated);
    saveStoredNotifications(updated);
    if (notif.targetTab) {
      setActiveTab(notif.targetTab);
    }
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    saveStoredNotifications([]);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setSessionUser(user);
    const updatedNotifs = addStoredNotification({
      title: `Welcome, ${user.name}!`,
      message: `Signed in as ${user.role.toUpperCase()} with active access to ${currentDataset.name}.`,
      type: 'user',
      read: false,
      targetTab: 'dashboard',
    });
    setNotifications(updatedNotifs);
  };

  // If user signs out, show the elegant split-screen AuthView with theme switcher
  if (!currentUser) {
    return (
      <AuthView
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        themePalette={themePalette}
        onChangeThemePalette={setThemePalette}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Top Navigation */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        themePalette={themePalette}
        setThemePalette={setThemePalette}
        currentUser={currentUser}
        onLogout={() => {
          setSessionUser(null);
          setCurrentUser(null);
        }}
        datasets={datasets}
        currentDataset={currentDataset}
        onSelectDataset={(ds) => {
          setCurrentDataset(ds);
          const updatedNotifs = addStoredNotification({
            title: `Active Dataset: ${ds.name}`,
            message: `Loaded ${ds.rowCount} observations. Models recalibrated.`,
            type: 'dataset',
            read: false,
            targetTab: activeTab,
          });
          setNotifications(updatedNotifs);
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onClearNotifications={handleClearNotifications}
        onSwitchRole={handleSwitchRole}
      />

      {/* Main Workspace Frame: Sidebar + Active View */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto overflow-hidden">
        
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          darkMode={darkMode}
          themePalette={themePalette}
          currentDataset={currentDataset}
          currentUser={currentUser}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-64px)]">
          {activeTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              currentDataset={currentDataset}
              datasets={datasets}
              onSelectDataset={(ds) => setCurrentDataset(ds)}
              onNavigate={(tab) => setActiveTab(tab)}
              darkMode={darkMode}
              themePalette={themePalette}
            />
          )}

          {activeTab === 'upload' && (
            <UploadView
              datasets={datasets}
              currentDataset={currentDataset}
              onSelectDataset={(ds) => setCurrentDataset(ds)}
              onDatasetLoaded={handleDatasetLoaded}
              darkMode={darkMode}
              themePalette={themePalette}
            />
          )}

          {activeTab === 'visualizations' && (
            <VisualizationView
              dataset={currentDataset}
              darkMode={darkMode}
              themePalette={themePalette}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onUpdateDatasetGoal={handleUpdateDatasetGoal}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'predictions' && (
            <PredictionView
              dataset={currentDataset}
              datasets={datasets}
              onSelectDataset={(ds) => setCurrentDataset(ds)}
              darkMode={darkMode}
              themePalette={themePalette}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onUpdateDatasetGoal={handleUpdateDatasetGoal}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'admin' && (
            <AdminView
              currentUser={currentUser}
              datasets={datasets}
              onDeleteDataset={handleDeleteDataset}
              darkMode={darkMode}
              themePalette={themePalette}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseStudioView
              darkMode={darkMode}
              themePalette={themePalette}
            />
          )}
        </main>
      </div>

      {/* Executive Report Printable Modal */}
      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        dataset={currentDataset}
        darkMode={darkMode}
        themePalette={themePalette}
      />

    </div>
  );
}
