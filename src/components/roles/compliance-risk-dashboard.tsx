'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { applicationsAtom, Application } from '@/lib/mock-data';
import { User } from '@/lib/users';
import { 
  ShieldCheck, 
  Search, 
  AlertTriangle,
  UserSearch,
  History,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApplicationReview from '../onboarding/application-review';

export default function ComplianceRiskDashboard({ user }: { user: User }) {
  const [applications] = useAtom(applicationsAtom);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);

  // Compliance filter logic: Only applications escalated to 'Pending Compliance'
  const pendingQueue = React.useMemo(() => {
    return applications.filter(app => 
      app.status === 'Pending Compliance' &&
      (app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || app.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [applications, searchTerm]);

  // Rejection History: Only applications that have been rejected
  const rejectionHistory = React.useMemo(() => {
    return applications.filter(app => 
      app.status === 'Rejected' &&
      (app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || app.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [applications, searchTerm]);

  const stats = React.useMemo(() => {
    const peps = applications.filter(a => a.fcbStatus === 'PEP').length;
    const adverse = applications.filter(a => a.fcbStatus === 'Adverse' || a.fcbStatus === 'Prior Adverse').length;
    
    return {
      totalHits: peps + adverse,
      pepCount: peps,
      adverseCount: adverse,
      pendingAudit: applications.filter(a => a.status === 'Pending Compliance').length,
    };
  }, [applications]);

  if (selectedApplication) {
    const appForReview = applications.find(a => a.id === selectedApplication.id) || selectedApplication;
    return <ApplicationReview application={appForReview} onBack={() => setSelectedApplication(null)} user={user} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            COMPLIANCE PORTAL
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold">Regulatory Auditing: PEP, Adverse, & Mandatory Document Approval</p>
        </div>
        <div className="flex gap-2">
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-bold px-3 py-1">
                <AlertTriangle className="mr-2 h-3 w-3" />
                {stats.pendingAudit} Awaiting Approval
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">AML Risk Hits</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.totalHits}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase">Total Identifications</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">PEP Exposure</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.pepCount}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase">Politically Exposed Persons</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">Adverse Records</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.adverseCount}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase">Negative FCB Hits</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">Pending Reviews</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAudit}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase">Active Audit Queue</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="bg-black/20 p-1 mb-6">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <UserSearch className="h-4 w-4" /> 
            Pending Reviews
            {stats.pendingAudit > 0 && <Badge variant="destructive" className="ml-2 h-5 min-w-5 flex items-center justify-center p-0 rounded-full animate-pulse">{stats.pendingAudit}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" /> 
            Rejection History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <Card className="border-none bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <CardTitle>Escalated Compliance Queue</CardTitle>
                <CardDescription>Records requiring manual oversight due to AML flags or missing documents.</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search pending ID..." className="pl-9 bg-black/20 border-white/10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                    <TableHead className="pl-6 text-[10px] font-bold uppercase text-white/50">Applicant Detail</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/50">Risk Category</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/50">Escalated By</TableHead>
                    <TableHead className="pr-6 text-right text-[10px] font-bold uppercase text-white/50">Approval Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingQueue.map((app) => {
                    const lastLog = app.history[app.history.length - 1];
                    const isMissingDocs = app.documents.length < 2;
                    return (
                      <TableRow key={app.id} className="border-white/5 hover:bg-white/5">
                        <TableCell className="pl-6 py-4">
                          <div>
                            <p className="font-bold text-white">{app.clientName}</p>
                            <p className="text-[10px] text-white/30 font-mono">{app.id} • {app.clientType}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Badge variant={app.fcbStatus === 'PEP' ? 'secondary' : 'destructive'} className="uppercase text-[9px] font-bold">
                              {app.fcbStatus}
                            </Badge>
                            {isMissingDocs && <Badge variant="outline" className="text-[9px] border-amber-500 text-amber-500 uppercase">Missing Docs</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="text-white/70">{lastLog.user}</p>
                            <p className="text-[10px] text-white/30">{new Date(lastLog.timestamp).toLocaleDateString()}</p>
                          </div>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => setSelectedApplication(app)}>Approval Review</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {pendingQueue.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-white/20">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-10" />
                        <p className="italic">No pending reviews. System is compliant.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-none bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Rejection History</CardTitle>
              <CardDescription>Archive of records declined by the Compliance department.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 border-white/5">
                    <TableHead className="pl-6 text-[10px] font-bold uppercase text-white/50">Applicant Detail</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/50">Hit Category</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/50">Date Rejected</TableHead>
                    <TableHead className="pr-6 text-right text-[10px] font-bold uppercase text-white/50">Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectionHistory.map((app) => {
                    const rejectionLog = app.history.find(h => h.action === 'Rejected');
                    return (
                      <TableRow key={app.id} className="border-white/5 hover:bg-white/5">
                        <TableCell className="pl-6 py-4">
                          <div>
                            <p className="font-bold text-white/70">{app.clientName}</p>
                            <p className="text-[10px] text-white/30 font-mono">{app.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase text-[9px] border-destructive text-destructive">{app.fcbStatus}</Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-white/40">{rejectionLog ? new Date(rejectionLog.timestamp).toLocaleDateString() : 'N/A'}</p>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-2 text-destructive font-bold text-xs uppercase">
                            <XCircle className="h-3 w-3" /> Declined
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {rejectionHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-white/20 italic">
                        No historical rejections recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
