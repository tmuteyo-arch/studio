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
import { Search } from 'lucide-react';
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
    const [applications, setApplications] = React.useState(initialApplications.filter(app => app.status === 'Submitted' || app.status === 'Returned to ATL'));
    const loading = false;


    const filteredQueue = (applications || []).filter(app =>
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBack = () => {
      setSelectedApplication(null);
    }
    
    const applicationForReview = selectedApplication 
      ? initialApplications.find(app => app.id === selectedApplication.id) 
      : null;

    if (applicationForReview && applicationForReview.status !== 'Submitted' && applicationForReview.status !== 'Returned to ATL') {
      // This logic is tricky with mock data, let's just allow review
      // setSelectedApplication(null);
    }

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
        <Card>
           <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                      <CardTitle>Application Queue</CardTitle>
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
