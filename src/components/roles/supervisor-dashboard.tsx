'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import { AlertCircle, AreaChart, CheckCircle2, ClipboardList, Clock, Edit, Inbox, Search, Users, FileDown } from 'lucide-react';
import ApplicationReview from '../onboarding/application-review';
import { User, users as allUsers } from '@/lib/users';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import TeamPerformanceChart from './team-performance-chart';
import ExchangeRates from './exchange-rates';
import TeamAppraisal from './team-appraisal';
import KpiTracker from './kpi-tracker';
import AccountSummaryReport from './account-summary-report';
import ReportsTab from './reports-tab';
import BackOfficeAppraisal from './back-office-appraisal';

interface SupervisorDashboardProps {
    user: User;
}

const getStatusVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'Approved':
    case 'Signed':
      return 'success';
    case 'Pending Supervisor':
    case 'Approved - Pending Supervisor Signature':
    case 'Approved - Pending Executive Signature':
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

    const teamMembers = allUsers.filter(u => user.team?.includes(u.name));
    const backOfficeTeam = allUsers.filter(u => u.role === 'back-office');

    const myApprovalQueue = applications.filter(app => app.status === 'Pending Supervisor');
    const agreementsToSignQueue = applications.filter(app => app.status === 'Approved - Pending Supervisor Signature');

    const teamApplications = applications
        .filter(app => user.team?.includes(app.submittedBy) && app.status !== 'Archived');
    
    const teamPending = teamApplications
        .filter(app => ['Submitted', 'In Review', 'Returned to ATL'].includes(app.status));
        
    const completedToday = teamApplications
        .filter(app => app.status === 'Approved' && differenceInDays(new Date(), new Date(app.lastUpdated)) === 0).length;

    const pendingOver3Days = applications
        .filter(app => 
            ['Submitted', 'In Review', 'Pending Supervisor', 'Returned to ATL'].includes(app.status) 
            && differenceInDays(new Date(), new Date(app.lastUpdated)) > 3
        ).length;

    const filteredApprovalQueue = myApprovalQueue.filter(app => app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredAgreementsQueue = agreementsToSignQueue.filter(app => app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredTeamApps = teamApplications.filter(app => app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

    const applicationForReview = selectedApplication ? applications.find(app => app.id === selectedApplication.id) : null;
    
    if (applicationForReview) {
        return <ApplicationReview application={applicationForReview} onBack={() => setSelectedApplication(null)} user={user} />;
    }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Supervisor Dashboard</h2>
        <p className="text-muted-foreground">Review applications and track your team's progress.</p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Approve Applications</CardTitle>
                    <Inbox className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{myApprovalQueue.length}</div>
                    <p className="text-xs text-muted-foreground">Awaiting your decision</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sign Agreements</CardTitle>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{agreementsToSignQueue.length}</div>
                    <p className="text-xs text-muted-foreground">Agreements needing your signature</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Team's Pending</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{teamPending.length}</div>
                    <p className="text-xs text-muted-foreground">Being processed by team</p>
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
                    <p className="text-xs text-muted-foreground">Stalled applications</p>
                </CardContent>
            </Card>
        </div>

      <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="tasks"><ClipboardList className="mr-2"/>Tasks</TabsTrigger>
              <TabsTrigger value="analytics"><AreaChart className="mr-2"/>Analytics & KPIs</TabsTrigger>
              <TabsTrigger value="team"><Users className="mr-2"/>Team Management</TabsTrigger>
              <TabsTrigger value="reports"><FileDown className="mr-2"/>Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks">
             <Tabs defaultValue="approval" className="w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                      <TabsList className="w-full sm:w-auto">
                          <TabsTrigger value="approval">Approval Queue ({filteredApprovalQueue.length})</TabsTrigger>
                          <TabsTrigger value="agreements">Agreements to Sign ({filteredAgreementsQueue.length})</TabsTrigger>
                          <TabsTrigger value="team">Team Progress ({filteredTeamApps.length})</TabsTrigger>
                      </TabsList>
                      <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input placeholder="Search by ID or Client..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                  </div>
                  <TabsContent value="approval">
                      <Card>
                          <CardHeader><CardTitle>Approval Queue</CardTitle><CardDescription>Applications that have been reviewed by Back Office and are pending your final approval.</CardDescription></CardHeader>
                          <CardContent>
                            <Table><TableHeader><TableRow><TableHead>App ID</TableHead><TableHead>Client Name</TableHead><TableHead>Submitted By</TableHead><TableHead>Last Updated</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredApprovalQueue.map((app) => (<TableRow key={app.id}><TableCell className="font-mono text-xs">{app.id}</TableCell><TableCell className="font-medium">{app.clientName}</TableCell><TableCell>{app.submittedBy}</TableCell><TableCell>{new Date(app.lastUpdated).toLocaleDateString()}</TableCell><TableCell><Badge variant="secondary">{app.status}</Badge></TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>Review</Button></TableCell></TableRow>))}
                                </TableBody>
                            </Table>
                            {filteredApprovalQueue.length === 0 && <div className="text-center p-12 text-muted-foreground">{searchTerm ? 'No applications match your search.' : 'There are no applications pending your approval.'}</div>}
                          </CardContent>
                      </Card>
                  </TabsContent>
                   <TabsContent value="agreements">
                      <Card>
                          <CardHeader><CardTitle>Agreements to Sign</CardTitle><CardDescription>Approved applications that require your signature on the agency agreement before being sent to the executive.</CardDescription></CardHeader>
                          <CardContent>
                            <Table><TableHeader><TableRow><TableHead>App ID</TableHead><TableHead>Client Name</TableHead><TableHead>Submitted By</TableHead><TableHead>Last Updated</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredAgreementsQueue.map((app) => (<TableRow key={app.id}><TableCell className="font-mono text-xs">{app.id}</TableCell><TableCell className="font-medium">{app.clientName}</TableCell><TableCell>{app.submittedBy}</TableCell><TableCell>{new Date(app.lastUpdated).toLocaleDateString()}</TableCell><TableCell><Badge variant="secondary">{app.status}</Badge></TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>Review & Sign</Button></TableCell></TableRow>))}
                                </TableBody>
                            </Table>
                            {filteredAgreementsQueue.length === 0 && <div className="text-center p-12 text-muted-foreground">{searchTerm ? 'No agreements match your search.' : 'There are no agreements pending your signature.'}</div>}
                          </CardContent>
                      </Card>
                  </TabsContent>
                  <TabsContent value="team">
                      <Card>
                          <CardHeader><CardTitle>Team Progress</CardTitle><CardDescription>A complete overview of applications submitted by your team members.</CardDescription></CardHeader>
                          <CardContent>
                              <Table><TableHeader><TableRow><TableHead>App ID</TableHead><TableHead>Client Name</TableHead><TableHead>Submitted By (ATL)</TableHead><TableHead>Submission Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredTeamApps.map((app) => (<TableRow key={app.id}><TableCell className="font-mono text-xs">{app.id}</TableCell><TableCell className="font-medium">{app.clientName}</TableCell><TableCell>{app.submittedBy}</TableCell><TableCell>{app.submittedDate}</TableCell><TableCell><Badge variant={getStatusVariant(app.status)}>{app.status}</Badge></TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>View</Button></TableCell></TableRow>))}
                                </TableBody>
                              </Table>
                               {filteredTeamApps.length === 0 && <div className="text-center p-12 text-muted-foreground">{searchTerm ? 'No applications match your search.' : "Your team members haven't submitted any applications yet."}</div>}
                          </CardContent>
                      </Card>
                  </TabsContent>
              </Tabs>
          </TabsContent>
          <TabsContent value="analytics">
            <div className="space-y-6">
                <KpiTracker applications={applications} />
                <AccountSummaryReport applications={applications} />
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                        <TeamPerformanceChart applications={teamApplications} team={user.team || []} />
                    </div>
                    <div>
                        <ExchangeRates />
                    </div>
                </div>
            </div>
          </TabsContent>
          <TabsContent value="team">
            <div className="space-y-6">
             <TeamAppraisal applications={applications} team={teamMembers} />
             <BackOfficeAppraisal applications={applications} team={backOfficeTeam} />
            </div>
          </TabsContent>
           <TabsContent value="reports">
             <ReportsTab applications={applications} />
          </TabsContent>
      </Tabs>
    </div>
  );
}
