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
import { Search, Send, CheckCircle2, AlertCircle, Inbox } from 'lucide-react';
import { useCollection } from '@/firebase';
import { collection, query, where, or } from 'firebase/firestore';

const getStatusVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'In Review':
      return 'secondary';
    case 'Submitted':
    case 'Returned to ATL':
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
    
    // const { data: applications, loading } = useCollection(
    //   (firestore) => firestore ? query(collection(firestore, 'applications'), or(where('status', '==', 'Submitted'), where('status', '==', 'Returned to ATL'))) : null
    // );
    const [allApplications, setAllApplications] = React.useState(initialApplications);
    const loading = false;

    const queueApplications = allApplications.filter(app => app.status === 'Submitted' || app.status === 'Returned to ATL');
    
    const summaryStats = {
        pendingReview: queueApplications.length,
        pendingSupervisor: allApplications.filter(a => a.status === 'Pending Supervisor').length,
        approved: allApplications.filter(a => a.status === 'Approved').length,
        rejected: allApplications.filter(a => a.status === 'Rejected').length,
    }


    const filteredQueue = queueApplications.filter(app =>
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBack = () => {
      setSelectedApplication(null);
      // This is a mock-data workaround to reflect status changes
      const updatedApp = allApplications.find(a => a.id === selectedApplication?.id);
      if (updatedApp && (updatedApp.status !== 'Submitted' && updatedApp.status !== 'Returned to ATL')) {
        setAllApplications(initialApplications);
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

    function DashboardContent() {
      return (
        <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Back Office Dashboard</h2>
          <p className="text-muted-foreground">Review and validate incoming applications from ATLs.</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sent to Supervisor</CardTitle>
                    <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summaryStats.pendingSupervisor}</div>
                    <p className="text-xs text-muted-foreground">Applications awaiting final approval</p>
                </CardContent>
            </Card>
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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Rejected</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summaryStats.rejected}</div>
                    <p className="text-xs text-muted-foreground">Applications that were rejected</p>
                </CardContent>
            </Card>
        </div>

        <Card>
           <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                      <CardTitle>My Application Queue</CardTitle>
                      <CardDescription>Applications awaiting your review and validation before being sent to a supervisor.</CardDescription>
                  </div>
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
          </CardHeader>
          <CardContent>
             {loading ? <p>Loading queue...</p> : filteredQueue.length > 0 ? (
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
                  {filteredQueue.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-xs">{app.id}</TableCell>
                      <TableCell className="font-medium">{app.clientName}</TableCell>
                      <TableCell>{app.submittedBy}</TableCell>
                      <TableCell>{app.submittedDate}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>Review</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
             ) : (
              <div className="flex items-center justify-center p-12 text-center">
                  <p className="text-lg text-muted-foreground">
                      {searchTerm ? 'No applications match your search.' : 'There are no pending applications in your queue.'}
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
