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
import { Search, CheckCircle2, AlertCircle, Inbox, Archive, ScanLine, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import DailyActivityTracker from './daily-activity-tracker';
import DigitizeApplicationFlow from '../onboarding/digitize-application-flow';

type FilterStatus = 'pendingReview' | 'pendingSupervisor' | 'signed' | 'rejected' | 'all' | 'storage';

const getStatusVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'Signed':
        return 'success';
    case 'Pending Supervisor':
    case 'In Review':
      return 'secondary';
    case 'Rejected':
    case 'Returned to ATL':
      return 'destructive';
    case 'Submitted':
    case 'Archived':
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
    const [filter, setFilter] = React.useState<FilterStatus>('all');
    const [isDigitizing, setIsDigitizing] = React.useState<boolean>(false);

    const summaryStats = React.useMemo(() => ({
        pendingReview: applications.filter(a => a.status === 'Submitted' || a.status === 'Returned to ATL').length,
        pendingSupervisor: applications.filter(a => a.status === 'Pending Supervisor').length,
        signed: applications.filter(a => a.status === 'Signed').length,
        rejected: applications.filter(a => a.status === 'Rejected').length,
        all: applications.filter(a => ['Submitted', 'Returned to ATL', 'Pending Supervisor', 'Signed', 'Rejected'].includes(a.status)).length,
    }), [applications]);

    const filteredApplications = React.useMemo(() => {
        let apps: Application[];
        switch (filter) {
            case 'pendingReview':
                apps = applications.filter(app => app.status === 'Submitted' || app.status === 'Returned to ATL');
                break;
            case 'pendingSupervisor':
                apps = applications.filter(app => app.status === 'Pending Supervisor');
                break;
            case 'signed':
                apps = applications.filter(app => app.status === 'Signed');
                break;
            case 'rejected':
                apps = applications.filter(app => app.status === 'Rejected');
                break;
            case 'storage':
                 return applications.filter(app =>
                    app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    app.documents.some(doc => doc.type.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            case 'all':
                apps = applications.filter(app => ['Submitted', 'Returned to ATL', 'Pending Supervisor', 'Signed', 'Rejected'].includes(app.status));
                break;
            default:
                apps = applications.filter(app => ['Submitted', 'Returned to ATL', 'Pending Supervisor', 'Signed', 'Rejected'].includes(app.status));
                break;
        }

        if (searchTerm && filter !== 'storage') {
            return apps.filter(app =>
                app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.clientName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return apps;
    }, [applications, filter, searchTerm]);

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
    
    const filterTitles: Record<FilterStatus, string> = {
        all: "Active Application Pipeline",
        pendingReview: "Verification Queue",
        pendingSupervisor: "Pending Supervisory Approval",
        signed: "Signed & Ready for Archival",
        rejected: "Rejected Applications",
        storage: "Application Archive & Audit",
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold">Back Office Clerk Workspace</h2>
                    <p className="text-muted-foreground">Review, verify mandatory documentation, and digitize physical records.</p>
                </div>
                <Button onClick={() => setIsDigitizing(true)} variant="secondary" className="font-bold">
                    <ScanLine className="mr-2 h-4 w-4" />
                    Digitize Paper Record
                </Button>
            </div>
            
            <DailyActivityTracker applications={applications} />
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card 
                    className={cn("cursor-pointer transition-all hover:border-primary", filter === 'all' && "ring-2 ring-primary")}
                    onClick={() => setFilter('all')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">All Active Cases</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.all}</div>
                        <p className="text-xs text-muted-foreground">Total actionable items</p>
                    </CardContent>
                </Card>
                <Card 
                    className={cn("cursor-pointer transition-all hover:border-primary", filter === 'pendingReview' && "ring-2 ring-primary")}
                    onClick={() => setFilter('pendingReview')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Verification Pending</CardTitle>
                        <Inbox className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.pendingReview}</div>
                        <p className="text-xs text-muted-foreground">Awaiting clerk review</p>
                    </CardContent>
                </Card>
                <Card 
                    className={cn("cursor-pointer transition-all hover:border-primary", filter === 'signed' && "ring-2 ring-primary")}
                    onClick={() => setFilter('signed')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Awaiting Archival</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.signed}</div>
                        <p className="text-xs text-muted-foreground">Fully signed & verified</p>
                    </CardContent>
                </Card>
                <Card 
                    className={cn("cursor-pointer transition-all hover:border-primary", filter === 'rejected' && "ring-2 ring-primary")}
                    onClick={() => setFilter('rejected')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected Cases</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.rejected}</div>
                        <p className="text-xs text-muted-foreground">Total rejected applications</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <CardTitle>{filterTitles[filter]}</CardTitle>
                            <CardDescription>
                                {filter === 'storage' 
                                    ? 'Searchable history of processed and archived applications.'
                                    : 'List of applications currently in the processing pipeline.'}
                            </CardDescription>
                        </div>
                        <div className='flex gap-2 items-center'>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search ID or Client..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" onClick={() => setFilter(filter === 'storage' ? 'all' : 'storage')}>
                                <Archive className="mr-2 h-4 w-4" />
                                {filter === 'storage' ? 'View Pipeline' : 'View Archive'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredApplications.length > 0 ? (
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
                                {filteredApplications.map((app) => (
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
                                                {filter === 'pendingReview' || filter === 'signed' ? 'Process Case' : 'View Details'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex items-center justify-center p-12 text-center">
                            <p className="text-lg text-muted-foreground">
                                {searchTerm ? 'No search results found.' : 'No applications found in this filter.'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
