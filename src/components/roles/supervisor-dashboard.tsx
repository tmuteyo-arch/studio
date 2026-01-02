'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockApplications, Application } from '@/lib/mock-data';

export default function SupervisorDashboard() {
    const approvalQueue = mockApplications.filter(app => app.status === 'In Review');
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Supervisor Dashboard</h2>
        <p className="text-muted-foreground">Review, approve, or reject applications.</p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Approval Queue</CardTitle>
          <CardDescription>Applications waiting for your final approval.</CardDescription>
        </CardHeader>
        <CardContent>
          {approvalQueue.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Client Type</TableHead>
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
                            <TableCell>{app.lastUpdated}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{app.status}</Badge>
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
                <p className="text-lg text-muted-foreground">There are no applications pending your approval.</p>
            </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
