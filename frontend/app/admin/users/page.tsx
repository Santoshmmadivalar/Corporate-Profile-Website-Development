'use client';

import React, { useEffect, useState } from 'react';
import { getAdminUsers, updateUserRole, deleteUser } from '../../../services/api';
import { User } from '../../../types';
import { Search, Filter, Trash2, Edit2, ShieldAlert, ArrowLeft, Download, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'employee' | 'client' | 'candidate' | 'user'>('user');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAdminUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to load user directory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const response = await updateUserRole(userId, selectedRole);
      if (response.success) {
        setActionSuccess(response.message || 'User role successfully updated');
        setEditingUserId(null);
        fetchUsers();
      } else {
        setActionError(response.message || 'Failed to update user role');
      }
    } catch (error: any) {
      setActionError(error.message || 'Server error while updating role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    
    setActionError(null);
    setActionSuccess(null);
    try {
      const response = await deleteUser(userId);
      if (response.success) {
        setActionSuccess(response.message || 'User deleted successfully');
        fetchUsers();
      } else {
        setActionError(response.message || 'Failed to delete user');
      }
    } catch (error: any) {
      setActionError(error.message || 'Server error while deleting user');
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,Name,Email,Role,Phone,Company,Created At\n';
    const csvRows = filteredUsers.map(u => 
      `"${u._id}","${u.name}","${u.email}","${u.role}","${u.phone || ''}","${u.companyName || ''}","${u.createdAt || ''}"`
    ).join('\n');
    
    const blob = new Blob([headers + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'outpro_user_directory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === '' || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">User & Employee Directory</h1>
          <p className="text-muted-foreground mt-1">
            Audit register profiles, assign workflow roles, or revoke system access
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-xl shadow-lg transition-all duration-200"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Notifications Alerts */}
      <AnimatePresence>
        {actionSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-sm font-medium flex items-center justify-between"
          >
            <span>{actionSuccess}</span>
            <button onClick={() => setActionSuccess(null)} className="text-xs underline hover:no-underline">Dismiss</button>
          </motion.div>
        )}
        {actionError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium flex items-center justify-between"
          >
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-xs underline hover:no-underline">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/60 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/60 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 appearance-none font-semibold text-sm"
          >
            <option value="">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="employee">Employees</option>
            <option value="client">Clients</option>
            <option value="candidate">Candidates</option>
            <option value="user">Standard Users</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-border/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/40 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Phone / Organization</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground animate-pulse font-medium">
                    Loading users directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground font-medium">
                    No users match your criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-secondary/20 transition-all duration-150">
                    <td className="py-4 px-6 font-bold text-foreground">
                      {u.name}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground font-medium">{u.email}</td>
                    <td className="py-4 px-6">
                      {editingUserId === u._id ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={selectedRole}
                            onChange={(e: any) => setSelectedRole(e.target.value)}
                            className="py-1 px-2 text-xs rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="admin">Admin</option>
                            <option value="employee">Employee</option>
                            <option value="client">Client</option>
                            <option value="candidate">Candidate</option>
                            <option value="user">User</option>
                          </select>
                          <button
                            onClick={() => handleUpdateRole(u._id)}
                            className="p-1 bg-primary text-primary-foreground rounded hover:opacity-90"
                          >
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                          u.role === 'employee' ? 'bg-emerald-500/10 text-emerald-500' :
                          u.role === 'client' ? 'bg-violet-500/10 text-violet-500' :
                          u.role === 'candidate' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {u.phone || 'N/A'} {u.companyName ? `• ${u.companyName}` : ''}
                    </td>
                    <td className="py-4 px-6 text-right space-x-3">
                      <button
                        onClick={() => {
                          setEditingUserId(u._id);
                          setSelectedRole(u.role);
                        }}
                        className="inline-flex items-center p-1.5 bg-secondary text-foreground hover:bg-accent border border-border/40 rounded-lg transition-colors"
                        title="Edit User Role"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="inline-flex items-center p-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
