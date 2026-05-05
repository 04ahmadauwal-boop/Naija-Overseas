import { useState, useEffect } from 'react';
import { AdminNav } from './Dashboard';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Search, Trash2, ShieldCheck, User, Users, GraduationCap, School } from 'lucide-react';

const ROLE_TABS = ['all', 'student', 'parent', 'school-owner', 'admin'];

const ROLE_STYLES = {
  student: { cls: 'bg-blue-100 text-blue-700', icon: GraduationCap },
  parent: { cls: 'bg-purple-100 text-purple-700', icon: Users },
  'school-owner': { cls: 'bg-orange-100 text-orange-700', icon: School },
  admin: { cls: 'bg-green-100 text-green-700', icon: ShieldCheck },
};

function RoleBadge({ role }) {
  const s = ROLE_STYLES[role] || { cls: 'bg-gray-100 text-gray-600', icon: User };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${s.cls}`}>
      <Icon size={11} />
      {role?.replace('-', ' ')}
    </span>
  );
}

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search) params.search = search;
      const { data } = await api.get('/users', { params });
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      toast.success('Role updated');
      fetchUsers();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const roleCounts = ROLE_TABS.slice(1).reduce((acc, r) => {
    acc[r] = users.filter((u) => u.role === r).length;
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <div className="flex-1 overflow-x-hidden pt-14 lg:pt-0">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Manage Users</h1>
              <p className="text-gray-400 text-sm mt-0.5">All registered accounts across roles</p>
            </div>
            <div className="bg-blue-50 text-blue-700 text-sm font-bold px-4 py-2 rounded-full">
              {total} total users
            </div>
          </div>

          {/* Role tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {ROLE_TABS.map((tab) => (
              <button key={tab} onClick={() => setRoleFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
                  roleFilter === tab
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {tab === 'all' ? 'All Users' : tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button type="submit"
              className="px-4 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition">
              Search
            </button>
            {search && (
              <button type="button" onClick={() => { setSearch(''); setSearchInput(''); }}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 transition">
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Stats row */}
        <div className="px-4 md:px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ROLE_TABS.slice(1).map((role) => {
            const s = ROLE_STYLES[role];
            const Icon = s.icon;
            return (
              <button key={role} onClick={() => setRoleFilter(role)}
                className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-all ${
                  roleFilter === role ? 'ring-2 ring-green-500' : ''
                }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.cls}`}>
                  <Icon size={15} />
                </div>
                <p className="text-xl font-extrabold text-gray-900">{roleCounts[role] ?? 0}</p>
                <p className="text-xs text-gray-500 capitalize font-medium">{role.replace('-', ' ')}s</p>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="px-4 md:px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            {loading ? (
              <div className="space-y-px">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-14 bg-gray-50 animate-pulse" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="py-20 text-center">
                <Users size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No users found</p>
              </div>
            ) : (
              <table className="w-full text-sm min-w-150">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Phone</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {u.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 leading-tight">{u.name}</p>
                            <p className="text-gray-400 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs hidden md:table-cell">
                        {u.phone || '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs hidden lg:table-cell">
                        {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Change role select */}
                          <select
                            value={u.role}
                            onChange={(e) => changeRole(u._id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700">
                            <option value="student">Student</option>
                            <option value="parent">Parent</option>
                            <option value="school-owner">School Owner</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => deleteUser(u._id, u.name)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
