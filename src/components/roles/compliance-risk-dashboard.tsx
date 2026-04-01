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
  PieChart,
  Archive,
  Eye,
  FileSearch,
  Wallet
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
    dispatched: number;
    rejected: number;
    pending: number;
};

export default function ComplianceRiskDashboard({ user }: { user: User }) {
  const [applications] = useAtom(applicationsAtom);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [archiveSearchTerm, setArchiveSearchTerm] = React.useState('');
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);

  const pendingQueue = React.useMemo(() => {
    return applications.filter(app => 
      (app.status === 'Pending Compliance' || app.status === 'Sent to Risk & Compliance') &&
      (app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || app.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [applications, searchTerm]);

  const globalArchive = React.useMemo(() => {
    return applications.filter(app => 
      app.clientName.toLowerCase().includes(archiveSearchTerm.toLowerCase()) || 
      app.id.toLowerCase().includes(archiveSearchTerm.toLowerCase()) ||
      (app.details.accountNumber && app.details.accountNumber.includes(archiveSearchTerm))
    );
  }, [applications, archiveSearchTerm]);

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
            summary[monthKey] = { total: 0, approved: 0, dispatched: 0, rejected: 0, pending: 0 };
        }
        
        summary[monthKey].total += 1;
        
        if (app.status === 'Archived' || app.status === 'Signed') {
            summary[monthKey].approved += 1;
            if (app.details.isDispatched) {
                summary[monthKey].dispatched += 1;
            }
        } else if (app.status === 'Rejected' || app.status === 'Rejected by Supervisor' || app.status === 'Rejected by ASL') {
            summary[monthKey].rejected += 1;
        } else {
            summary[monthKey].pending += 1;
        }
      } catch (e) {
        const key = 'Unknown Period';
        if (!summary[key]) summary[key] = { total: 0, approved: 0, dispatched: 0, rejected: 0, pending: 0 };
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
      totalDispatched: applications.filter(a => a.details.isDispatched).length,
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
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold">Regulatory Audit & Volume Summary.</p>
        </div>
        <div className="flex gap-2">
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-bold px-3 py-1">
                <AlertTriangle className="mr-2 h-3 w-3" />
                {stats.pendingAudit} Audit Requests
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">In Review</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{stats.pendingAudit}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase font-bold">Regulatory Queue</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Dispatched</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-green-500">{stats.totalDispatched}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase font-bold">Active Accounts</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Declined</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-destructive">{stats.totalRejections}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase font-bold">Risk Rejections</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-primary font-bold tracking-widest">Network Total</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">{stats.totalAccounts}</div>
            <p className="text-[10px] text-primary/40 mt-1 uppercase font-bold">All Records</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="bg-black/20 p-1 mb-6 rounded-xl border border-white/5 w-full sm:w-auto overflow-x-auto justify-start">
          <TabsTrigger value="queue" className="flex items-center gap-2 px-6 h-10">
            <UserSearch className="h-4 w-4" /> 
            Audit Queue
            {stats.pendingAudit > 0 && <Badge variant="destructive" className="ml-2 h-5 min-w-5 flex items-center justify-center p-0 rounded-full animate-pulse">{stats.pendingAudit}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2 px-6 h-10">
            <Archive className="h-4 w-4" /> 
            Network Archive
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2 px-6 h-10">
            <BarChart3 className="h-4 w-4" /> 
            Monthly Summary
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 px-6 h-10">
            <History className="h-4 w-4" /> 
            Rejection Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="animate-in fade-in duration-500">
          <Card className="border-none bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 border-b border-white/5">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Regulatory Queue</CardTitle>
                <CardDescription className="text-xs uppercase font-bold tracking-widest text-white/40 mt-1">Audit submitted documentation before supervisor sign-off.</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input placeholder="Search pending..." className="pl-9 bg-black/20 border-white/10 text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                    <TableHead className="pl-8 text-[10px] font-bold uppercase text-white/40 tracking-widest">Applicant Detail</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40 tracking-widest">FCB Risk</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40 tracking-widest">From ASL</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] font-bold uppercase text-white/40 tracking-widest">Audit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingQueue.map((app) => {
                    const lastLog = app.history[app.history.length - 1];
                    const docCount = app.documents.length;
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
                            <Badge variant="outline" className="text-[9px] border-white/10 text-white/40 uppercase font-black tracking-widest">
                                {docCount} Documents
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="text-white/70 font-bold uppercase">{app.submittedBy}</p>
                            <p className="text-[10px] text-white/30 font-mono">{new Date(app.submittedDate).toLocaleDateString()}</p>
                          </div>
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          <Button variant="outline" size="sm" className="font-black uppercase tracking-widest h-9 border-white/10 hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 px-6 rounded-lg" onClick={() => setSelectedApplication(app)}>OPEN FILE</Button>
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

        <TabsContent value="archive" className="animate-in fade-in duration-500">
          <Card className="border-none bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 border-b border-white/5">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Archive className="h-5 w-5 text-white/60" /> Network Archive
                </CardTitle>
                <CardDescription className="text-xs uppercase font-bold tracking-widest text-white/40 mt-1">Audit documents for all applications and dispatched accounts.</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input placeholder="Search ID or Account #..." className="pl-9 bg-black/20 border-white/10 text-white" value={archiveSearchTerm} onChange={e => setArchiveSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                    <TableHead className="pl-8 text-[10px] font-bold uppercase text-white/40 tracking-widest">Reference</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Account / Dispatch</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Status</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] font-bold uppercase text-white/40 tracking-widest">View Docs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {globalArchive.map((app) => (
                    <TableRow key={app.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="pl-8 py-5">
                        <div>
                          <p className="font-black text-white uppercase tracking-tight">{app.clientName}</p>
                          <p className="text-[10px] text-white/30 font-mono mt-1">{app.id} • {app.clientType}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {app.details.accountNumber ? (
                            <div className="flex items-center gap-2 text-primary">
                                <Wallet className="h-3.5 w-3.5" />
                                <span className="font-mono font-black text-lg tracking-tighter">{app.details.accountNumber}</span>
                            </div>
                        ) : (
                            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">Not Dispatched</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'Archived' ? 'success' : 'outline'} className="uppercase text-[9px] font-black tracking-widest px-3">
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Button variant="ghost" size="sm" className="font-black uppercase tracking-widest h-9 hover:bg-white/10" onClick={() => setSelectedApplication(app)}>
                            <FileSearch className="mr-2 h-4 w-4" /> AUDIT FILE
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
                    <CardTitle className="text-xl font-black uppercase tracking-tight">Monthly Activity Volume</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Detailed labels for monthly applications and account dispatch totals.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                      <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-white/40">Calendar Month</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">Total Applications</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">Dispatched Accounts</TableHead>
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
                                <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest mt-1">Created Records</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-black text-green-500">{data.dispatched}</span>
                                <span className="text-[8px] text-green-500/30 uppercase font-bold tracking-widest mt-1">Final Dispatches</span>
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
                            <p className="italic uppercase text-[10px] font-black tracking-widest">No monthly logs found</p>
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
                                <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Originated</p>
                                <p className="text-2xl font-black text-white">{stats.totalAccounts}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Dispatched</p>
                                <p className="text-2xl font-black text-green-500">{stats.totalDispatched}</p>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Efficiency Rating</p>
                                <Badge variant="secondary" className="text-[9px] font-black">{Math.round((stats.totalDispatched / stats.totalAccounts) * 100) || 0}%</Badge>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
                                    style={{ width: `${(stats.totalDispatched / stats.totalAccounts) * 100 || 0}%` }} 
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-white/5 border-white/10 rounded-2xl shadow-xl overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <PieChart className="h-3 w-3" />
                            Summary Legend
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-[11px] leading-relaxed text-white/50 italic">
                            <strong>Applications</strong>: Volume of all originated requests per month.
                        </p>
                        <p className="text-[11px] leading-relaxed text-white/50 italic">
                            <strong>Accounts</strong>: Total volume of records that received a final account number and activation code.
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
