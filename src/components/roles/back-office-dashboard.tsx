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
import { Search, Send, CheckCircle2, AlertCircle, Inbox, Archive, ScanLine, Briefcase } from 'lucide-react';
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
    case 'Pending Executive Signature':
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
    const [applications, setApplications] = useAtom(applicationsAtom);
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


    const handleBack = () => {
      setSelectedApplication(null);
    }
    
    const applicationForReview = selectedApplication 
      ? applications.find(app => app.id === selectedApplication.id) 
      : null;

    if (isDigitizing) {
        return <DigitizeApplicationFlow user={user} onCancel={() => setIsDigitizing(false)} />;
    }

    if (applicationForReview) {
        return <ApplicationReview 
                  application={applicationForReview}
                  onBack={handleBack}
                  user={user}
               />;
    }
    
    const filterTitles: Record<FilterStatus, string> = {
        all: "All Active Applications",
        pendingReview: "My Review Queue",
        pendingSupervisor: "Pending Supervisor",
        signed: "Signed & Ready for Filing",
        rejected: "Rejected Requests",
        storage: "Archive & Audit",
    }

    function DashboardContent() {
      return (
        <div>
        <div className="mb-8 flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold">Back Office Clerk Portal</h2>
              <p className="text-muted-foreground">Review, validate, and digitize sign up requests.</p>
            </div>
            <Button onClick={() => setIsDigitizing(true)} variant="secondary">
                <ScanLine className="mr-2 h-4 w-4" />
                Digitize Request
            </Button>
        </div>
        
        <div className="mb-6">
          <DailyActivityTracker applications={applications} />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <button onClick={() => setFilter('all')} className={cn("text-left", filter === 'all' && "ring-2 ring-primary rounded-lg")}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">All Active Apps</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.all}</div>
                        <p className="text-xs text-muted-foreground">All items you can action</p>
                    </CardContent>
                </Card>
            </button>
            <button onClick={() => setFilter('pendingReview')} className={cn("text-left", filter === 'pendingReview' && "ring-2 ring-primary rounded-lg")}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Inbox className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.pendingReview}</div>
                        <p className="text-xs text-muted-foreground">New and returned items</p>
                    </CardContent>
                </Card>
            </button>
            <button onClick={() => setFilter('signed')} className={cn("text-left", filter === 'signed' && "ring-2 ring-primary rounded-lg")}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ready for Filing</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.signed}</div>
                        <p className="text-xs text-muted-foreground">Signed items awaiting filing.</p>
                    </CardContent>
                </Card>
            </button>
            <button onClick={() => setFilter('rejected')} className={cn("text-left", filter === 'rejected' && "ring-2 ring-primary rounded-lg")}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Declined Requests</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.rejected}</div>
                        <p className="text-xs text-muted-foreground">Total declined requests</p>
                    </CardContent>
                </Card>
            </button>
        </div>

        <Card>
           <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                      <CardTitle>{filterTitles[filter]}</CardTitle>
                      <CardDescription>
                         {
                            filter === 'all' ? 'All active requests requiring action.' :
                            filter === 'pendingReview' ? 'New requests awaiting your validation.' :
                            filter === 'signed' ? 'Signed items ready for final archival.' :
                            filter === 'storage' ? 'Search all past requests for audit.' :
                            `List of all ${filter} items.`
                         }
                      </CardDescription>
                  </div>
                  <div className='flex gap-2 items-center'>
                     <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder={filter === 'storage' ? "Search ID, Client, or Doc..." : "Search ID or Client..."}
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" onClick={() => setFilter(filter === 'storage' ? 'all' : 'storage')}>
                        <Archive className="mr-2 h-4 w-4" />
                        {filter === 'storage' ? 'Review Queue' : 'Archive / Audit'}
                    </Button>
                  </div>
              </div>
          </CardHeader>
          <CardContent>
             {filteredApplications.length > 0 ? (
                <div>
                  <div className="md:hidden space-y-4">
                    {filteredApplications.map((app) => (
                      <Card key={app.id} className="bg-muted/30">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{app.clientName}</CardTitle>
                              <CardDescription className="font-mono text-xs">{app.id}</CardDescription>
                            </div>
                            <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <p><span className="font-medium text-muted-foreground">From ASL:</span> {app.submittedBy}</p>
                          <p><span className="font-medium text-muted-foreground">Sent:</span> {app.submittedDate}</p>
                          <Button className="w-full mt-2" variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                            {filter === 'pendingReview' || filter === 'signed' ? 'Check & File' : 'View'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Customer</TableHead>
                          {filter === 'storage' && <TableHead>Docs</TableHead>}
                          <TableHead>Sent By</TableHead>
                          <TableHead>Date Sent</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-mono text-xs">{app.id}</TableCell>
                            <TableCell className="font-medium">{app.clientName}</TableCell>
                            {filter === 'storage' && 
                              <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                                  {app.documents.map(d => d.type).join(', ')}
                              </TableCell>
                            }
                            <TableCell>{app.submittedBy}</TableCell>
                            <TableCell>{app.submittedDate}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                                  {filter === 'pendingReview' || filter === 'signed' ? 'Check & File' : 'View'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
             ) : (
              <div className="flex items-center justify-center p-12 text-center">
                  <p className="text-lg text-muted-foreground">
                      {searchTerm ? 'No results found.' : `No items in ${filterTitles[filter].toLowerCase()}.`}
                  </p>
              </div>
             )}
          </CardContent>
        </Card>
      </div>
      )
    }

    return <DashboardContent />;
}
