'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, ApplicationStatus } from '@/lib/mock-data';
import ApplicationReview from '../onboarding/application-review';
import { User } from '@/lib/users';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

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
    applications: Application[];
    setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
    user: User;
}


export default function BackOfficeDashboard({ applications, setApplications, user }: BackOfficeDashboardProps) {
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    
    // Back office reviews applications submitted by ATLs
    const queue = applications.filter(app => app.status === 'Submitted');

    const filteredQueue = queue.filter(app =>
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedApplication) {
        return <ApplicationReview 
                  application={selectedApplication} 
                  setApplications={setApplications}
                  onBack={() => setSelectedApplication(null)}
                  user={user}
               />;
    }

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
           {filteredQueue.length > 0 ? (
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
  );
}
