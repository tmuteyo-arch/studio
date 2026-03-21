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
  Clock
} from 'lucide-react';
import { Bar, BarChart as ReChartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '@/components/ui/badge';
import { isToday, parseISO } from 'date-fns';

const regionalChartConfig = {
  count: {
    label: 'Applications',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function ManagementDashboard() {
    const [applications] = useAtom(applicationsAtom);
    const [allUsers] = useAtom(usersAtom);
    const [activityLogs] = useAtom(activityLogsAtom);

    const summaryStats = React.useMemo(() => {
        const createdToday = activityLogs.filter(log => log.action === 'Account Created' && isToday(parseISO(log.timestamp))).length;
        return {
            totalActive: applications.filter(a => !['Archived', 'Rejected'].includes(a.status)).length,
            totalDone: applications.filter(a => a.status === 'Archived' || a.status === 'Signed').length,
            totalRejected: applications.filter(a => a.status === 'Rejected').length,
            totalPending: applications.filter(a => ['Submitted', 'In Review', 'Pending Compliance', 'Pending Supervisor'].includes(a.status)).length,
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
                total: atlApps.length,
                done: atlApps.filter(a => a.status === 'Signed' || a.status === 'Archived').length,
                rejected: atlApps.filter(a => a.status === 'Rejected').length,
                pending: atlApps.filter(a => !['Signed', 'Rejected', 'Archived'].includes(a.status)).length,
                lastSeen: lastLog ? new Date(lastLog.timestamp).toLocaleTimeString() : 'N/A',
                status: lastLog?.action === 'Login' ? 'active' : 'offline'
            };
        }).sort((a, b) => b.total - a.total);
    }, [applications, allUsers, activityLogs]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Management Dashboard</h2>
                  <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Strategic oversight of ASL output and system availability.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1">
                        <Activity className="mr-2 h-3 w-3" />
                        {summaryStats.createdToday} Originated Today
                    </Badge>
                </div>
            </div>
            
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                <Card className="shadow-sm border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2"><CardTitle className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Originated Today</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-black">{summaryStats.createdToday}</div></CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">Active Portfolio</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{summaryStats.totalActive}</div></CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">Awaiting Action</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{summaryStats.totalPending}</div></CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-[9px] font-bold uppercase text-green-500 tracking-wider">Finalized</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{summaryStats.totalDone}</div></CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-[9px] font-bold uppercase text-destructive tracking-wider">Rejected</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{summaryStats.totalRejected}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="monitoring" className="w-full">
                <TabsList className="bg-muted/50 p-1 mb-6">
                    <TabsTrigger value="monitoring" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Personnel Monitoring
                    </TabsTrigger>
                    <TabsTrigger value="team" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        ASL Performance
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Regional Trends
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="monitoring" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 shadow-md">
                            <CardHeader className="border-b border-white/5">
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5 text-primary" />
                                    Security & Registry Activity Logs
                                </CardTitle>
                                <CardDescription>Live telemetry of ASL interaction with the portal.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[400px] overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30">
                                                <TableHead className="text-[10px] uppercase font-bold">ASL User</TableHead>
                                                <TableHead className="text-[10px] uppercase font-bold">Action Logged</TableHead>
                                                <TableHead className="text-[10px] uppercase font-bold">Timestamp</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {activityLogs.slice(0, 50).map((log) => (
                                                <TableRow key={log.id} className="hover:bg-muted/10 border-white/5">
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">{log.userName.substring(0,2)}</div>
                                                            <span className="font-bold text-sm">{log.userName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={log.action === 'Login' ? 'success' : log.action === 'Logout' ? 'outline' : 'default'} className="text-[9px] uppercase font-black tracking-widest">
                                                            {log.action}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-[11px] text-muted-foreground font-mono">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-green-500" />
                                    Active Now
                                </CardTitle>
                                <CardDescription>ASLs currently authenticated in the portal.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {atlPerformance.filter(a => a.status === 'active').length > 0 ? (
                                        atlPerformance.filter(a => a.status === 'active').map((atl) => (
                                            <div key={atl.name} className="flex items-center justify-between p-3 rounded-xl border border-green-500/20 bg-green-500/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="text-sm font-black uppercase">{atl.name}</span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-mono">IN: {atl.lastSeen}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground italic text-xs">No active sessions.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="team" className="space-y-6">
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Award className="h-5 w-5" />
                                ASL Performance Audit
                            </CardTitle>
                            <CardDescription> Monitoring originated volume and registry success rates.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead>ASL Name</TableHead>
                                        <TableHead className="text-center">Total Originated</TableHead>
                                        <TableHead className="text-center text-green-600">Done</TableHead>
                                        <TableHead className="text-center text-destructive">Rejected</TableHead>
                                        <TableHead className="text-center text-amber-600">Active</TableHead>
                                        <TableHead className="text-right">Success Rate</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {atlPerformance.map((atl) => (
                                        <TableRow key={atl.name} className="hover:bg-muted/20 transition-colors">
                                            <TableCell className="font-medium flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-[10px] font-bold">{atl.initials}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-bold">{atl.name}</span>
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">{atl.total}</TableCell>
                                            <TableCell className="text-center font-bold text-green-600">{atl.done}</TableCell>
                                            <TableCell className="text-center font-bold text-destructive">{atl.rejected}</TableCell>
                                            <TableCell className="text-center font-bold text-amber-600">{atl.pending}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={atl.total > 0 && (atl.done / atl.total) > 0.8 ? 'success' : 'outline'} className="font-mono">
                                                    {atl.total > 0 ? Math.round((atl.done / atl.total) * 100) : 0}%
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Regional Distribution
                                </CardTitle>
                                <CardDescription>Application volume across Zimbabwe's provinces.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={regionalChartConfig} className="h-[350px] w-full">
                                    <ResponsiveContainer>
                                        <ReChartsBarChart data={regionalData} layout="vertical" margin={{ left: 50, right: 20 }}>
                                            <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.1} />
                                            <XAxis type="number" hide />
                                            <YAxis 
                                                dataKey="name" 
                                                type="category" 
                                                tickLine={false} 
                                                axisLine={false} 
                                                width={140}
                                                className="text-xs font-medium"
                                            />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                            <Bar dataKey="count" radius={4} barSize={20}>
                                                {regionalData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} />
                                                ))}
                                            </Bar>
                                        </ReChartsBarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>Market Ranking</CardTitle>
                                <CardDescription>Top provinces by volume.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {regionalData.slice(0, 10).map((region, index) => (
                                        <div key={region.name} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors border-b last:border-0 border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold ${index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                    {index + 1}
                                                </div>
                                                <span className="text-sm font-medium">{region.name}</span>
                                            </div>
                                            <Badge variant="secondary" className="font-mono">{region.count}</Badge>
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
