'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import { AlertCircle, CheckCircle2, Clock, Inbox, Search } from 'lucide-react';
import ApplicationReview from '../onboarding/application-review';
import { User } from '@/lib/users';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import TeamPerformanceChart from './team-performance-chart';

interface SupervisorDashboardProps {
    user: User;
}

const getStatusVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'Approved':
      return 'success';
    case 'Pending Supervisor':
      return 'secondary';
    case 'Rejected':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function SupervisorDashboard({ user }: SupervisorDashboardProps) {
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
    const [applications] = useAtom(applicationsAtom);
    const [searchTerm, setSearchTerm] = React.useState('');

    const myApprovalQueue = applications
        .filter(app => app.status === 'Pending Supervisor');

    const teamApplications = applications
        .filter(app => user.team?.includes(app.submittedBy));
    
    const teamPending = teamApplications
        .filter(app => ['Submitted', 'In Review', 'Returned to ATL'].includes(app.status));
        
    const completedToday = teamApplications
        .filter(app => app.status === 'Approved' && differenceInDays(new Date(), new Date(app.lastUpdated)) === 0).length;

    const pendingOver3Days = applications
        .filter(app => 
            ['Submitted', 'In Review', 'Pending Supervisor', 'Returned to ATL'].includes(app.status) 
            && differenceInDays(new Date(), new Date(app.lastUpdated)) > 3
        ).length;

    const filteredQueue = myApprovalQueue
        .filter(app =>
            app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const filteredTeamApps = teamApplications
        .filter(app =>
            app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const applicationForReview = selectedApplication 
        ? applications.find(app => app.id === selectedApplication.id) 
        : null;
    
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
        <p className="text-muted-foreground">Review applications and track your team's progress.</p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">My Approval Queue</CardTitle>
                    <Inbox className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{myApprovalQueue.length}</div>
                    <p className="text-xs text-muted-foreground">Applications awaiting your decision</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Team's Pending Queue</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{teamPending.length}</div>
                    <p className="text-xs text-muted-foreground">Applications being processed by your team</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{completedToday}</div>
                    <p className="text-xs text-muted-foreground">Applications approved today</p>
                </CardContent>
            </Card>
            <Card className={pendingOver3Days > 0 ? "bg-destructive/10 border-destructive" : ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Over 3 Days</CardTitle>
                    <AlertCircle className={cn("h-4 w-4 text-muted-foreground", pendingOver3Days > 0 && "text-destructive")} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingOver3Days}</div>
                    <p className="text-xs text-muted-foreground">Stalled applications needing attention</p>
                </CardContent>
            </Card>
        </div>

        <TeamPerformanceChart applications={teamApplications} team={user.team || []} />

       <Tabs defaultValue="queue" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="queue" className="flex-1 sm:flex-initial">Approval Queue ({filteredQueue.length})</TabsTrigger>
                    <TabsTrigger value="team" className="flex-1 sm:flex-initial">Team Progress ({filteredTeamApps.length})</TabsTrigger>
                </TabsList>
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
            <TabsContent value="queue">
                 <Card>
                    <CardHeader>
                        <CardTitle>Approval Queue</CardTitle>
                        <CardDescription>Applications that have been reviewed by Back Office and are pending your final approval.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredQueue.length > 0 ? (
                        <div>
                          {/* Mobile Card View */}
                          <div className="md:hidden space-y-4">
                            {filteredQueue.map((app) => (
                              <Card key={app.id} className="bg-muted/30">
                                <CardHeader>
                                  <CardTitle className="text-lg">{app.clientName}</CardTitle>
                                  <CardDescription className="font-mono text-xs">{app.id}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                  <p><span className="font-medium text-muted-foreground">Submitted By:</span> {app.submittedBy}</p>
                                  <p><span className="font-medium text-muted-foreground">Updated:</span> {new Date(app.lastUpdated).toLocaleDateString()}</p>
                                  <Badge variant="secondary" className="my-2">{app.status}</Badge>
                                  <Button className="w-full mt-2" variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>Review</Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>

                          {/* Desktop Table View */}
                          <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>App ID</TableHead>
                                        <TableHead>Client Name</TableHead>
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
                                            <TableCell>{app.submittedBy}</TableCell>
                                            <TableCell>{new Date(app.lastUpdated).toLocaleDateString()}</TableCell>
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
                          </div>
                        </div>
                        ) : (
                        <div className="flex items-center justify-center p-12 text-center">
                            <p className="text-lg text-muted-foreground">
                                {searchTerm ? 'No applications match your search.' : 'There are no applications pending your approval.'}
                            </p>
                        </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="team">
                 <Card>
                    <CardHeader>
                        <CardTitle>Team Progress</CardTitle>
                        <CardDescription>A complete overview of applications submitted by your team members.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredTeamApps.length > 0 ? (
                        <div>
                           {/* Mobile Card View */}
                          <div className="md:hidden space-y-4">
                            {filteredTeamApps.map((app) => (
                              <Card key={app.id} className="bg-muted/30">
                                <CardHeader>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <CardTitle className="text-lg">{app.clientName}</CardTitle>
                                      <CardDescription className="font-mono text-xs">{app.id}</CardDescription>
                                    </div>
                                    <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                  <p><span className="font-medium text-muted-foreground">Submitted By:</span> {app.submittedBy}</p>
                                  <p><span className="font-medium text-muted-foreground">Submitted:</span> {app.submittedDate}</p>
                                  <Button className="w-full mt-2" variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>View</Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>

                           {/* Desktop Table View */}
                          <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>App ID</TableHead>
                                        <TableHead>Client Name</TableHead>
                                        <TableHead>Submitted By (ATL)</TableHead>
                                        <TableHead>Submission Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTeamApps.map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell className="font-mono text-xs">{app.id}</TableCell>
                                            <TableCell className="font-medium">{app.clientName}</TableCell>
                                            <TableCell>{app.submittedBy}</TableCell>
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
                          </div>
                        </div>
                        ) : (
                        <div className="flex items-center justify-center p-12 text-center">
                            <p className="text-lg text-muted-foreground">
                                {searchTerm ? 'No applications match your search.' : "Your team members haven't submitted any applications yet."}
                            </p>
                        </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
