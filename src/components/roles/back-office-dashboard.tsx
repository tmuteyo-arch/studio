'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockApplications, Application } from '@/lib/mock-data';

const getStatusVariant = (status: Application['status']) => {
  switch (status) {
    case 'In Review':
      return 'secondary';
    case 'Submitted':
      return 'outline';
    default:
      return 'outline';
  }
};

export default function BackOfficeDashboard() {
    const queue = mockApplications.filter(app => app.status === 'Submitted' || app.status === 'In Review');

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Back Office Dashboard</h2>
        <p className="text-muted-foreground">Review and validate incoming applications.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Application Queue</CardTitle>
          <CardDescription>Applications waiting for your review and validation.</CardDescription>
        </CardHeader>
        <CardContent>
           {queue.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.clientName}</TableCell>
                    <TableCell>{app.submittedBy}</TableCell>
                    <TableCell>{app.submittedDate}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm">Review</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
           ) : (
            <div className="flex items-center justify-center p-12 text-center">
                <p className="text-lg text-muted-foreground">There are no pending applications in your queue.</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
