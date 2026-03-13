'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { applicationsAtom, Application } from '@/lib/mock-data';
import { User, users as allUsers } from '@/lib/users';
import { 
  Users, 
  Wallet, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import ApplicationReview from '../onboarding/application-review';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { differenceInHours, parseISO } from 'date-fns';

interface FinancialDirectorDashboardProps {
    user: User;
}

export default function FinancialDirectorDashboard({ user }: FinancialDirectorDashboardProps) {
    const [applications] = useAtom(applicationsAtom);
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);

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
                  <h2 className="text-3xl font-bold">Finance Boss Portal</h2>
                  <p className="text-muted-foreground">Checking results for Supervisors and the Back Office team.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-secondary text-secondary-foreground font-bold">
                        <Database className="mr-2 h-3 w-3" />
                        System: Working OK
                    </Badge>
                </div>
            </div>

            <Tabs defaultValue="supervisors" className="w-full">
                <TabsList className="bg-muted/50 p-1 mb-6">
                    <TabsTrigger value="supervisors" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Supervisor Check
                    </TabsTrigger>
                    <TabsTrigger value="back-office" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Clerk Work
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="supervisors" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                Supervisor Work Results
                            </CardTitle>
                            <CardDescription>Final checks and team management results.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead>Supervisor Name</TableHead>
                                        <TableHead className="text-center">Managed ASLs</TableHead>
                                        <TableHead className="text-center">Sign-offs</TableHead>
                                        <TableHead className="text-center">Declined</TableHead>
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
                                                <Badge variant="secondary">{sup.teamSize} ASLs</Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-green-600">{sup.signed}</TableCell>
                                            <TableCell className="text-center font-bold text-destructive">{sup.rejected}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">Audit</Button>
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
                                Back Office Clerk Results
                            </CardTitle>
                            <CardDescription>How much work the clerical team is doing.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead>Clerk Name</TableHead>
                                        <TableHead className="text-center">Processed</TableHead>
                                        <TableHead className="text-center">Current Load</TableHead>
                                        <TableHead className="text-center">Accuracy</TableHead>
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
                                                <Button variant="ghost" size="sm">Results</Button>
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
