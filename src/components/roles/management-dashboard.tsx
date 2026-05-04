'use client';
import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { applicationsAtom, Application, activityLogsAtom } from '@/lib/mock-data';
import { zimRegions } from '@/lib/types';
import { usersAtom } from '@/lib/users';
import { 
  TrendingUp,
  Users,
  LayoutDashboard,
  MapPin,
  Award,
  BarChart,
  Activity,
  History,
  ShieldCheck,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ListFilter
} from 'lucide-react';
import { Bar, BarChart as ReChartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '@/components/ui/badge';
import { isToday, parseISO } from 'date-fns';
import { getStateLabel } from '@/lib/state-machine';

const regionalChartConfig = {
  count: {
    label: 'Total',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function ManagementDashboard() {
    const [applications] = useAtom(applicationsAtom);
    const [allUsers] = useAtom(usersAtom);
    const [activityLogs] = useAtom(activityLogsAtom);

    // Group totals by status
    const statusTotals = React.useMemo(() => {
        const counts: Record<string, number> = {};
        applications.forEach(app => {
            counts[app.status] = (counts[app.status] || 0) + 1;
        });
        return counts;
    }, [applications]);

    const summaryStats = React.useMemo(() => {
        const createdToday = activityLogs.filter(log => log.action === 'Account Created' && isToday(parseISO(log.timestamp))).length;
        return {
            totalActive: applications.filter(a => !['Locked', 'Rejected'].includes(a.status)).length,
            totalDone: applications.filter(a => ['Approved', 'Dispatched', 'Locked'].includes(a.status)).length,
            totalRejected: applications.filter(a => a.status === 'Rejected').length,
            totalPending: applications.filter(a => ['Under Review', 'Pending Supervisor', 'Pending Executive Signature', 'Approved by Management'].includes(a.status)).length,
            createdToday,
        };
    }, [applications, activityLogs]);

    const regionalData = React.useMemo(() => {
        return zimRegions.map(region => ({
            name: region,
            count: applications.filter(app => app.region === region).length,
        })).sort((a, b) => b.count - a.count);
    }, [applications]);

    const atlPerformance = React.useMemo(() => {
        const atlUsers = allUsers.filter(u => u.role === 'asl');
        return atlUsers.map(atl => {
            const atlApps = applications.filter(app => app.submittedBy === atl.name);
            const lastLog = activityLogs.find(l => l.userName === atl.name && (l.action === 'Login' || l.action === 'Logout'));
            
            return {
                name: atl.name,
                initials: atl.initials,
                created: atlApps.length,
                processed: atlApps.filter(a => !['Draft', 'In Progress', 'Under Review'].includes(a.status)).length,
                approved: atlApps.filter(a => ['Approved', 'Dispatched', 'Locked'].includes(a.status)).length,
                rejected: atlApps.filter(a => a.status === 'Rejected').length,
                lastSeen: lastLog ? new Date(lastLog.timestamp).toLocaleTimeString() : 'N/A',
                status: lastLog?.action === 'Login' ? 'active' : 'offline'
            };
        }).sort((a, b) => b.created - a.created);
    }, [applications, allUsers, activityLogs]);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 border-b border-white/5 pb-8">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
                    <LayoutDashboard className="h-10 w-10 text-primary" />
                    Management Overview
                  </h2>
                  <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Global System Metrics and Sales Performance.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black px-4 py-2 uppercase tracking-widest text-[10px]">
                        <Activity className="mr-2 h-3.5 w-3.5" />
                        {summaryStats.createdToday} NEW TODAY
                    </Badge>
                </div>
            </div>
            
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                <Card className="bg-white/5 border-white/10 rounded-2xl shadow-xl">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Total</CardTitle></CardHeader>
                    <CardContent><div className="text-4xl font-black text-white">{applications.length}</div></CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-2xl shadow-xl">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Processing</CardTitle></CardHeader>
                    <CardContent><div className="text-4xl font-black text-white">{summaryStats.totalPending}</div></CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-2xl shadow-xl">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-green-500 tracking-[0.2em]">Success</CardTitle></CardHeader>
                    <CardContent><div className="text-4xl font-black text-green-500">{summaryStats.totalDone}</div></CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-2xl shadow-xl">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-destructive tracking-[0.2em]">Rejected</CardTitle></CardHeader>
                    <CardContent><div className="text-4xl font-black text-destructive">{summaryStats.totalRejected}</div></CardContent>
                </Card>
                <Card className="bg-primary/10 border-primary/20 rounded-2xl shadow-xl md:col-span-2 lg:col-span-1">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Growth Rate</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-primary">+{summaryStats.createdToday}</div>
                        <p className="text-[10px] font-bold uppercase text-primary/40 mt-1">Daily Inflow</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="performance" className="w-full">
                <TabsList className="bg-white/5 p-1.5 rounded-xl border border-white/5 mb-10 w-full sm:w-auto overflow-x-auto">
                    <TabsTrigger value="performance" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] transition-all">
                        <Award className="mr-2 h-4 w-4" /> SALES PERFORMANCE
                    </TabsTrigger>
                    <TabsTrigger value="status-breakdown" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] transition-all">
                        <ListFilter className="mr-2 h-4 w-4" /> STATUS TOTALS
                    </TabsTrigger>
                    <TabsTrigger value="monitoring" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] transition-all">
                        <ShieldCheck className="mr-2 h-4 w-4" /> STAFF LOGS
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] transition-all">
                        <TrendingUp className="mr-2 h-4 w-4" /> REGIONAL STATS
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="animate-in fade-in duration-500">
                    <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden">
                        <CardHeader className="bg-white/5 py-8 px-10 border-b border-white/5">
                            <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Award className="h-6 w-6 text-primary" /> Sales Leader Scorecard
                            </CardTitle>
                            <CardDescription className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Detailed performance metrics grouped by Sales Leader.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                                        <TableHead className="pl-10 text-[10px] font-black uppercase tracking-widest text-white/40">Leader</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">Created</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">Processed</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">Approved</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">Rejected</TableHead>
                                        <TableHead className="pr-10 text-right text-[10px] font-black uppercase tracking-widest text-white/40">Efficiency</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {atlPerformance.map((atl) => (
                                        <TableRow key={atl.name} className="hover:bg-white/5 border-white/5 transition-colors group">
                                            <TableCell className="pl-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-10 w-10 border-2 border-white/10 shadow-lg">
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">{atl.initials}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-black text-white text-lg uppercase tracking-tight group-hover:text-primary transition-colors">{atl.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className={`h-1.5 w-1.5 rounded-full ${atl.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
                                                            <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">{atl.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-lg font-black text-white">{atl.created}</TableCell>
                                            <TableCell className="text-center font-mono text-lg font-black text-white/60">{atl.processed}</TableCell>
                                            <TableCell className="text-center font-mono text-lg font-black text-green-500">{atl.approved}</TableCell>
                                            <TableCell className="text-center font-mono text-lg font-black text-destructive">{atl.rejected}</TableCell>
                                            <TableCell className="pr-10 text-right">
                                                <Badge className="font-black text-sm px-4 py-1.5 shadow-lg bg-white/5 text-white border-white/10">
                                                    {atl.created > 0 ? Math.round((atl.approved / atl.created) * 100) : 0}%
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="status-breakdown" className="animate-in fade-in duration-500">
                    <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden">
                        <CardHeader className="bg-white/5 py-8 px-10 border-b border-white/5">
                            <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <ListFilter className="h-6 w-6 text-primary" /> Application Status Totals
                            </CardTitle>
                            <CardDescription className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Real-time counts grouped by every stage of the lifecycle.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {Object.entries(statusTotals).map(([status, count]) => (
                                    <div key={status} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group shadow-inner">
                                        <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-3">{getStateLabel(status as any)}</p>
                                        <div className="flex items-end justify-between">
                                            <span className="text-4xl font-black text-white group-hover:text-primary transition-colors">{count}</span>
                                            <Badge variant="outline" className="text-[9px] font-black border-white/5 bg-black/20 text-white/40">RECORDS</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="monitoring" className="animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-2 border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden">
                            <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                                <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
                                    <History className="h-6 w-6 text-primary" /> System Activity Log
                                </CardTitle>
                                <CardDescription className="text-xs uppercase font-bold tracking-widest text-white/40 mt-1">Live audit of technical logins and record movements.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[500px] overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-black/20 border-white/5">
                                                <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest">Employee</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest">System Action</TableHead>
                                                <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest">Time</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {activityLogs.slice(0, 50).map((log) => (
                                                <TableRow key={log.id} className="hover:bg-white/5 border-white/5 transition-colors">
                                                    <TableCell className="pl-8 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-black text-primary border border-primary/20">{log.userName.substring(0,2)}</div>
                                                            <span className="font-black text-xs uppercase text-white/80">{log.userName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={log.action === 'Login' ? 'success' : log.action === 'Logout' ? 'outline' : 'default'} className="text-[9px] uppercase font-black tracking-widest px-3 py-1">
                                                            {log.action}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="pr-8 text-right text-[10px] text-white/20 font-mono">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden">
                            <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-green-500">
                                    <UserCheck className="h-4 w-4" /> Employees Online
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-4">
                                    {atlPerformance.filter(a => a.status === 'active').length > 0 ? (
                                        atlPerformance.filter(a => a.status === 'active').map((atl) => (
                                            <div key={atl.name} className="flex items-center justify-between p-4 rounded-2xl border border-green-500/20 bg-green-500/5 shadow-inner">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                                    <span className="text-sm font-black uppercase tracking-tight text-white">{atl.name}</span>
                                                </div>
                                                <span className="text-[10px] text-white/30 font-mono">{atl.lastSeen}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-white/10 gap-3">
                                            <UserCheck className="h-10 w-10 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-widest italic">No active sessions found.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-2 border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden">
                            <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                                <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
                                    <MapPin className="h-6 w-6 text-primary" /> Regional Volume Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-10">
                                <ChartContainer config={regionalChartConfig} className="h-[400px] w-full">
                                    <ResponsiveContainer>
                                        <ReChartsBarChart data={regionalData} layout="vertical" margin={{ left: 50, right: 30 }}>
                                            <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.05} />
                                            <XAxis type="number" hide />
                                            <YAxis 
                                                dataKey="name" 
                                                type="category" 
                                                tickLine={false} 
                                                axisLine={false} 
                                                width={140}
                                                className="text-[10px] font-black uppercase text-white/30"
                                            />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                            <Bar dataKey="count" radius={6} barSize={24}>
                                                {regionalData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.05)'} />
                                                ))}
                                            </Bar>
                                        </ReChartsBarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden">
                            <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Network Rankings</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-4">
                                    {regionalData.slice(0, 10).map((region, index) => (
                                        <div key={region.name} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-black shadow-lg ${index < 3 ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-white/30'}`}>
                                                    {index + 1}
                                                </div>
                                                <span className="text-sm font-black uppercase tracking-tight text-white/70 group-hover:text-white transition-colors">{region.name}</span>
                                            </div>
                                            <Badge variant="secondary" className="font-mono text-sm px-3 bg-black/30 text-white/40 border-none shadow-inner">{region.count}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
      );
}
