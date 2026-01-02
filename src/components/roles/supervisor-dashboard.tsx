'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application } from '@/lib/mock-data';
import { Check, X } from 'lucide-react';
import ApplicationReview from '../onboarding/application-review';
import { User } from '@/lib/users';

interface SupervisorDashboardProps {
    applications: Application[];
    setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
    user: User;
}

export default function SupervisorDashboard({ applications, setApplications, user }: SupervisorDashboardProps) {
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
    // Supervisor reviews applications that the Back Office has already validated.
    const approvalQueue = applications.filter(app => app.status === 'Pending Supervisor');

    if (selectedApplication) {
        return <ApplicationReview 
                  application={selectedApplication} 
                  setApplications={setApplications}
                  onBack={() => setSelectedApplication(null)} 
                  user={user} />;
    }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Supervisor Dashboard</h2>
        <p className="text-muted-foreground">Perform final review and approval for applications validated by the Back Office.</p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Approval Queue</CardTitle>
          <CardDescription>Applications that have been reviewed by Back Office and are pending your final approval.</CardDescription>
        </CardHeader>
        <CardContent>
          {approvalQueue.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Client Type</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {approvalQueue.map((app) => (
                        <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.clientName}</TableCell>
                            <TableCell>{app.clientType}</TableCell>
                            <TableCell>{app.submittedBy}</TableCell>
                            <TableCell>{app.lastUpdated}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{app.status}</Badge>
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
                <p className="text-lg text-muted-foreground">There are no applications pending your approval.</p>
            </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
