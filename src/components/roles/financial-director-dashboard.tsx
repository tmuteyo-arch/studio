'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { applicationsAtom, Application } from '@/lib/mock-data';
import { User, users as allUsers } from '@/lib/users';
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  Wallet, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  LayoutDashboard,
  Database,
  History,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import ApplicationReview from '../onboarding/application-review';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Bar, 
  BarChart as ReChartsBarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Cell,
  Tooltip as ReChartsTooltip 
} from 'recharts';
import { ChartContainer, ChartConfig } from '@/components/ui/chart';
import { differenceInHours, parseISO } from 'date-fns';

interface FinancialDirectorDashboardProps {
    user: User;
}

const efficiencyChartConfig = {
  count: {
    label: 'Processed',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function FinancialDirectorDashboard({ user }: FinancialDirectorDashboardProps) {
    const [applications] = useAtom(applicationsAtom);
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');

    const backOfficeUsers = React.useMemo(() => 
        allUsers.filter(u => u.role === 'back-office'), 
    []);

    const supervisors = React.useMemo(() => 
        allUsers.filter(u => u.role === 'supervisor'), 
    []);

    const stats = React.useMemo(() => {
        const total = applications.length;
        const approved = applications.filter(a => a.status === 'Signed').length;
        const rejected = applications.filter(a => a.status === 'Rejected').length;
        const pending = total - (approved + rejected);
        
        let totalTat = 0;
        let appsWithTat = 0;
        
        applications.forEach(app => {
            const start = app.history.find(h => h.action === 'Submitted');
            const end = app.history.find(h => h.action === 'Signed' || h.action === 'Rejected');
            if (start && end) {
                totalTat += differenceInHours(parseISO(end.timestamp), parseISO(start.timestamp));
                appsWithTat++;
            }
        });

        return {
            total,
            approved,
            rejected,
            pending,
            avgTat: appsWithTat > 0 ? Math.round(totalTat / appsWithTat) : 0,
            successRate: total > 0 ? Math.round((approved / total) * 100) : 0
        };
    }, [applications]);

    const boPerformance = React.useMemo(() => {
        return backOfficeUsers.map(bo => {
            const processedApps = applications.filter(app => 
                app.history.some(h => h.user === bo.name && (h.action === 'Pending Supervisor' || h.action === 'Returned to ATL'))
            );

            return {
                name: bo.name,
                initials: bo.initials,
                processed: processedApps.length,
                pending: processedApps.filter(a => a.status === 'In Review').length,
                accuracy: 98,
            };
        }).sort((a, b) => b.processed - a.processed);
    }, [applications, backOfficeUsers]);

    const supervisorPerformance = React.useMemo(() => {
        return supervisors.map(sup => {
            const signedApps = applications.filter(app => 
                app.history.some(h => h.user === sup.name && h.action === 'Agreement Signed by Supervisor')
            );
            const rejectedApps = applications.filter(app => 
                app.history.some(h => h.user === sup.name && h.action === 'Rejected')
            );

            return {
                name: sup.name,
                initials: sup.initials,
                signed: signedApps.length,
                rejected: rejectedApps.length,
                teamSize: sup.team?.length || 0,
            };
        });
    }, [applications, supervisors]);

    const regionalVolume = React.useMemo(() => {
        const regions: Record<string, number> = {};
        applications.forEach(app => {
            regions[app.region] = (regions[app.region] || 0) + 1;
        });
        return Object.entries(regions).map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [applications]);

    const applicationForReview = selectedApplication 
      ? applications.find(app => app.id === selectedApplication.id) 
      : null;

    if (applicationForReview) {
        return <ApplicationReview 
                  application={applicationForReview}
                  onBack={() => setSelectedApplication(null)}
                  user={user}
               />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold">Financial Director Portal</h2>
                  <p className="text-muted-foreground">Strategic oversight of Operations, Supervisors, and Back Office efficiency.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-secondary text-secondary-foreground font-bold">
                        <Database className="mr-2 h-3 w-3" />
                        System Runtime: Stable
                    </Badge>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total volume</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Success Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.successRate}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avg. TAT</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgTat}h</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Approved</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.approved}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rejected</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.rejected}</div>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">In Pipeline</CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{stats.pending}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="operations" className="w-full">
                <TabsList className="bg-muted/50 p-1 mb-6">
                    <TabsTrigger value="operations" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Operational Efficiency
                    </TabsTrigger>
                    <TabsTrigger value="supervisors" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Supervisory Oversight
                    </TabsTrigger>
                    <TabsTrigger value="back-office" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Back Office Team
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Compliance Audit
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="operations" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Processing Volume by Region</CardTitle>
                                <CardDescription>Throughput monitoring across Zimbabwean provinces.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={efficiencyChartConfig} className="h-[300px] w-full">
                                    <ResponsiveContainer>
                                        <ReChartsBarChart data={regionalVolume}>
                                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false}
                                                className="text-[10px]"
                                            />
                                            <YAxis axisLine={false} tickLine={false} hide />
                                            <ReChartsTooltip cursor={false} content={<div className="bg-background border p-2 rounded shadow-sm text-xs font-bold" />} />
                                            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                                                {regionalVolume.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                                                ))}
                                            </Bar>
                                        </ReChartsBarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Status Distribution</CardTitle>
                                <CardDescription>Overall health of the onboarding pipeline.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-2 border-b">
                                    <span className="text-sm font-medium">Approved / Signed</span>
                                    <Badge variant="success">{stats.approved}</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 border-b">
                                    <span className="text-sm font-medium">Pending Review</span>
                                    <Badge variant="secondary">{stats.pending}</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2">
                                    <span className="text-sm font-medium">Total Rejected</span>
                                    <Badge variant="destructive">{stats.rejected}</Badge>
                                </div>
                                <div className="pt-4 mt-4 border-t">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Efficiency Note</p>
                                    <p className="text-xs italic text-muted-foreground">Current system TAT is within the 48-hour SLA target.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="supervisors" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                Regulatory Supervisor Performance
                            </CardTitle>
                            <CardDescription>Oversight of final validation accuracy and team management by department supervisors.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead>Supervisor Name</TableHead>
                                        <TableHead className="text-center">Managed ATLs</TableHead>
                                        <TableHead className="text-center">Agreements Signed</TableHead>
                                        <TableHead className="text-center">Rejections Issued</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {supervisorPerformance.map((sup) => (
                                        <TableRow key={sup.name} className="hover:bg-muted/20">
                                            <TableCell className="font-medium flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-[10px]">{sup.initials}</AvatarFallback>
                                                </Avatar>
                                                {sup.name}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">{sup.teamSize} Agents</Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-green-600">{sup.signed}</TableCell>
                                            <TableCell className="text-center font-bold text-destructive">{sup.rejected}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">Audit Decisions</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="back-office" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Back Office Staff Performance Metrics
                            </CardTitle>
                            <CardDescription>Monitoring processing volumes and accuracy for the Operations team.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead>Clerk Name</TableHead>
                                        <TableHead className="text-center">Total Processed</TableHead>
                                        <TableHead className="text-center">Current Load</TableHead>
                                        <TableHead className="text-center">Accuracy Score</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {boPerformance.map((bo) => (
                                        <TableRow key={bo.name} className="hover:bg-muted/20">
                                            <TableCell className="font-medium flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-[10px]">{bo.initials}</AvatarFallback>
                                                </Avatar>
                                                {bo.name}
                                            </TableCell>
                                            <TableCell className="text-center font-bold">{bo.processed}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline">{bo.pending} Active</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-green-500" style={{ width: `${bo.accuracy}%` }} />
                                                    </div>
                                                    <span className="text-xs font-mono">{bo.accuracy}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">Audit Output</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="audit" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div>
                                    <CardTitle>System-Wide Audit Registry</CardTitle>
                                    <CardDescription>Search and verify any application within the financial onboarding network.</CardDescription>
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search by ID or Client..." 
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>App ID</TableHead>
                                        <TableHead>Client Name</TableHead>
                                        <TableHead>Originator</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applications
                                        .filter(a => a.id.toLowerCase().includes(searchTerm.toLowerCase()) || a.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .slice(0, 10)
                                        .map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell className="font-mono text-[10px]">{app.id}</TableCell>
                                            <TableCell className="font-medium text-xs">{app.clientName}</TableCell>
                                            <TableCell className="text-xs">{app.submittedBy}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{app.submittedDate}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[9px] uppercase">{app.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setSelectedApplication(app)}>Inspect</Button>
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