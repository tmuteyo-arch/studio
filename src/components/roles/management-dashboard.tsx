'use client';
import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { applicationsAtom, Application } from '@/lib/mock-data';
import { zimRegions } from '@/lib/types';
import { users as allUsers } from '@/lib/users';
import { 
  BarChart, 
  MapPin, 
  LayoutDashboard, 
  TrendingUp,
  Users,
  PieChart as PieChartIcon,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Bar, BarChart as ReChartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, Pie, PieChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';

const regionalChartConfig = {
  count: {
    label: 'Applications',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function ManagementDashboard() {
    const [applications] = useAtom(applicationsAtom);

    const summaryStats = React.useMemo(() => {
        return {
            totalApplications: applications.length,
            totalSigned: applications.filter(a => a.status === 'Signed').length,
            totalRejected: applications.filter(a => a.status === 'Rejected').length,
            totalInPipeline: applications.filter(a => !['Signed', 'Rejected', 'Archived'].includes(a.status)).length,
        };
    }, [applications]);

    const regionalData = React.useMemo(() => {
        return zimRegions.map(region => ({
            name: region,
            count: applications.filter(app => app.region === region).length,
        })).sort((a, b) => b.count - a.count);
    }, [applications]);

    const teamPerformance = React.useMemo(() => {
        const supervisors = allUsers.filter(u => u.role === 'supervisor');
        const clerks = allUsers.filter(u => u.role === 'back-office');

        return {
            supervisors: supervisors.map(sup => ({
                name: sup.name,
                initials: sup.initials,
                signed: applications.filter(a => a.history.some(h => h.user === sup.name && h.action.includes('Signed'))).length,
                rejected: applications.filter(a => a.history.some(h => h.user === sup.name && h.action === 'Rejected')).length,
            })),
            clerks: clerks.map(clk => ({
                name: clk.name,
                initials: clk.initials,
                processed: applications.filter(a => a.history.some(h => h.user === clk.name && (h.action === 'Pending Supervisor' || h.action === 'Returned to ATL'))).length,
            }))
        };
    }, [applications]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold">MANAGEMENT</h2>
                  <p className="text-muted-foreground">Strategic oversight and operational performance metrics.</p>
                </div>
            </div>
            
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-muted-foreground">Total Registry</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{summaryStats.totalApplications}</div></CardContent>
                </Card>
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-primary">Finalized (Done)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{summaryStats.totalSigned}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-muted-foreground">Active Pipeline</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{summaryStats.totalInPipeline}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-destructive">Rejected</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{summaryStats.totalRejected}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="analytics" className="w-full">
                <TabsList className="bg-muted/50 p-1 mb-6">
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Regional Trends
                    </TabsTrigger>
                    <TabsTrigger value="team" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team Performance
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Operation Log
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Application Volume by Province
                                </CardTitle>
                                <CardDescription>Distribution of sign-ups across Zimbabwe's regions.</CardDescription>
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
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Market Capture Ranking</CardTitle>
                                <CardDescription>Top regions by total volume.</CardDescription>
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

                <TabsContent value="team" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Supervisor Throughput
                                </CardTitle>
                                <CardDescription>Sign-off and rejection metrics for Back Office Supervisors.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Supervisor</TableHead>
                                            <TableHead className="text-center">Finalized</TableHead>
                                            <TableHead className="text-center">Rejected</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teamPerformance.supervisors.map(sup => (
                                            <TableRow key={sup.name}>
                                                <TableCell className="font-medium flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-[8px]">{sup.initials}</AvatarFallback>
                                                    </Avatar>
                                                    {sup.name}
                                                </TableCell>
                                                <TableCell className="text-center text-green-600 font-bold">{sup.signed}</TableCell>
                                                <TableCell className="text-center text-destructive font-bold">{sup.rejected}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Clerk Verification Output
                                </CardTitle>
                                <CardDescription>Total case volume processed by Back Office Clerks.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Clerk</TableHead>
                                            <TableHead className="text-right">Cases Processed</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teamPerformance.clerks.map(clk => (
                                            <TableRow key={clk.name}>
                                                <TableCell className="font-medium flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-[8px]">{clk.initials}</AvatarFallback>
                                                    </Avatar>
                                                    {clk.name}
                                                </TableCell>
                                                <TableCell className="text-right font-bold">{clk.processed}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Registry Activity</CardTitle>
                            <CardDescription>Live feed of finalized agent sign-ups.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Province</TableHead>
                                        <TableHead>Account Type</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applications.slice(0, 10).map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell>
                                                <div className="font-medium">{app.clientName}</div>
                                                <div className="text-[10px] text-muted-foreground font-mono">{app.id}</div>
                                            </TableCell>
                                            <TableCell><span className="text-xs">{app.region}</span></TableCell>
                                            <TableCell><span className="text-xs">{app.clientType}</span></TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={app.status === 'Signed' ? 'success' : app.status === 'Rejected' ? 'destructive' : 'secondary'} className="text-[10px]">
                                                    {app.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      );
}
