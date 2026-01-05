'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, ApplicationStatus } from '@/lib/mock-data';
import { PlusCircle, Search } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding/onboarding-flow';
import ApplicationReview from '../onboarding/application-review';
import { User } from '@/lib/users';
import { Input } from '../ui/input';
import { useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

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

interface AtlDashboardProps {
    user: User;
}

export default function AtlDashboard({ user }: AtlDashboardProps) {
  const [isCreatingApplication, setIsCreatingApplication] = React.useState(false);
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: applications, loading } = useCollection(
    (firestore) => query(collection(firestore, 'applications'), where('submittedBy', '==', user.name))
  );

  const filteredApplications = (applications || []).filter(app => 
    app.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const applicationForReview = selectedApplication 
      ? applications?.find(app => app.id === selectedApplication.id) 
      : null;

  if (isCreatingApplication) {
    return <OnboardingFlow user={user} onCancel={() => setIsCreatingApplication(false)} />;
  }

  if (applicationForReview) {
    return <ApplicationReview 
                application={applicationForReview} 
                onBack={() => setSelectedApplication(null)} 
                user={user}
            />;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold">ATL Dashboard</h2>
            <p className="text-muted-foreground">Submit and track new account applications.</p>
        </div>
        <Button onClick={() => setIsCreatingApplication(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Application
        </Button>
      </div>
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <CardTitle>My Applications</CardTitle>
                    <CardDescription>A list of applications you have submitted.</CardDescription>
                </div>
                 <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by Application ID..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent>
           {loading ? (
             <p>Loading applications...</p>
           ) : filteredApplications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App ID</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Client Type</TableHead>
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
                    <TableCell>{app.clientType}</TableCell>
                    <TableCell>{app.submittedDate}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
           ) : (
             <div className="flex flex-col items-center justify-center p-12 text-center">
                <p className="text-lg text-muted-foreground mb-6">
                    {searchTerm ? 'No applications match your search.' : 'No active applications. Start by creating a new one.'}
                </p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
