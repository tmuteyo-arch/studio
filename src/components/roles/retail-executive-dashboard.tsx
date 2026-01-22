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
import { Search, Send, CheckCircle2, AlertCircle, Inbox, BarChart } from 'lucide-react';

const getStatusVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'Approved':
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

interface RetailExecutiveDashboardProps {
    user: User;
}

export default function RetailExecutiveDashboard({ user }: RetailExecutiveDashboardProps) {
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
    const [applications] = useAtom(applicationsAtom);
    const [searchTerm, setSearchTerm] = React.useState('');

    const summaryStats = React.useMemo(() => {
        const pendingStatuses: ApplicationStatus[] = ['Submitted', 'In Review', 'Returned to ATL', 'Pending Supervisor'];
        return {
            totalPending: applications.filter(a => pendingStatuses.includes(a.status)).length,
            totalApproved: applications.filter(a => a.status === 'Approved').length,
            totalRejected: applications.filter(a => a.status === 'Rejected').length,
            totalArchived: applications.filter(a => a.status === 'Archived').length,
        };
    }, [applications]);

    const filteredApplications = React.useMemo(() => {
        if (!searchTerm) {
            return applications;
        }
        return applications.filter(app =>
            app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [applications, searchTerm]);


    const handleBack = () => {
      setSelectedApplication(null);
    }
    
    const applicationForReview = selectedApplication 
      ? applications.find(app => app.id === selectedApplication.id) 
      : null;

    if (applicationForReview) {
        return <ApplicationReview 
                  application={applicationForReview}
                  onBack={handleBack}
                  user={user}
               />;
    }
    
    return (
        <div>
            <div className="mb-8 flex justify-between items-start">
                <div>
                <h2 className="text-3xl font-bold">Retail Executive Dashboard</h2>
                <p className="text-muted-foreground">Global overview of all account applications.</p>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
                        <Inbox className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalPending}</div>
                        <p className="text-xs text-muted-foreground">Applications currently in the pipeline</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalApproved}</div>
                        <p className="text-xs text-muted-foreground">Successfully onboarded applications</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rejected</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalRejected}</div>
                        <p className="text-xs text-muted-foreground">Applications that did not proceed</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{applications.length}</div>
                        <p className="text-xs text-muted-foreground">All records in the system</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <CardTitle>All Applications</CardTitle>
                        <CardDescription>
                            A comprehensive list of every application in the system.
                        </CardDescription>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search ID, Client, Submitter..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {filteredApplications.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>App ID</TableHead>
                            <TableHead>Client Name</TableHead>
                            <TableHead>Submitted By</TableHead>
                            <TableHead>Submission Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredApplications.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell className="font-mono text-xs">{app.id}</TableCell>
                                <TableCell className="font-medium">{app.clientName}</TableCell>
                                <TableCell>{app.submittedBy}</TableCell>
                                <TableCell>{app.submittedDate}</TableCell>
                                <TableCell>
                                <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                                    View
                                </Button>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                <div className="flex items-center justify-center p-12 text-center">
                    <p className="text-lg text-muted-foreground">
                        {searchTerm ? 'No applications match your search.' : 'There are no applications in the system.'}
                    </p>
                </div>
                )}
            </CardContent>
            </Card>
        </div>
      )
}
