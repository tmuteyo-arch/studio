'use client';
import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import ApplicationReview from '../onboarding/application-review';
import { User } from '@/lib/users';
import { Input } from '../ui/input';
import { Search, CheckCircle2, Inbox, Archive, ScanLine, Briefcase, FileSearch, Send } from 'lucide-react';
import DailyActivityTracker from './daily-activity-tracker';
import DigitizeApplicationFlow from '../onboarding/digitize-application-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getStatusVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'Signed':
    case 'Archived':
        return 'success';
    case 'Pending Supervisor':
    case 'Pending Compliance':
    case 'In Review':
      return 'secondary';
    case 'Rejected':
    case 'Returned to ATL':
      return 'destructive';
    case 'Submitted':
      return 'outline';
    default:
      return 'outline';
  }
};

interface BackOfficeDashboardProps {
    user: User;
}

export default function BackOfficeDashboard({ user }: BackOfficeDashboardProps) {
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
    const [applications] = useAtom(applicationsAtom);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [activeTab, setActiveTab] = React.useState<string>('pipeline');
    const [isDigitizing, setIsDigitizing] = React.useState<boolean>(false);

    const summaryStats = React.useMemo(() => ({
        pendingReview: applications.filter(a => a.status === 'Submitted' || a.status === 'Returned to ATL').length,
        pendingSupervisor: applications.filter(a => a.status === 'Pending Supervisor').length,
        pendingDispatch: applications.filter(a => a.status === 'Archived' && !a.details.isDispatched).length,
        archived: applications.filter(a => a.status === 'Archived').length,
    }), [applications]);

    const pipelineApplications = React.useMemo(() => {
        return applications.filter(app => 
            ['Submitted', 'Returned to ATL', 'Pending Supervisor', 'Pending Compliance', 'Signed', 'Rejected'].includes(app.status) &&
            (app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [applications, searchTerm]);

    const archivedApplications = React.useMemo(() => {
        return applications.filter(app => 
            app.status === 'Archived' &&
            (app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [applications, searchTerm]);

    if (isDigitizing) {
        return <DigitizeApplicationFlow user={user} onCancel={() => setIsDigitizing(false)} />;
    }

    if (selectedApplication) {
        return (
            <ApplicationReview 
                application={selectedApplication}
                onBack={() => setSelectedApplication(null)}
                user={user}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold">Back Office Workspace</h2>
                    <p className="text-muted-foreground">Verify mandatory documentation and manage the electronic archive.</p>
                </div>
                <Button onClick={() => setIsDigitizing(true)} variant="secondary" className="font-bold">
                    <ScanLine className="mr-2 h-4 w-4" />
                    Digitize Paper Record
                </Button>
            </div>
            
            <DailyActivityTracker applications={applications} />
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Verification Pending</CardTitle>
                        <Inbox className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.pendingReview}</div>
                        <p className="text-xs text-muted-foreground">Awaiting clerk review</p>
                    </CardContent>
                </Card>
                <Card className="bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Supervisor</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.pendingSupervisor}</div>
                        <p className="text-xs text-muted-foreground">Waiting for audit sign-off</p>
                    </CardContent>
                </Card>
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-primary uppercase tracking-tighter">Needs Dispatch</CardTitle>
                        <Send className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{summaryStats.pendingDispatch}</div>
                        <p className="text-xs text-primary/70">Awaiting account handover</p>
                    </CardContent>
                </Card>
                <Card className="bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Archive Vault</CardTitle>
                        <Archive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.archived}</div>
                        <p className="text-xs text-muted-foreground">Total digitized records</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <TabsList>
                        <TabsTrigger value="pipeline" className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Active Pipeline
                        </TabsTrigger>
                        <TabsTrigger value="archive" className="flex items-center gap-2">
                            <Archive className="h-4 w-4" />
                            Archive Vault
                        </TabsTrigger>
                    </TabsList>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search ID or Client..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="pipeline">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Application Pipeline</CardTitle>
                            <CardDescription>Applications currently moving through the verification and approval stages.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pipelineApplications.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Application ID</TableHead>
                                            <TableHead>Client Name</TableHead>
                                            <TableHead>Submitted By</TableHead>
                                            <TableHead>Date Submitted</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pipelineApplications.map((app) => (
                                            <TableRow key={app.id}>
                                                <TableCell className="font-mono text-xs">{app.id}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{app.clientName}</div>
                                                    <div className="text-[10px] text-muted-foreground">{app.clientType}</div>
                                                </TableCell>
                                                <TableCell>{app.submittedBy}</TableCell>
                                                <TableCell>{app.submittedDate}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                                                        Process Case
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex items-center justify-center p-12 text-center text-muted-foreground italic">
                                    No active pipeline applications found.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="archive">
                    <Card className="border-primary/10 shadow-lg">
                        <CardHeader className="bg-primary/5">
                            <CardTitle className="flex items-center gap-2">
                                <Archive className="h-5 w-5 text-primary" />
                                Electronic Archive Vault
                            </CardTitle>
                            <CardDescription>Secure storage for finalized agent agreements and digitized legacy records.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {archivedApplications.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Archive ID</TableHead>
                                            <TableHead>Client Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Dispatch Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {archivedApplications.map((app) => (
                                            <TableRow key={app.id} className="hover:bg-muted/20">
                                                <TableCell className="font-mono text-xs">{app.id}</TableCell>
                                                <TableCell className="font-bold">{app.clientName}</TableCell>
                                                <TableCell className="text-xs">{app.clientType}</TableCell>
                                                <TableCell>
                                                    {app.details.isDispatched ? (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            Dispatched ({app.details.accountNumber})
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">
                                                            Pending Dispatch
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(app)}>
                                                        <FileSearch className="mr-2 h-4 w-4" />
                                                        View Record
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-20 text-center text-muted-foreground">
                                    <Archive className="h-12 w-12 opacity-10 mb-4" />
                                    <p>The archive vault is currently empty.</p>
                                    <p className="text-xs">Finalized applications will appear here automatically.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
