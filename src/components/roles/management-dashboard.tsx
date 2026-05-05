'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { applicationsAtom, Application, ApplicationStatus, activityLogsAtom } from '@/lib/mock-data';
import { zimRegions } from '@/lib/types';
import { User, usersAtom } from '@/lib/users';
import { 
  TrendingUp,
  LayoutDashboard,
  MapPin,
  Award,
  Activity,
  History,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  FileText,
  ListFilter,
  FileSignature,
  Eraser,
  Fingerprint
} from 'lucide-react';
import { Bar, BarChart as ReChartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import SignatureCanvas from 'react-signature-canvas';
import { useToast } from '@/hooks/use-toast';
import { isToday, parseISO } from 'date-fns';
import { getStateLabel } from '@/lib/state-machine';
import ApplicationReview from '../onboarding/application-review';
import { cn } from '@/lib/utils';

const regionalChartConfig = {
  count: {
    label: 'Total',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const BulkSignatureDialog = ({ isOpen, onClose, onSign, count }: { isOpen: boolean, onClose: () => void, onSign: (data: string) => void, count: number }) => {
  const sigPadRef = React.useRef<SignatureCanvas | null>(null);
  const handleClear = () => sigPadRef.current?.clear();
  const handleConfirm = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      onSign(sigPadRef.current.toDataURL());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#1e1b4b] border-white/10 text-white rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-primary">
            <FileSignature className="h-6 w-6" /> Batch Board Sign-off
          </DialogTitle>
          <DialogDescription className="text-white/50 mt-2">
            You are authorizing <strong>{count}</strong> selected agreements in a single action.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-6">
          <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Draw Board Signature</Label>
          <div className="w-full h-40 border-2 border-primary/10 rounded-2xl bg-white overflow-hidden shadow-inner">
            <SignatureCanvas 
              ref={sigPadRef} 
              penColor="black" 
              canvasProps={{ className: 'w-full h-full' }} 
            />
          </div>
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-white/40 hover:text-primary">
              <Eraser className="mr-2 h-4 w-4" /> Clear Canvas
          </Button>
        </div>
        <DialogFooter className="gap-3 sm:flex-col">
          <Button onClick={handleConfirm} className="w-full h-12 text-lg font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-xl">APPROVE {count} RECORDS</Button>
          <Button variant="ghost" onClick={onClose} className="w-full font-bold">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function ManagementDashboard({ user }: { user: User }) {
    const { toast } = useToast();
    const [applications, setApplications] = useAtom(applicationsAtom);
    const [allUsers] = useAtom(usersAtom);
    const [activityLogs] = useAtom(activityLogsAtom);
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const [isBulkSignOpen, setIsBulkSignOpen] = React.useState(false);

    const statusTotals = React.useMemo(() => {
        const counts: Record<string, number> = {};
        applications.forEach(app => {
            counts[app.status] = (counts[app.status] || 0) + 1;
        });
        return counts;
    }, [applications]);

    const agreementsToSign = React.useMemo(() => 
        applications.filter(app => app.status === 'Pending Executive Signature')
    , [applications]);

    const summaryStats = React.useMemo(() => {
        const createdToday = activityLogs.filter(log => log.action === 'Account Created' && isToday(parseISO(log.timestamp))).length;
        return {
            totalToSign: agreementsToSign.length,
            totalActive: applications.filter(a => !['Locked', 'Rejected', 'Not Safe to Proceed'].includes(a.status)).length,
            totalDone: applications.filter(a => ['Dispatched', 'Locked'].includes(a.status)).length,
            totalRejected: applications.filter(a => a.status === 'Rejected' || a.status === 'Not Safe to Proceed').length,
            createdToday,
        };
    }, [applications, activityLogs, agreementsToSign]);

    const regionalData = React.useMemo(() => {
        return zimRegions.map(region => ({
            name: region,
            count: applications.filter(app => app.region === region).length,
        })).sort((a, b) => b.count - a.count);
    }, [applications]);

    const atlPerformance = React.useMemo(() => {
        const atlUsers = allUsers.filter(u => u.role === 'asl');
        return atlUsers.map(atl => {
            const atlApps = applications.filter(app => app.submittedBy === atl.name);
            const lastLog = activityLogs.find(l => l.userName === atl.name && (l.action === 'Login' || l.action === 'Logout'));
            
            return {
                name: atl.name,
                initials: atl.initials,
                created: atlApps.length,
                processed: atlApps.filter(a => !['Draft', 'In Progress', 'Under Review'].includes(a.status)).length,
                approved: atlApps.filter(a => ['Approved', 'Dispatched', 'Locked'].includes(a.status)).length,
                rejected: atlApps.filter(a => a.status === 'Rejected' || a.status === 'Not Safe to Proceed').length,
                lastSeen: lastLog ? new Date(lastLog.timestamp).toLocaleTimeString() : 'N/A',
                status: lastLog?.action === 'Login' ? 'active' : 'offline'
            };
        }).sort((a, b) => b.created - a.created);
    }, [applications, allUsers, activityLogs]);

    const handleBulkSign = (signatureData: string) => {
        const timestamp = new Date().toISOString();
        const updatedApps = applications.map(app => {
            if (selectedIds.includes(app.id)) {
                return {
                    ...app,
                    status: 'Approved by Management' as ApplicationStatus,
                    lastUpdated: timestamp,
                    details: {
                        ...app.details,
                        executiveSignature: signatureData,
                        executiveSignatureTimestamp: timestamp,
                    },
                    history: [
                        ...app.history,
                        { action: 'Approved by Management (Batch Sign-off)', user: user.name, timestamp }
                    ]
                };
            }
            return app;
        });
        
        setApplications(updatedApps);
        toast({ title: "Authorized", description: `${selectedIds.length} records signed.` });
        setSelectedIds([]);
        setIsBulkSignOpen(false);
    };

    if (selectedApplication) {
        const appForReview = applications.find(a => a.id === selectedApplication.id) || selectedApplication;
        return <ApplicationReview application={appForReview} onBack={() => setSelectedApplication(null)} user={user} />;
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 border-b border-white/5 pb-8">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
                    <LayoutDashboard className="h-10 w-10 text-primary" />
                    Management Overview
                  </h2>
                  <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Global System Metrics and Approval Desk.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="px-5 py-2 bg-primary/10 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] animate-pulse shadow-lg">
                        <Fingerprint className="mr-2 h-4 w-4" /> {summaryStats.totalToSign} PENDING APPROVAL
                    </Badge>
                </div>
            </div>
            
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                <Card className="bg-primary/10 border-primary/20 rounded-2xl shadow-xl">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">To Approve</CardTitle></CardHeader>
                    <CardContent><div className="text-4xl font-black text-primary">{summaryStats.totalToSign}</div></CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-2xl shadow-xl">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Active Queue</CardTitle></CardHeader>
                    <CardContent><div className="text-4xl font-black text-white">{summaryStats.totalActive}</div></CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-2xl shadow-xl">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-green-500 tracking-[0.2em]">Success</CardTitle></CardHeader>
                    <CardContent><div className="text-4xl font-black text-green-500">{summaryStats.totalDone}</div></CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-2xl shadow-xl">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-destructive tracking-[0.2em]">Rejected</CardTitle></CardHeader>
                    <CardContent><div className="text-4xl font-black text-destructive">{summaryStats.totalRejected}</div></CardContent>
                </Card>
                <Card className="bg-primary/10 border-primary/20 rounded-2xl shadow-xl md:col-span-2 lg:col-span-1">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Daily Growth</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-primary">+{summaryStats.createdToday}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="approval-desk" className="w-full">
                <TabsList className="bg-white/5 p-1.5 rounded-xl border border-white/5 mb-10 w-full sm:w-auto overflow-x-auto">
                    <TabsTrigger value="approval-desk" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em]">
                        <FileSignature className="mr-2 h-4 w-4" /> APPROVAL DESK
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em]">
                        <Award className="mr-2 h-4 w-4" /> SALES PERFORMANCE
                    </TabsTrigger>
                    <TabsTrigger value="monitoring" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em]">
                        <ShieldCheck className="mr-2 h-4 w-4" /> STAFF LOGS
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em]">
                        <TrendingUp className="mr-2 h-4 w-4" /> ANALYTICS
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="approval-desk" className="animate-in fade-in duration-500">
                    {agreementsToSign.length > 0 ? (
                        <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
                            <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                    <div>
                                        <CardTitle className="text-2xl font-black uppercase tracking-tight">Pending Board Sign-off</CardTitle>
                                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Authorize multiple records for final activation.</p>
                                    </div>
                                    {selectedIds.length > 0 && (
                                        <Button onClick={() => setIsBulkSignOpen(true)} className="h-14 px-8 bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl">
                                            <Fingerprint className="mr-2 h-6 w-6" /> AUTHORIZE BATCH ({selectedIds.length})
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-black/20 border-white/5">
                                            <TableHead className="w-[80px] pl-8">
                                                <Checkbox 
                                                    checked={selectedIds.length === agreementsToSign.length}
                                                    onCheckedChange={() => {
                                                        if (selectedIds.length === agreementsToSign.length) setSelectedIds([]);
                                                        else setSelectedIds(agreementsToSign.map(a => a.id));
                                                    }}
                                                />
                                            </TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black">APPLICANT</TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black">REGION</TableHead>
                                            <TableHead className="text-right pr-8 text-white/40 uppercase text-[10px] font-black">ACTION</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {agreementsToSign.map((app) => (
                                            <TableRow key={app.id} className={cn("hover:bg-white/10 border-white/5", selectedIds.includes(app.id) && "bg-primary/5")}>
                                                <TableCell className="pl-8">
                                                    <Checkbox 
                                                        checked={selectedIds.includes(app.id)}
                                                        onCheckedChange={() => {
                                                            setSelectedIds(prev => prev.includes(app.id) ? prev.filter(i => i !== app.id) : [...prev, app.id]);
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    <div className="font-black text-white uppercase">{app.clientName}</div>
                                                    <div className="text-[10px] text-white/30 uppercase">{app.clientType}</div>
                                                </TableCell>
                                                <TableCell><Badge variant="outline" className="text-[9px]">{app.region}</Badge></TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>REVIEW</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-24 text-center bg-white/5 rounded-3xl border-dashed border-2 border-white/10">
                            <CheckCircle2 className="h-16 w-16 text-white/10 mb-4" />
                            <p className="text-white/40 font-black uppercase tracking-widest">Queue is clear.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="performance" className="animate-in fade-in duration-500">
                    <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden">
                        <CardHeader className="bg-white/5 py-8 px-10 border-b border-white/5">
                            <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Award className="h-6 w-6 text-primary" /> Sales Performance Scorecard
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                                        <TableHead className="pl-10 text-[10px] font-black uppercase text-white/40">Leader</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase text-white/40">Created</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase text-white/40">Processed</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase text-white/40">Approved</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase text-white/40">Rejected</TableHead>
                                        <TableHead className="pr-10 text-right text-[10px] font-black uppercase text-white/40">Efficiency</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {atlPerformance.map((atl) => (
                                        <TableRow key={atl.name} className="hover:bg-white/5 border-white/5 group">
                                            <TableCell className="pl-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-10 w-10 border-2 border-white/10 shadow-lg">
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">{atl.initials}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-black text-white text-lg uppercase">{atl.name}</p>
                                                        <span className="text-[10px] text-white/30 uppercase font-black">{atl.status}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-lg font-black text-white">{atl.created}</TableCell>
                                            <TableCell className="text-center font-mono text-lg font-black text-white/60">{atl.processed}</TableCell>
                                            <TableCell className="text-center font-mono text-lg font-black text-green-500">{atl.approved}</TableCell>
                                            <TableCell className="text-center font-mono text-lg font-black text-destructive">{atl.rejected}</TableCell>
                                            <TableCell className="pr-10 text-right">
                                                <Badge className="font-black text-sm px-4 shadow-lg bg-white/5 text-white">
                                                    {atl.created > 0 ? Math.round((atl.approved / atl.created) * 100) : 0}%
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="monitoring" className="animate-in fade-in duration-500">
                    <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                            <CardTitle className="flex items-center gap-3 text-xl font-black uppercase">
                                <History className="h-6 w-6 text-primary" /> System Activity Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[500px] overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-black/20 border-white/5">
                                            <TableHead className="pl-8 text-[10px] font-black uppercase">Employee</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase">Action</TableHead>
                                            <TableHead className="pr-8 text-right text-[10px] font-black uppercase">Time</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activityLogs.slice(0, 50).map((log) => (
                                            <TableRow key={log.id} className="hover:bg-white/5 border-white/5">
                                                <TableCell className="pl-8 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-black text-primary">{log.userName.substring(0,2)}</div>
                                                        <span className="font-black text-xs uppercase text-white/80">{log.userName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[9px] uppercase font-black px-3 py-1">
                                                        {log.action}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="pr-8 text-right text-[10px] text-white/20 font-mono">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="animate-in fade-in duration-500">
                    <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                            <CardTitle className="flex items-center gap-3 text-xl font-black uppercase">
                                <MapPin className="h-6 w-6 text-primary" /> Regional Volume
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10">
                            <ChartContainer config={regionalChartConfig} className="h-[400px] w-full">
                                <ResponsiveContainer>
                                    <ReChartsBarChart data={regionalData} layout="vertical" margin={{ left: 50, right: 30 }}>
                                        <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.05} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={140} className="text-[10px] font-black uppercase text-white/30" />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                        <Bar dataKey="count" radius={6} barSize={24}>
                                            {regionalData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.05)'} />
                                            ))}
                                        </Bar>
                                    </ReChartsBarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <BulkSignatureDialog 
              isOpen={isBulkSignOpen}
              onClose={() => setIsBulkSignOpen(false)}
              onSign={handleBulkSign}
              count={selectedIds.length}
            />
        </div>
      );
}
