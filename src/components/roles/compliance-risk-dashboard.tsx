'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { format, parseISO } from 'date-fns';
import { applicationsAtom, Application } from '@/lib/mock-data';
import { User } from '@/lib/users';
import { 
  ShieldCheck, 
  Search, 
  AlertTriangle,
  UserSearch,
  History,
  CheckCircle2,
  XCircle,
  CalendarDays,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ApplicationReview from '../onboarding/application-review';

export default function ComplianceRiskDashboard({ user }: { user: User }) {
  const [applications] = useAtom(applicationsAtom);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);

  // Compliance filter logic: Only applications escalated to 'Pending Compliance' or 'Sent to Risk & Compliance'
  const pendingQueue = React.useMemo(() => {
    return applications.filter(app => 
      (app.status === 'Pending Compliance' || app.status === 'Sent to Risk & Compliance') &&
      (app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || app.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [applications, searchTerm]);

  // Rejection History: Only applications that have been rejected
  const rejectionHistory = React.useMemo(() => {
    return applications.filter(app => 
      (app.status === 'Rejected' || app.status === 'Rejected by Supervisor') &&
      (app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || app.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [applications, searchTerm]);

  // Monthly Summary Logic
  const monthlyStats = React.useMemo(() => {
    const summary: Record<string, number> = {};
    
    applications.forEach(app => {
      try {
        const monthKey = format(parseISO(app.submittedDate), 'MMMM yyyy');
        summary[monthKey] = (summary[monthKey] || 0) + 1;
      } catch (e) {
        // Fallback for invalid dates if any
        summary['Unknown Period'] = (summary['Unknown Period'] || 0) + 1;
      }
    });

    return Object.entries(summary).sort((a, b) => {
      // Sort by date descending
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });
  }, [applications]);

  const stats = React.useMemo(() => {
    return {
      pendingAudit: applications.filter(a => a.status === 'Pending Compliance' || a.status === 'Sent to Risk & Compliance').length,
      totalRejections: applications.filter(a => a.status === 'Rejected' || a.status === 'Rejected by Supervisor').length,
      totalAccounts: applications.length
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
            Risk Portal
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold">Checks and Approvals.</p>
        </div>
        <div className="flex gap-2">
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-bold px-3 py-1">
                <AlertTriangle className="mr-2 h-3 w-3" />
                {stats.pendingAudit} Waiting
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">Waiting</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAudit}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase">Audit Queue</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">Rejected</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.totalRejections}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase">Declined</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">Total Network</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalAccounts}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase">Records Stored</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="bg-black/20 p-1 mb-6">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <UserSearch className="h-4 w-4" /> 
            To Review
            {stats.pendingAudit > 0 && <Badge variant="destructive" className="ml-2 h-5 min-w-5 flex items-center justify-center p-0 rounded-full animate-pulse">{stats.pendingAudit}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" /> 
            History
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> 
            Monthly Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <Card className="border-none bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <CardTitle>Queue</CardTitle>
                <CardDescription>Records needing checks.</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 bg-black/20 border-white/10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                    <TableHead className="pl-6 text-[10px] font-bold uppercase text-white/50">Detail</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/50">Risk</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/50">By</TableHead>
                    <TableHead className="pr-6 text-right text-[10px] font-bold uppercase text-white/50">Action</TableHead>
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
                            {isMissingDocs && <Badge variant="outline" className="text-[9px] border-amber-500 text-amber-500 uppercase">Missing Files</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="text-white/70">{lastLog.user}</p>
                            <p className="text-[10px] text-white/30">{new Date(lastLog.timestamp).toLocaleDateString()}</p>
                          </div>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => setSelectedApplication(app)}>Review</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {pendingQueue.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-white/20">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-10" />
                        <p className="italic">No pending reviews.</p>
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
              <CardTitle>History</CardTitle>
              <CardDescription>Past rejections.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 border-white/5">
                    <TableHead className="pl-6 text-[10px] font-bold uppercase text-white/50">Detail</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/50">Risk</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/50">Date</TableHead>
                    <TableHead className="pr-6 text-right text-[10px] font-bold uppercase text-white/50">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectionHistory.map((app) => {
                    const rejectionLog = app.history.find(h => h.action === 'Rejected' || h.action === 'Rejected by Supervisor');
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
                            <XCircle className="h-3 w-3" /> Rejected
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {rejectionHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-white/20 italic">
                        Empty.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none bg-white/5 backdrop-blur-md">
              <CardHeader className="border-b border-white/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tight">Monthly Volume Summary</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-white/40 mt-1">Total account applications created by calendar month.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                      <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-white/40">Month & Year</TableHead>
                      <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-white/40">Total Accounts Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyStats.length > 0 ? monthlyStats.map(([month, count]) => (
                      <TableRow key={month} className="border-white/5 hover:bg-white/5 transition-colors group">
                        <TableCell className="pl-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                            <span className="font-black text-white text-lg uppercase tracking-tight">{month}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <Badge className="bg-primary text-primary-foreground font-black text-lg px-4 py-1.5 shadow-xl hover:scale-105 transition-transform">
                            {count}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={2} className="h-48 text-center text-white/20 italic">
                          No historical data available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-none bg-primary/5 border-primary/10 h-fit">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                  <TrendingUp className="h-4 w-4" />
                  Compliance Insight
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-inner">
                  <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] mb-2">Network Status</p>
                  <p className="text-sm leading-relaxed text-white/70">
                    This summary provides a cumulative view of all agent applications submitted through the network. Data is updated in real-time as Sales Leaders (ASL) originate new requests.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Total Lifetime Volume</p>
                  <div className="text-4xl font-black text-white tracking-tighter">{stats.totalAccounts}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
