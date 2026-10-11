'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { UserCheck, UserX, Loader2, Users, Search } from 'lucide-react';

export default function AdminStudentsPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setStudents(data);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleApprove = async (studentId: string) => {
        setActionLoading(studentId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/students/${studentId}/approve`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setStudents(students.map((s: any) => 
                    s.id === studentId ? { ...s, isApproved: true } : s
                ));
            }
        } catch (error) {
            console.error('Approval failed:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredStudents = students.filter((s: any) => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gradient mb-2">Student Management</h1>
                    <p className="text-slate-600 dark:text-gray-400">Review and approve new student registrations</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 glass rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : filteredStudents.length > 0 ? (
                <div className="overflow-hidden glass rounded-2xl border border-black/5 dark:border-white/5">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
                                <th className="px-6 py-4 font-semibold">Student</th>
                                <th className="px-6 py-4 font-semibold">Email</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5">
                            {filteredStudents.map((student: any) => (
                                <tr key={student.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 dark:text-white">{student.name}</div>
                                        <div className="text-xs text-slate-500 dark:text-gray-500">Joined {new Date(student.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{student.email}</td>
                                    <td className="px-6 py-4">
                                        {student.isApproved ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold">
                                                <UserCheck className="w-3 h-3" />
                                                Approved
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-bold">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {!student.isApproved && (
                                            <Button 
                                                variant="primary" 
                                                className="py-1.5 px-4 text-xs"
                                                loading={actionLoading === student.id}
                                                onClick={() => handleApprove(student.id)}
                                            >
                                                Approve Access
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-20 glass rounded-2xl">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-bold mb-2">No students found</h2>
                    <p className="text-gray-600 dark:text-gray-400">No student accounts match your criteria</p>
                </div>
            )}
        </div>
    );
}
