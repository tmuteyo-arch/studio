'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, ApplicationStatus, initialApplications } from '@/lib/mock-data';
import ApplicationReview from '../onboarding/application-review';
import { User } from '@/lib/users';
import { Input } from '../ui/input';
import { Search, Send, CheckCircle2, AlertCircle, Inbox, Archive } from 'lucide-react';
import { useCollection } from '@/firebase';
import { collection, query, where, or } from 'firebase/firestore';
import { cn } from '@/lib/utils';

type FilterStatus = 'pendingReview' | 'pendingSupervisor' | 'approved' | 'rejected' | 'all' | 'storage';


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
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filter, setFilter] = React.useState<FilterStatus>('pendingReview');
    
    // const { data: applications, loading } = useCollection(
    //   (firestore) => firestore ? query(collection(firestore, 'applications'), or(where('status', '==', 'Submitted'), where('status', '==', 'Returned to ATL'))) : null
    // );
    const [allApplications, setAllApplications] = React.useState(initialApplications);
    const loading = false;
    
    const summaryStats = {
        pendingReview: allApplications.filter(a => a.status === 'Submitted' || a.status === 'Returned to ATL').length,
        pendingSupervisor: allApplications.filter(a => a.status === 'Pending Supervisor').length,
        approved: allApplications.filter(a => a.status === 'Approved').length,
        rejected: allApplications.filter(a => a.status === 'Rejected').length,
    }

    const filteredApplications = React.useMemo(() => {
        let apps = allApplications;
        switch (filter) {
            case 'pendingReview':
                apps = allApplications.filter(app => app.status === 'Submitted' || app.status === 'Returned to ATL');
                break;
            case 'pendingSupervisor':
                apps = allApplications.filter(app => app.status === 'Pending Supervisor');
                break;
            case 'approved':
                apps = allApplications.filter(app => app.status === 'Approved');
                break;
            case 'rejected':
                apps = allApplications.filter(app => app.status === 'Rejected');
                break;
            case 'storage':
            case 'all':
            default:
                apps = allApplications;
                break;
        }

        if (searchTerm) {
            return apps.filter(app =>
                app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.clientName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return apps;
    }, [allApplications, filter, searchTerm]);


    const handleBack = () => {
      setSelectedApplication(null);
      // This is a mock-data workaround to reflect status changes
      // In a real app with Firestore, this would update automatically.
      const updatedApp = allApplications.find(a => a.id === selectedApplication?.id);
       if (updatedApp && (updatedApp.status !== 'Submitted' && updatedApp.status !== 'Returned to ATL')) {
         const currentApplications = [...allApplications];
         const appIndex = currentApplications.findIndex(a => a.id === updatedApp.id);
         if(appIndex > -1) {
            currentApplications[appIndex] = updatedApp;
            setAllApplications(currentApplications);
         }
      }
    }
    
    const applicationForReview = selectedApplication 
      ? allApplications.find(app => app.id === selectedApplication.id) 
      : null;

    if (applicationForReview) {
        return <ApplicationReview 
                  application={applicationForReview}
                  onBack={handleBack}
                  user={user}
               />;
    }
    
    const filterTitles: Record<FilterStatus, string> = {
        all: "All Applications",
        pendingReview: "My Application Queue",
        pendingSupervisor: "Applications Pending Supervisor",
        approved: "Approved Applications",
        rejected: "Rejected Applications",
        storage: "Storage & Audit",
    }

    function DashboardContent() {
      return (
        <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Back Office Dashboard</h2>
          <p className="text-muted-foreground">Review and validate incoming applications from ATLs.</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
            <button onClick={() => setFilter('pendingReview')} className={cn("text-left", filter === 'pendingReview' && "ring-2 ring-primary rounded-lg")}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Your Review</CardTitle>
                        <Inbox className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.pendingReview}</div>
                        <p className="text-xs text-muted-foreground">New and returned applications</p>
                    </CardContent>
                </Card>
            </button>
            <button onClick={() => setFilter('pendingSupervisor')} className={cn("text-left", filter === 'pendingSupervisor' && "ring-2 ring-primary rounded-lg")}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sent to Supervisor</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.pendingSupervisor}</div>
                        <p className="text-xs text-muted-foreground">Awaiting final approval</p>
                    </CardContent>
                </Card>
            </button>
            <button onClick={() => setFilter('approved')} className={cn("text-left", filter === 'approved' && "ring-2 ring-primary rounded-lg")}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.approved}</div>
                        <p className="text-xs text-muted-foreground">Completed applications</p>
                    </CardContent>
                </Card>
            </button>
            <button onClick={() => setFilter('rejected')} className={cn("text-left", filter === 'rejected' && "ring-2 ring-primary rounded-lg")}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rejected</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.rejected}</div>
                        <p className="text-xs text-muted-foreground">Rejected applications</p>
                    </CardContent>
                </Card>
            </button>
             <button onClick={() => setFilter('storage')} className={cn("text-left", filter === 'storage' && "ring-2 ring-primary rounded-lg")}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Storage / Audit</CardTitle>
                        <Archive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allApplications.length}</div>
                        <p className="text-xs text-muted-foreground">Total applications</p>
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
                            filter === 'pendingReview' ? 'Applications awaiting your review and validation.' :
                            filter === 'storage' ? 'Search and view all applications for audit purposes.' :
                            `A list of all ${filter} applications.`
                         }
                      </CardDescription>
                  </div>
                  <div className='flex gap-2 items-center'>
                    {filter !== 'pendingReview' && <Button variant="outline" onClick={() => setFilter('pendingReview')}>View My Queue</Button>}
                     <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by ID or Client..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                  </div>
              </div>
          </CardHeader>
          <CardContent>
             {loading ? <p>Loading applications...</p> : filteredApplications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App ID</TableHead>
                    <TableHead>Client Name</TableHead>
                    {filter === 'storage' && <TableHead>Documents</TableHead>}
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
                      {filter === 'storage' && 
                        <TableCell className="text-xs text-muted-foreground">
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
                            {filter === 'pendingReview' ? 'Review' : 'View'}
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
             ) : (
              <div className="flex items-center justify-center p-12 text-center">
                  <p className="text-lg text-muted-foreground">
                      {searchTerm ? 'No applications match your search.' : `There are no ${filterTitles[filter].toLowerCase()} applications.`}
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
