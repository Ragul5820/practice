'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import Card from '@/components/ui/Card';
import { Trophy, Medal, Award, TrendingUp, Users, Star } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

type LeaderboardEntry = {
    userId: string;
    name: string;
    email: string;
    totalScore: number;
    assessmentsTaken: number;
    avgScore: number;
};

const RANK_ICONS = [
    { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
    { icon: Medal, color: 'text-gray-300', bg: 'bg-gray-300/10 border-gray-300/30' },
    { icon: Award, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' },
];

const COLORS = ['#f59e0b', '#9ca3af', '#f97316', '#0ea5e9', '#10b981', '#8b5cf6', '#ec4899'];

export default function LeaderboardPage() {
    const { user } = useAuth();
    const { resolvedTheme } = useTheme();
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [myRank, setMyRank] = useState<number | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/leaderboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setLeaders(data);
                    if (user) {
                        const rank = data.findIndex((e: LeaderboardEntry) => e.userId === user.id);
                        setMyRank(rank !== -1 ? rank + 1 : null);
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [user]);

    const top10 = leaders.slice(0, 10);
    const chartData = top10.map(l => ({ name: l.name.split(' ')[0], score: l.totalScore }));

    return (
        <div className="min-h-screen p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-xs font-bold text-primary-500 uppercase tracking-widest mb-4">
                    <Star className="w-3 h-3" /> Live Rankings
                </div>
                <h1 className="text-4xl font-extrabold text-gradient mb-2">Leaderboard</h1>
                <p className="text-gray-500">Top performers ranked by total points earned</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-20 glass rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : leaders.length === 0 ? (
                <Card className="text-center py-16">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-bold mb-2">No rankings yet</h2>
                    <p className="text-gray-500 text-sm">Be the first to complete an assessment!</p>
                </Card>
            ) : (
                <>
                    {/* My Rank Badge */}
                    {myRank !== null && (
                        <div className="mb-6 p-4 glass rounded-2xl border border-primary-500/20 flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Your current rank</p>
                                <p className="text-2xl font-extrabold text-primary-500">
                                    #{myRank}
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        out of {leaders.length} students
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Top 3 Podium */}
                    {leaders.length >= 3 && (
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {[1, 0, 2].map((rankIdx) => {
                                const entry = leaders[rankIdx];
                                const rank = rankIdx + 1;
                                const cfg = RANK_ICONS[rankIdx];
                                const Icon = cfg.icon;
                                const heights = ['h-36', 'h-44', 'h-30'];
                                return (
                                    <Card
                                        key={entry.userId}
                                        className={`flex flex-col items-center justify-end pb-6 border-2 ${cfg.bg} ${rankIdx === 0 ? 'order-2' : rankIdx === 1 ? 'order-1' : 'order-3'} ${heights[rankIdx === 0 ? 1 : rankIdx === 1 ? 0 : 2]}`}
                                    >
                                        <div className={`w-14 h-14 rounded-full border-2 ${cfg.bg} flex items-center justify-center mb-3`}>
                                            <Icon className={`w-7 h-7 ${cfg.color}`} />
                                        </div>
                                        <p className="font-bold text-sm text-center truncate w-full px-2">{entry.name}</p>
                                        <p className={`text-2xl font-extrabold ${cfg.color}`}>{entry.totalScore}</p>
                                        <p className="text-xs text-gray-500">pts · #{rank}</p>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Score Chart */}
                    {chartData.length > 0 && (
                        <Card className="mb-8">
                            <h2 className="font-bold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary-500" /> Top Scores
                            </h2>
                            <div className="h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'} />
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: resolvedTheme === 'light' ? '#64748b' : '#9ca3af' }} />
                                        <YAxis tick={{ fontSize: 11, fill: resolvedTheme === 'light' ? '#64748b' : '#9ca3af' }} />
                                        <Tooltip
                                            contentStyle={{ 
                                                backgroundColor: resolvedTheme === 'light' ? '#ffffff' : '#0f172a', 
                                                border: resolvedTheme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)', 
                                                borderRadius: '12px', 
                                                fontSize: 12,
                                                color: resolvedTheme === 'light' ? '#1e293b' : '#f8fafc' 
                                            }}
                                            itemStyle={{ color: resolvedTheme === 'light' ? '#3b82f6' : '#60a5fa' }}
                                            formatter={(v: any) => [v, 'Total Points']}
                                        />
                                        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                                            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    )}

                    {/* Full Rankings Table */}
                    <Card>
                        <h2 className="font-bold mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary-500" /> All Rankings
                        </h2>
                        <div className="overflow-hidden rounded-xl">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="px-4 py-3 font-semibold text-gray-400 w-14">Rank</th>
                                        <th className="px-4 py-3 font-semibold text-gray-400">Student</th>
                                        <th className="px-4 py-3 font-semibold text-gray-400 text-right">Assessments</th>
                                        <th className="px-4 py-3 font-semibold text-gray-400 text-right">Avg Score</th>
                                        <th className="px-4 py-3 font-semibold text-gray-400 text-right">Total Points</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {leaders.map((entry, i) => {
                                        const isMe = user?.id === entry.userId;
                                        const medal = i < 3 ? RANK_ICONS[i] : null;
                                        return (
                                            <tr
                                                key={entry.userId}
                                                className={`transition-colors ${isMe ? 'bg-primary-500/5 border-l-2 border-primary-500' : 'hover:bg-white/5'}`}
                                            >
                                                <td className="px-4 py-4">
                                                    {medal ? (
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${medal.bg}`}>
                                                            {(() => { const Icon = medal.icon; return <Icon className={`w-4 h-4 ${medal.color}`} />; })()}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 font-bold w-8 text-center block">#{i + 1}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                            {entry.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className={`font-semibold ${isMe ? 'text-primary-400' : ''}`}>
                                                                {entry.name} {isMe && <span className="text-xs text-primary-400">(You)</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right text-gray-400">{entry.assessmentsTaken}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className={`text-sm font-bold ${entry.avgScore >= 60 ? 'text-green-500' : 'text-red-400'}`}>
                                                        {entry.avgScore}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className="font-extrabold text-primary-400">{entry.totalScore}</span>
                                                    <span className="text-xs text-gray-500 ml-1">pts</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
