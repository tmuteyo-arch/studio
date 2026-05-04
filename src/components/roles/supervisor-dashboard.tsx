'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import { AlertCircle, AreaChart, CheckCircle2, ClipboardList, Inbox, Search, Users, FileDown, ShieldCheck, UserCheck, Archive, FileSearch, Key, Fingerprint, ShieldAlert, Clock, ClipboardCheck, Gavel } from 'lucide-react';
import ApplicationReview from '../onboarding/application-review';
import { User, usersAtom } from '@/lib/users';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import KpiTracker from './kpi-tracker';
import AccountSummaryReport from './account-summary-report';
import ReportsTab from './reports-tab';
import BackOfficeAppraisal from './back-office-appraisal';
import { getStateLabel } from '@/lib/state-machine';

interface SupervisorDashboardProps {
    user: User;
}

const getStatusVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'Signed':
    case 'Archived':
    case 'Approved':
      return 'success';
    case 'Pending Supervisor':
    case 'Safe to Continue':
    case 'Approved by Management':
    case 'Pending Executive Signature':
      return 'secondary';
    case 'Rejected':
    case 'Not Safe to Proceed':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function SupervisorDashboard({ user }: SupervisorDashboardProps) {
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
    const [applications] = useAtom(applicationsAtom);
    const [allUsers] = useAtom(usersAtom);
    const [searchTerm, setSearchTerm] = React.useState('');

    const backOfficeTeam = React.useMemo(() => 
        allUsers.filter(u => u.role === 'back-office'), 
    [allUsers]);

    const myApprovalQueue = applications.filter(app => 
        app.status === 'Safe to Continue' || 
        app.status === 'Approved by Management'
    ).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    
    const pendingExecutive = applications.filter(app => app.status === 'Pending Executive Signature');
    const archivedVault = applications.filter(app => ['Archived', 'Locked'].includes(app.status));

    const filteredQueue = myApprovalQueue.filter(app => app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredVault = archivedVault.filter(app => app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

    const applicationForReview = selectedApplication ? applications.find(app => app.id === selectedApplication.id) : null;
    
    if (applicationForReview) {
        return <ApplicationReview application={applicationForReview} onBack={() => setSelectedApplication(null)} user={user} />;
    }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="border-b border-white/5 pb-8">
        <h2 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-primary" />
            Supervisor Portal
        </h2>
        <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Audit and final code issuance.</p>
      </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-primary/10 border-primary/20 shadow-2xl rounded-2xl group hover:bg-primary/20 transition-all cursor-default">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Audit Queue</CardTitle>
                    <ShieldAlert className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-primary">{myApprovalQueue.length}</div>
                    <p className="text-[10px] text-primary/60 font-black uppercase mt-2 tracking-widest">Waiting for check</p>
                </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 shadow-xl rounded-2xl group hover:bg-white/10 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">At Executive</CardTitle>
                    <Clock className="h-8 w-8 text-white/20 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-white">{pendingExecutive.length}</div>
                    <p className="text-[10px] text-white/30 font-bold uppercase mt-2 tracking-widest">Awaiting Board signature</p>
                </CardContent>
            </Card>
             <Card className="bg-white/5 border-white/10 shadow-xl rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Ready to issue</CardTitle>
                    <ClipboardCheck className="h-8 w-8 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-green-500">{myApprovalQueue.filter(a => a.status === 'Approved by Management').length}</div>
                </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 shadow-xl rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Vaulted</CardTitle>
                    <Archive className="h-8 w-8 text-white/20" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-white">{archivedVault.length}</div>
                </CardContent>
            </Card>
        </div>

      <Tabs defaultValue="regulation" className="w-full">
          <TabsList className="bg-white/5 p-1.5 rounded-xl border border-white/5 mb-10 w-full sm:w-auto overflow-x-auto">
              <TabsTrigger value="regulation" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] transition-all relative">
                <Gavel className="mr-2 h-4 w-4"/>AUDIT DESK
                {myApprovalQueue.length > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-white text-[8px] flex items-center justify-center rounded-full border-2 border-background animate-pulse">{myApprovalQueue.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="vault" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] transition-all"><Archive className="mr-2 h-4 w-4"/>ARCHIVES</TabsTrigger>
              <TabsTrigger value="analytics" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] transition-all"><AreaChart className="mr-2 h-4 w-4"/>STATS</TabsTrigger>
              <TabsTrigger value="team" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] transition-all"><Users className="mr-2 h-4 w-4"/>CLERKS</TabsTrigger>
              <TabsTrigger value="reports" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] transition-all"><FileDown className="mr-2 h-4 w-4"/>REPORTS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="regulation" className="animate-in fade-in duration-500">
             <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <CardTitle className="text-2xl font-black uppercase tracking-tight">Active Audit Queue</CardTitle>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Review records and issue regulatory codes.</p>
                      </div>
                      <div className="relative w-full sm:w-80">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                          <Input placeholder="Search Audit Queue..." className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                  </div>
                  <Card className="border-none shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md rounded-2xl">
                      <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-black/20 border-white/5">
                                    <TableHead className="pl-8 text-white/40 uppercase text-[10px] font-black tracking-widest">ID</TableHead>
                                    <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">NAME</TableHead>
                                    <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">BR REF</TableHead>
                                    <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">STATE</TableHead>
                                    <TableHead className="text-right pr-8 text-white/40 uppercase text-[10px] font-black tracking-widest">ACTION</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredQueue.map((app) => (
                                    <TableRow key={app.id} className="hover:bg-white/5 border-white/5 transition-colors group">
                                        <TableCell className="font-mono text-xs pl-8 text-white/40 font-bold group-hover:text-white transition-colors">{app.id}</TableCell>
                                        <TableCell className="py-5">
                                            <div className="font-black text-white text-md uppercase tracking-tight group-hover:text-primary transition-colors">{app.clientName}</div>
                                            <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1.5">{app.clientType}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono font-bold px-3 py-1">{app.details.brIdentity || 'Awaiting ID'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(app.status)} className="px-3 py-1 uppercase text-[10px] font-black shadow-sm">{getStateLabel(app.status)}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <Button className="bg-primary text-primary-foreground font-black uppercase tracking-widest h-10 shadow-lg active:scale-95 px-6 rounded-lg" size="sm" onClick={() => setSelectedApplication(app)}>
                                                {app.status === 'Approved by Management' ? 'FINALIZE' : 'AUDIT'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {filteredQueue.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-24 text-center">
                                <ClipboardList className="h-16 w-16 text-white/5 mb-4" />
                                <p className="text-white/20 font-black uppercase tracking-widest italic">Audit queue is empty.</p>
                            </div>
                        )}
                      </CardContent>
                  </Card>
             </div>
          </TabsContent>

          <TabsContent value="vault" className="animate-in fade-in duration-500">
              <Card className="border-none shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md rounded-2xl">
                  <CardHeader className="bg-white/5 py-6 px-8 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <Archive className="h-6 w-6 text-primary" />
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-tight text-white">Archives</CardTitle>
                            <CardDescription className="text-xs uppercase font-bold tracking-widest text-white/40 mt-1">Regulatory Vault Records.</CardDescription>
                        </div>
                      </div>
                  </CardHeader>
                  <CardContent className="p-0">
                      {filteredVault.length > 0 ? (
                          <Table>
                              <TableHeader>
                                  <TableRow className="bg-black/20 border-white/5">
                                      <TableHead className="pl-8 text-white/40 uppercase text-[10px] font-black tracking-widest">REF</TableHead>
                                      <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">NAME</TableHead>
                                      <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">CLASS</TableHead>
                                      <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">CORE CODE</TableHead>
                                      <TableHead className="text-right pr-8 text-white/40 uppercase text-[10px] font-black tracking-widest">ACTION</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {filteredVault.map((app) => (
                                      <TableRow key={app.id} className="hover:bg-white/10 border-white/5 transition-colors">
                                          <TableCell className="font-mono text-xs pl-8 text-white/40 font-bold">{app.id}</TableCell>
                                          <TableCell className="py-5 font-black text-white/80 uppercase tracking-tight">{app.clientName}</TableCell>
                                          <TableCell className="text-white/40 uppercase text-[10px] font-black tracking-widest">{app.clientType}</TableCell>
                                          <TableCell className="font-mono text-md text-green-500 font-black tracking-tighter">{app.details.activationCode || 'ARCHIVED'}</TableCell>
                                          <TableCell className="text-right pr-8">
                                              <Button variant="ghost" size="sm" className="h-9 px-5 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-white/10" onClick={() => setSelectedApplication(app)}>
                                                  <FileSearch className="mr-2 h-4 w-4" />
                                                  VIEW
                                              </Button>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      ) : (
                          <div className="p-24 text-center flex flex-col items-center">
                              <Archive className="h-16 w-16 opacity-5 text-white mb-4" />
                              <p className="text-white/20 font-black uppercase tracking-widest italic">No vaulted records.</p>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-10 animate-in fade-in duration-500">
            <div className="space-y-10">
                <KpiTracker applications={applications} />
                <AccountSummaryReport applications={applications} />
            </div>
          </TabsContent>
          <TabsContent value="team" className="animate-in fade-in duration-500">
            <div className="space-y-6">
                <BackOfficeAppraisal applications={applications} team={backOfficeTeam} />
            </div>
          </TabsContent>
           <TabsContent value="reports" className="animate-in fade-in duration-500">
             <ReportsTab applications={applications} />
          </TabsContent>
      </Tabs>
    </div>
  );
}
