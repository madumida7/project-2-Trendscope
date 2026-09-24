import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Database, 
  Trash2, 
  Activity, 
  HardDrive, 
  Cpu, 
  Search, 
  Plus
} from 'lucide-react';
import { Dataset, User, UserRole, ThemePalette } from '../types';
import { getPalette } from '../utils/themeConfig';

interface AdminViewProps {
  currentUser: User | null;
  datasets: Dataset[];
  onDeleteDataset: (id: string) => void;
  darkMode: boolean;
  themePalette?: ThemePalette;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  datasets,
  onDeleteDataset,
  darkMode,
  themePalette = 'indigo',
}) => {
  const activePalette = getPalette(themePalette);

  const [usersList, setUsersList] = useState<User[]>([
    {
      id: 'user-admin-1',
      name: 'M. Janani',
      email: '25mca029@grd.edu.in',
      role: 'admin',
      status: 'active',
      createdAt: '2026-08-10',
      lastLogin: 'Just now',
    },
    {
      id: 'user-analyst-2',
      name: 'D. Madhumitha',
      email: 'madhumitha.d@trendscope.ai',
      role: 'analyst',
      status: 'active',
      createdAt: '2026-08-14',
      lastLogin: '2 hours ago',
    },
    {
      id: 'user-demo-3',
      name: 'G. Nandhini',
      email: 'nandhini.g@trendscope.ai',
      role: 'analyst',
      status: 'active',
      createdAt: '2026-09-01',
      lastLogin: 'Yesterday',
    },
    {
      id: 'user-demo-4',
      name: 'Faculty Guide (MCA Dept)',
      email: 'mca.guide@grd.edu.in',
      role: 'admin',
      status: 'active',
      createdAt: '2026-09-12',
      lastLogin: '3 days ago',
    },
  ]);

  const [searchUser, setSearchUser] = useState('');
  const [adminTab, setAdminTab] = useState<'users' | 'datasets' | 'health'>('users');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('analyst');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ title: string; onConfirm: () => void } | null>(null);

  // Toggle user role
  const handleToggleRole = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextRole: UserRole = u.role === 'admin' ? 'analyst' : u.role === 'analyst' ? 'user' : 'admin';
          return { ...u, role: nextRole };
        }
        return u;
      })
    );
  };

  // Toggle user active / suspended status
  const handleToggleStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return { ...u, status: u.status === 'active' ? 'suspended' : 'active' };
        }
        return u;
      })
    );
  };

  // Delete user
  const handleDeleteUser = (userId: string) => {
    setConfirmModal({
      title: 'Are you sure you want to remove this user from the workspace?',
      onConfirm: () => {
        setUsersList((prev) => prev.filter((u) => u.id !== userId));
        setConfirmModal(null);
      },
    });
  };

  // Add new user
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    const user: User = {
      id: `user-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
    };
    setUsersList([user, ...usersList]);
    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.role.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Admin Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl border backdrop-blur-xl transition-all ${
        darkMode 
          ? 'bg-[#0d1424]/85 border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.35)]' 
          : 'bg-white/95 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
      }`}>
        <div>
          <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 ${
            darkMode ? activePalette.textAccentDark : activePalette.textAccentLight
          }`}>
            <ShieldAlert className="w-4 h-4" />
            Security & System Governance
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Admin Management Console
          </h1>
          <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Configure access credentials, monitor system storage limits, and manage multi-tenant dataset registry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="admin-add-user-btn"
            onClick={() => setShowAddUserModal(true)}
            className={`px-4 py-2 rounded-xl bg-gradient-to-r ${activePalette.accentGradient} text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg ${activePalette.glowShadow} transition-all`}
          >
            <Plus className="w-4 h-4" />
            <span>Provision New User</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className={`flex items-center gap-2 border-b pb-2 ${
        darkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === 'users'
              ? `bg-gradient-to-r ${activePalette.accentGradient} text-white shadow-md ${activePalette.glowShadow}`
              : darkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({usersList.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('datasets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === 'datasets'
              ? `bg-gradient-to-r ${activePalette.accentGradient} text-white shadow-md ${activePalette.glowShadow}`
              : darkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Datasets Registry ({datasets.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('health')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === 'health'
              ? `bg-gradient-to-r ${activePalette.accentGradient} text-white shadow-md ${activePalette.glowShadow}`
              : darkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Diagnostics</span>
        </button>
      </div>

      {/* TAB 1: User Management Table */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search users by name, email, or role..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none transition-colors ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500' 
                    : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>

            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Showing {filteredUsers.length} of {usersList.length} users
            </div>
          </div>

          <div className={`overflow-x-auto rounded-3xl border ${
            darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white shadow-xs'
          } backdrop-blur-xl`}>
            <table className="w-full text-left text-xs">
              <thead className={`uppercase text-[10px] font-bold border-b ${
                darkMode ? 'bg-slate-950/80 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                <tr>
                  <th className="px-5 py-3">User Profile</th>
                  <th className="px-5 py-3">Assigned Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Registered</th>
                  <th className="px-5 py-3">Last Activity</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                darkMode ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'
              }`}>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={darkMode ? 'hover:bg-slate-800/30 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${activePalette.swatchGradient} flex items-center justify-center font-bold text-white text-xs shadow-xs`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user.name}</div>
                        <div className={`text-[11px] font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleRole(user.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border cursor-pointer transition-colors ${
                          user.role === 'admin'
                            ? darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
                            : user.role === 'analyst'
                            ? darkMode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                        title="Click to cycle role (Admin -> Analyst -> User)"
                      >
                        {user.role}
                      </button>
                    </td>

                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          user.status === 'active'
                            ? darkMode ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : darkMode ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="capitalize">{user.status}</span>
                      </button>
                    </td>

                    <td className={`px-5 py-3.5 font-mono text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {user.createdAt}
                    </td>

                    <td className={`px-5 py-3.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {user.lastLogin}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Datasets Registry */}
      {adminTab === 'datasets' && (
        <div className="space-y-4">
          <div className={`overflow-x-auto rounded-3xl border ${
            darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white shadow-xs'
          } backdrop-blur-xl`}>
            <table className="w-full text-left text-xs">
              <thead className={`uppercase text-[10px] font-bold border-b ${
                darkMode ? 'bg-slate-950/80 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                <tr>
                  <th className="px-5 py-3">Dataset Name</th>
                  <th className="px-5 py-3">Domain Category</th>
                  <th className="px-5 py-3">Rows</th>
                  <th className="px-5 py-3">Variables</th>
                  <th className="px-5 py-3">Uploaded By</th>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                darkMode ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'
              }`}>
                {datasets.map((ds) => (
                  <tr key={ds.id} className={darkMode ? 'hover:bg-slate-800/30 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                    <td className="px-5 py-3.5">
                      <div className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{ds.name}</div>
                      <div className={`text-[11px] truncate max-w-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{ds.description}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                        darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
                      }`}>
                        {ds.category}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-emerald-500 font-bold">
                      {ds.rowCount}
                    </td>

                    <td className="px-5 py-3.5 font-mono text-cyan-500 font-bold">
                      {ds.columnCount}
                    </td>

                    <td className={`px-5 py-3.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {ds.uploadedBy}
                    </td>

                    <td className={`px-5 py-3.5 font-mono text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {ds.uploadedAt}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {datasets.length > 1 && (
                        <button
                          onClick={() => {
                            setConfirmModal({
                              title: `Are you sure you want to delete dataset "${ds.name}"?`,
                              onConfirm: () => {
                                onDeleteDataset(ds.id);
                                setConfirmModal(null);
                              },
                            });
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Dataset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: System Diagnostics */}
      {adminTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className={`p-6 rounded-3xl border space-y-3 ${
            darkMode 
              ? 'border-slate-800 bg-[#0d1424]/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
              : 'border-slate-200 bg-white/95 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Engine Reliability
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>99.98%</div>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Moving average computational pipelines operating within &lt;15ms nominal latency.
            </p>
          </div>

          <div className={`p-6 rounded-3xl border space-y-3 ${
            darkMode 
              ? 'border-slate-800 bg-[#0d1424]/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
              : 'border-slate-200 bg-white/95 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Analytical Storage
              </span>
              <HardDrive className="w-4 h-4 text-cyan-500" />
            </div>
            <div className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>14.8 MB</div>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              In-memory indexed storage with zero disk saturation.
            </p>
          </div>

          <div className={`p-6 rounded-3xl border space-y-3 ${
            darkMode 
              ? 'border-slate-800 bg-[#0d1424]/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
              : 'border-slate-200 bg-white/95 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Active Concurrency
              </span>
              <Cpu className="w-4 h-4 text-violet-500" />
            </div>
            <div className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>4 Sessions</div>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Role-based session tokens secured via cryptographic keys.
            </p>
          </div>
        </div>
      )}

      {/* Modal: Provision New User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Provision Team Member
            </h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                    darkMode 
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="maya@healthanalytics.org"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                    darkMode 
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Access Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                    darkMode 
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                  }`}
                >
                  <option value="user">User (Viewer)</option>
                  <option value="analyst">Analyst (Uploader & Modeler)</option>
                  <option value="admin">Administrator (Super User)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className={`px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                    darkMode ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-300 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl bg-gradient-to-r ${activePalette.accentGradient} text-white text-xs font-bold shadow-md cursor-pointer`}
                >
                  Confirm Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {confirmModal.title}
            </h3>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              This action takes effect immediately across your active team workspace.
            </p>
            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setConfirmModal(null)}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                  darkMode ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-300 text-slate-600 hover:text-slate-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
