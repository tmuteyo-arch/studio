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
  TrendingUp,
  FileText,
  PieChart
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ApplicationReview from '../onboarding/application-review';

type MonthStat = {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
};

export default function ComplianceRiskDashboard({ user }: { user: User }) {
  const [applications] = useAtom(applicationsAtom);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);

  const pendingQueue = React.useMemo(() => {
    return applications.filter(app => 
      (app.status === 'Pending Compliance' || app.status === 'Sent to Risk & Compliance') &&
      (app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || app.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [applications, searchTerm]);

  const rejectionHistory = React.useMemo(() => {
    return applications.filter(app => 
      (app.status === 'Rejected' || app.status === 'Rejected by Supervisor') &&
      (app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || app.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [applications, searchTerm]);

  const monthlyStats = React.useMemo(() => {
    const summary: Record<string, MonthStat> = {};
    
    applications.forEach(app => {
      try {
        const monthKey = format(parseISO(app.submittedDate), 'MMMM yyyy');
        if (!summary[monthKey]) {
            summary[monthKey] = { total: 0, approved: 0, rejected: 0, pending: 0 };
        }
        
        summary[monthKey].total += 1;
        
        if (app.status === 'Archived' || app.status === 'Signed') {
            summary[monthKey].approved += 1;
        } else if (app.status === 'Rejected' || app.status === 'Rejected by Supervisor' || app.status === 'Rejected by ASL') {
            summary[monthKey].rejected += 1;
        } else {
            summary[monthKey].pending += 1;
        }
      } catch (e) {
        const key = 'Unknown Period';
        if (!summary[key]) summary[key] = { total: 0, approved: 0, rejected: 0, pending: 0 };
        summary[key].total += 1;
      }
    });

    return Object.entries(summary).sort((a, b) => {
      if (a[0] === 'Unknown Period') return 1;
      if (b[0] === 'Unknown Period') return -1;
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });
  }, [applications]);

  const stats = React.useMemo(() => {
    return {
      pendingAudit: applications.filter(a => a.status === 'Pending Compliance' || a.status === 'Sent to Risk & Compliance').length,
      totalRejections: applications.filter(a => a.status === 'Rejected' || a.status === 'Rejected by Supervisor').length,
      totalFinalized: applications.filter(a => a.status === 'Archived' || a.status === 'Signed').length,
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
        <Card className="bg-white/5 border-white/10 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">To Audit</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{stats.pendingAudit}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase font-bold">In Queue</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Finalized</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-green-500">{stats.totalFinalized}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase font-bold">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Rejected</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-destructive">{stats.totalRejections}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase font-bold">Declined</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-primary font-bold tracking-widest">Total Network</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">{stats.totalAccounts}</div>
            <p className="text-[10px] text-primary/40 mt-1 uppercase font-bold">Applications</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="bg-black/20 p-1 mb-6 rounded-xl border border-white/5">
          <TabsTrigger value="queue" className="flex items-center gap-2 px-6">
            <UserSearch className="h-4 w-4" /> 
            Audit Queue
            {stats.pendingAudit > 0 && <Badge variant="destructive" className="ml-2 h-5 min-w-5 flex items-center justify-center p-0 rounded-full animate-pulse">{stats.pendingAudit}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2 px-6">
            <BarChart3 className="h-4 w-4" /> 
            Monthly Summary
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 px-6">
            <History className="h-4 w-4" /> 
            Rejection Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="animate-in fade-in duration-500">
          <Card className="border-none bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 border-b border-white/5">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Audit Queue</CardTitle>
                <CardDescription className="text-xs uppercase font-bold tracking-widest text-white/40 mt-1">Pending regulatory verification.</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input placeholder="Search..." className="pl-9 bg-black/20 border-white/10 text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                    <TableHead className="pl-8 text-[10px] font-bold uppercase text-white/40 tracking-widest">Detail</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Risk</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Forwarded By</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] font-bold uppercase text-white/40 tracking-widest">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingQueue.map((app) => {
                    const lastLog = app.history[app.history.length - 1];
                    const isMissingDocs = app.documents.length < 2;
                    return (
                      <TableRow key={app.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="pl-8 py-5">
                          <div>
                            <p className="font-black text-white uppercase tracking-tight">{app.clientName}</p>
                            <p className="text-[10px] text-white/30 font-mono mt-1">{app.id} • {app.clientType}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={app.fcbStatus === 'PEP' ? 'secondary' : app.fcbStatus === 'Adverse' ? 'destructive' : 'outline'} className="uppercase text-[9px] font-black tracking-widest">
                              {app.fcbStatus}
                            </Badge>
                            {isMissingDocs && <Badge variant="outline" className="text-[9px] border-amber-500/50 text-amber-500 uppercase font-black tracking-widest">Incomplete Docs</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="text-white/70 font-bold uppercase">{lastLog.user}</p>
                            <p className="text-[10px] text-white/30 font-mono">{new Date(lastLog.timestamp).toLocaleDateString()}</p>
                          </div>
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          <Button variant="outline" size="sm" className="font-black uppercase tracking-widest h-9 border-white/10 hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 px-6 rounded-lg" onClick={() => setSelectedApplication(app)}>REVIEW</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {pendingQueue.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-48 text-center text-white/20">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <CheckCircle2 className="h-12 w-12 opacity-10" />
                            <p className="italic font-bold uppercase text-xs tracking-[0.2em]">Queue is empty</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
              <CardHeader className="border-b border-white/5 pb-6 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tight">Monthly Volume Summary</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Detailed breakdown of accounts and applications per month.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                      <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-white/40">Month & Year</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">Applications</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">Finalized</TableHead>
                      <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-white/40">Success Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyStats.length > 0 ? monthlyStats.map(([month, data]) => {
                      const rate = data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0;
                      return (
                        <TableRow key={month} className="border-white/5 hover:bg-white/5 transition-colors group">
                          <TableCell className="pl-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                              <span className="font-black text-white text-lg uppercase tracking-tight">{month}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-black text-white">{data.total}</span>
                                <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest mt-1">Requests</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-black text-green-500">{data.approved}</span>
                                <span className="text-[8px] text-green-500/30 uppercase font-bold tracking-widest mt-1">Accounts</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <Badge variant={rate > 70 ? 'success' : 'outline'} className="font-black text-sm px-3 shadow-md">
                              {rate}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-48 text-center text-white/20">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <TrendingUp className="h-10 w-10 opacity-5" />
                            <p className="italic uppercase text-[10px] font-black tracking-widest">No historical data found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="border-none bg-primary/5 border-primary/10 rounded-2xl shadow-xl overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                        <TrendingUp className="h-4 w-4" />
                        Network Snapshot
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Total Apps</p>
                                <p className="text-2xl font-black text-white">{stats.totalAccounts}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Finalized</p>
                                <p className="text-2xl font-black text-green-500">{stats.totalFinalized}</p>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Efficiency Rating</p>
                                <Badge variant="secondary" className="text-[9px] font-black">{Math.round((stats.totalFinalized / stats.totalAccounts) * 100) || 0}%</Badge>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
                                    style={{ width: `${(stats.totalFinalized / stats.totalAccounts) * 100 || 0}%` }} 
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-white/5 border-white/10 rounded-2xl shadow-xl overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <PieChart className="h-3 w-3" />
                            Summary Insight
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[11px] leading-relaxed text-white/50 italic">
                            This summary tracks every account and application created. "Applications" represents the volume of requests originated by ASLs, while "Accounts" tracks those that have successfully passed all regulatory and executive checkpoints.
                        </p>
                    </CardContent>
                </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="animate-in fade-in duration-500">
          <Card className="border-none bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
            <CardHeader className="bg-white/5 border-b border-white/5">
              <CardTitle className="text-xl font-black uppercase tracking-tight">Rejection History</CardTitle>
              <CardDescription className="text-xs uppercase font-bold tracking-widest text-white/40 mt-1">Audit trail of declined applications.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                    <TableHead className="pl-8 text-[10px] font-bold uppercase text-white/40 tracking-widest">Detail</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Risk Factor</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Date Logged</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] font-bold uppercase text-white/40 tracking-widest">Final Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectionHistory.map((app) => {
                    const rejectionLog = app.history.find(h => h.action.includes('Rejected'));
                    return (
                      <TableRow key={app.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="pl-8 py-5">
                          <div>
                            <p className="font-black text-white/70 uppercase tracking-tight">{app.clientName}</p>
                            <p className="text-[10px] text-white/30 font-mono mt-1">{app.id} • {app.clientType}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase text-[9px] border-destructive/30 text-destructive font-black tracking-widest px-3">
                            {app.fcbStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-white/40 font-mono">{rejectionLog ? new Date(rejectionLog.timestamp).toLocaleDateString() : 'N/A'}</p>
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          <div className="flex items-center justify-end gap-2 text-destructive font-black text-[10px] uppercase tracking-[0.2em]">
                            <XCircle className="h-3 w-3" /> Declined
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {rejectionHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-48 text-center text-white/20 italic uppercase text-[10px] font-bold tracking-widest">
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
