'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application } from '@/lib/mock-data';
import { Search } from 'lucide-react';
import ApplicationReview from '../onboarding/application-review';
import { User } from '@/lib/users';
import { Input } from '../ui/input';
import { useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

interface SupervisorDashboardProps {
    user: User;
}

export default function SupervisorDashboard({ user }: SupervisorDashboardProps) {
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');

    const { data: applications, loading } = useCollection(
      (firestore) => query(collection(firestore, 'applications'), where('status', '==', 'Pending Supervisor'))
    );

    const filteredQueue = (applications || []).filter(app =>
        app.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const applicationForReview = selectedApplication 
      ? applications?.find(app => app.id === selectedApplication.id) 
      : null;

    if (applicationForReview && applicationForReview.status !== 'Pending Supervisor') {
      setSelectedApplication(null);
    }
    
    if (applicationForReview) {
        return <ApplicationReview 
                  application={applicationForReview} 
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
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <CardTitle>Approval Queue</CardTitle>
                    <CardDescription>Applications that have been reviewed by Back Office and are pending your final approval.</CardDescription>
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
          {loading ? <p>Loading queue...</p> : filteredQueue.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>App ID</TableHead>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Client Type</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredQueue.map((app) => (
                        <TableRow key={app.id}>
                            <TableCell className="font-mono text-xs">{app.id}</TableCell>
                            <TableCell className="font-medium">{app.clientName}</TableCell>
                            <TableCell>{app.clientType}</TableCell>
                            <TableCell>{app.submittedBy}</TableCell>
                            <TableCell>{app.lastUpdated.toString()}</TableCell>
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
                <p className="text-lg text-muted-foreground">
                    {searchTerm ? 'No applications match your search.' : 'There are no applications pending your approval.'}
                </p>
            </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
