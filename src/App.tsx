/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Dataset, ThemePalette } from './types';
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

export default function App() {
  // Pre-seed authenticated user so preview is immediately functional and alive
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'user-admin-1',
    name: 'M. Janani',
    email: '25mca029@grd.edu.in',
    role: 'admin',
    status: 'active',
    createdAt: '2026-08-10',
    lastLogin: 'Just now',
  });

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
  };

  const handleDeleteDataset = (id: string) => {
    const updated = datasets.filter((d) => d.id !== id);
    setDatasets(updated);
    if (currentDataset.id === id && updated.length > 0) {
      setCurrentDataset(updated[0]);
    }
  };

  // If user signs out, show the elegant split-screen AuthView with theme switcher
  if (!currentUser) {
    return (
      <AuthView
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        themePalette={themePalette}
        onChangeThemePalette={setThemePalette}
        onLoginSuccess={(user) => setCurrentUser(user)}
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
        onLogout={() => setCurrentUser(null)}
        datasets={datasets}
        currentDataset={currentDataset}
        onSelectDataset={(ds) => setCurrentDataset(ds)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
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
