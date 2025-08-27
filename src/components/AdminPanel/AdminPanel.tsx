import React, { useState, useEffect } from 'react';
import { Users, Database, Shield, Activity } from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { supabase } from '../../lib/supabase';

interface UserStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
}

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const AdminPanel: React.FC = () => {
  const { userRole } = useSupabase();
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchUserData();
    }
  }, [userRole]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profiles with role information
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, role, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Fetch user authentication data
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) {
        throw authError;
      }

      // Combine profile and auth data
      const combinedUsers: User[] = authUsers.users.map(authUser => {
        const profile = profiles?.find(p => p.user_id === authUser.id);
        return {
          id: authUser.id,
          email: authUser.email || 'No email',
          role: profile?.role || 'user',
          created_at: authUser.created_at,
        };
      });

      setUsers(combinedUsers);

      // Calculate stats
      const stats: UserStats = {
        totalUsers: combinedUsers.length,
        adminUsers: combinedUsers.filter(user => user.role === 'admin').length,
        regularUsers: combinedUsers.filter(user => user.role === 'user').length,
      };

      setUserStats(stats);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

      // Refresh user data
      await fetchUserData();
      alert(`User role updated to ${newRole} successfully!`);
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Failed to update user role');
    }
  };

  if (userRole !== 'admin') {
    return (
      <div 
        className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center"
        style={{ fontFamily: 'Times New Roman, serif' }}
        data-source-tsx="AdminPanel Unauthorized|src/components/AdminPanel/AdminPanel.tsx"
      >
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Shield className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="pt-20 min-h-screen bg-gray-50" 
      style={{ fontFamily: 'Times New Roman, serif' }}
      data-source-tsx="AdminPanel|src/components/AdminPanel/AdminPanel.tsx"
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-8">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 
              className="text-3xl font-bold text-gray-800"
              data-source-tsx="AdminPanel Title|src/components/AdminPanel/AdminPanel.tsx"
            >
              Admin Panel
            </h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-800">{userStats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-600">Admin Users</p>
                  <p className="text-2xl font-bold text-red-800">{userStats.adminUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <Activity className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-600">Regular Users</p>
                  <p className="text-2xl font-bold text-green-800">{userStats.regularUsers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Management Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 
                className="text-xl font-semibold text-gray-800"
                data-source-tsx="AdminPanel Users Title|src/components/AdminPanel/AdminPanel.tsx"
              >
                User Management
              </h2>
              <button
                onClick={fetchUserData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                data-source-tsx="AdminPanel Refresh Button|src/components/AdminPanel/AdminPanel.tsx"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {error && (
              <div 
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4"
                data-source-tsx="AdminPanel Error Message|src/components/AdminPanel/AdminPanel.tsx"
              >
                {error}
              </div>
            )}

            {loading ? (
              <div 
                className="text-center py-8"
                data-source-tsx="AdminPanel Loading|src/components/AdminPanel/AdminPanel.tsx"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading user data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          data-source-tsx="AdminPanel User Email|src/components/AdminPanel/AdminPanel.tsx"
                        >
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'admin' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}
                            data-source-tsx="AdminPanel User Role Badge|src/components/AdminPanel/AdminPanel.tsx"
                          >
                            {user.role}
                          </span>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          data-source-tsx="AdminPanel User Created Date|src/components/AdminPanel/AdminPanel.tsx"
                        >
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {user.role === 'admin' ? (
                            <button
                              onClick={() => updateUserRole(user.id, 'user')}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              data-source-tsx="AdminPanel Demote Button|src/components/AdminPanel/AdminPanel.tsx"
                            >
                              Demote to User
                            </button>
                          ) : (
                            <button
                              onClick={() => updateUserRole(user.id, 'admin')}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              data-source-tsx="AdminPanel Promote Button|src/components/AdminPanel/AdminPanel.tsx"
                            >
                              Promote to Admin
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div 
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
            data-source-tsx="AdminPanel Warning|src/components/AdminPanel/AdminPanel.tsx"
          >
            <div className="flex items-start space-x-3">
              <Database className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Admin Panel Features</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This admin panel allows you to view user statistics and manage user roles. 
                  Role changes are immediately reflected in the database and affect user permissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;