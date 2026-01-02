'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockApplications, Application } from '@/lib/mock-data';
import { PlusCircle } from 'lucide-react';

const getStatusVariant = (status: Application['status']) => {
  switch (status) {
    case 'Approved':
      return 'default';
    case 'In Review':
      return 'secondary';
    case 'Rejected':
      return 'destructive';
    case 'Submitted':
      return 'outline';
    default:
      return 'outline';
  }
};

export default function AtlDashboard() {
  const atlApplications = mockApplications.filter(app => app.submittedBy === 'ATL-01');

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold">ATL Dashboard</h2>
            <p className="text-muted-foreground">Submit and track new account applications.</p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Application
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
          <CardDescription>A list of applications you have submitted.</CardDescription>
        </CardHeader>
        <CardContent>
           {atlApplications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Client Type</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atlApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.clientName}</TableCell>
                    <TableCell>{app.clientType}</TableCell>
                    <TableCell>{app.submittedDate}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
           ) : (
             <div className="flex flex-col items-center justify-center p-12 text-center">
                <p className="text-lg text-muted-foreground mb-6">No active applications. Start by creating a new one.</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
