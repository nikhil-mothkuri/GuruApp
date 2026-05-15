import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Shield, Users, Calendar, Star } from 'lucide-react';

function useAdminMetrics() {
  return useQuery({ queryKey: ['admin', 'metrics'], queryFn: () => api.get('/admin/metrics').then((r) => r.data.data) });
}

function useAdminUsers() {
  return useQuery({ queryKey: ['admin', 'users'], queryFn: () => api.get('/admin/users').then((r) => r.data) });
}

export default function AdminPanel() {
  const { data: metrics } = useAdminMetrics();
  const { data: usersData } = useAdminUsers();
  const qc = useQueryClient();

  const updateUser = useMutation({
    mutationFn: ({ id, ...data }: { id: string; isActive?: boolean; isGuru?: boolean; isStudent?: boolean }) =>
      api.patch(`/admin/users/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-5 h-5 text-[#1a73e8]" />
          <h1 className="text-2xl font-normal text-[#202124]">Admin Panel</h1>
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Users, label: 'Total Users', value: metrics.totalUsers, color: 'text-[#1a73e8] bg-[#e8f0fe]' },
              { icon: Calendar, label: 'Total Bookings', value: metrics.totalBookings, color: 'text-[#1e8e3e] bg-[#e6f4ea]' },
              { icon: Star, label: 'Total Ratings', value: metrics.totalRatings, color: 'text-[#b06000] bg-[#fef7e0]' },
              { icon: Users, label: 'Active Gurus', value: metrics.activeGurus, color: 'text-[#d93025] bg-[#fce8e6]' },
            ].map((m) => (
              <div key={m.label} className="bg-white border border-[#e0e0e0] rounded-xl p-5 g-card">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${m.color.split(' ')[1]}`}>
                  <m.icon className={`w-5 h-5 ${m.color.split(' ')[0]}`} />
                </div>
                <p className="text-2xl font-medium text-[#202124]">{m.value}</p>
                <p className="text-xs text-[#5f6368] mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Users table */}
        <div className="bg-white border border-[#e0e0e0] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e8eaed]">
            <h2 className="text-sm font-medium text-[#202124]">Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e8eaed]">
                  {['Name', 'Email', 'Guru', 'Student', 'Active', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#5f6368] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usersData?.data?.map((u: { id: string; name: string; email: string; isGuru: boolean; isStudent: boolean; isActive: boolean; isAdmin: boolean }) => (
                  <tr key={u.id} className="border-b border-[#f1f3f4] last:border-0 hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-[#202124]">{u.name}</td>
                    <td className="px-5 py-3.5 text-sm text-[#5f6368]">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={u.isGuru}
                        onChange={(e) => updateUser.mutate({ id: u.id, isGuru: e.target.checked })}
                        className="w-4 h-4 rounded border-[#dadce0] text-[#1a73e8] focus:ring-[#1a73e8] cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={u.isStudent}
                        onChange={(e) => updateUser.mutate({ id: u.id, isStudent: e.target.checked })}
                        className="w-4 h-4 rounded border-[#dadce0] text-[#1a73e8] focus:ring-[#1a73e8] cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={u.isActive}
                        onChange={(e) => updateUser.mutate({ id: u.id, isActive: e.target.checked })}
                        className="w-4 h-4 rounded border-[#dadce0] text-[#1a73e8] focus:ring-[#1a73e8] cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      {u.isAdmin && (
                        <span className="text-xs bg-[#e8f0fe] text-[#1a73e8] px-2.5 py-0.5 rounded-full font-medium">Admin</span>
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
}
