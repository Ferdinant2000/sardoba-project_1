import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { User, UserRole } from '../types';
import { Loader2, Save, Search, Shield, User as UserIcon } from 'lucide-react';

const Admin: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // Map DB users to User interface
                const mapped: User[] = data.map((u: any) => ({
                    id: u.id,
                    telegramId: u.telegram_id,
                    name: u.name || 'Unknown',
                    role: u.role as UserRole,
                    avatarUrl: u.avatar_url,
                    phone: u.phone,
                    age: u.age
                }));
                setUsers(mapped);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            setEditingUserId(null);
            alert('Role updated successfully');
        } catch (error: any) {
            console.error('Error updating role:', error);
            alert('Failed to update role: ' + error.message);
        }
    };

    const startEditing = (user: User) => {
        setEditingUserId(user.id);
        setSelectedRole(user.role);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(u.telegramId).includes(searchTerm)
    );

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
            <Loader2 className="animate-spin text-blue-500" />
        </div>
    );

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-white">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 flex items-center">
                        <Shield className="mr-3 text-blue-600" />
                        Admin Panel
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage user roles and permissions</p>
                </div>

                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or Telegram ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Telegram ID</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Role</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 mr-3 overflow-hidden">
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserIcon size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    {user.phone && <div className="text-xs text-slate-500">{user.phone}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-sm">
                                            {user.telegramId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${user.role === UserRole.DEVELOPER
                                                    ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
                                                    : user.role === UserRole.ADMIN
                                                        ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                                        : user.role === UserRole.STAFF
                                                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                                            : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                                                }
                                            `}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingUserId === user.id ? (
                                                <div className="flex items-center space-x-2">
                                                    <select
                                                        value={selectedRole}
                                                        onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                                                        className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    >
                                                        {Object.values(UserRole).map(role => (
                                                            <option key={role} value={role}>{role}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => handleRoleChange(user.id, selectedRole)}
                                                        className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 transition-colors"
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startEditing(user)}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                                                >
                                                    Edit Role
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
