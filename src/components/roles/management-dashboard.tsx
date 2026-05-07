'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { applicationsAtom, Application, ApplicationStatus, activityLogsAtom } from '@/lib/mock-data';
import { zimRegions, rejectionReasons } from '@/lib/types';
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
  Fingerprint,
  CalendarDays,
  Filter,
  Download,
  FileSpreadsheet,
  Search
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SignatureCanvas from 'react-signature-canvas';
import { useToast } from '@/hooks/use-toast';
import { isToday, parseISO, format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { getStateLabel } from '@/lib/state-machine';
import ApplicationReview from '../onboarding/application-review';
import { Button } from '@/components/ui/button';
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

    // Reporting Filters
    const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
    const [selectedAsl, setSelectedAsl] = React.useState('all');
    const [selectedRegion, setSelectedRegion] = React.useState('all');

    const filteredApps = React.useMemo(() => {
        return applications.filter(app => {
            let matches = true;
            
            if (dateRange.start || dateRange.end) {
                const appDate = parseISO(app.submittedDate);
                if (dateRange.start && appDate < startOfDay(parseISO(dateRange.start))) matches = false;
                if (dateRange.end && appDate > endOfDay(parseISO(dateRange.end))) matches = false;
            }
            
            if (selectedAsl !== 'all' && app.submittedBy !== selectedAsl) matches = false;
            if (selectedRegion !== 'all' && app.region !== selectedRegion) matches = false;
            
            return matches;
        });
    }, [applications, dateRange, selectedAsl, selectedRegion]);

    const stats = React.useMemo(() => {
        const approved = filteredApps.filter(a => ['Locked', 'Dispatched', 'Approved'].includes(a.status)).length;
        const rejected = filteredApps.filter(a => a.status === 'Rejected' || a.status === 'Not Safe to Proceed').length;
        const pending = filteredApps.filter(a => !['Locked', 'Dispatched', 'Approved', 'Rejected', 'Not Safe to Proceed'].includes(a.status)).length;
        
        return {
            created: filteredApps.length,
            approved,
            rejected,
            pending,
            processed: approved + rejected
        };
    }, [filteredApps]);

    const regionalData = React.useMemo(() => {
        return zimRegions.map(region => ({
            name: region,
            count: filteredApps.filter(app => app.region === region).length,
        })).sort((a, b) => b.count - a.count);
    }, [filteredApps]);

    const aslPerformance = React.useMemo(() => {
        const atlUsers = allUsers.filter(u => u.role === 'asl');
        return atlUsers.map(atl => {
            const atlApps = filteredApps.filter(app => app.submittedBy === atl.name);
            const approved = atlApps.filter(a => ['Approved', 'Dispatched', 'Locked'].includes(a.status)).length;
            const rejected = atlApps.filter(a => a.status === 'Rejected' || a.status === 'Not Safe to Proceed').length;
            
            return {
                name: atl.name,
                initials: atl.initials,
                created: atlApps.length,
                approved,
                rejected,
                processed: approved + rejected,
                efficiency: atlApps.length > 0 ? Math.round((approved / atlApps.length) * 100) : 0
            };
        }).sort((a, b) => b.created - a.created);
    }, [filteredApps, allUsers]);

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

    const handleExportCSV = () => {
        const headers = ['ID', 'CLIENT', 'TYPE', 'REGION', 'STATUS', 'SUBMITTED', 'STAFF'];
        const rows = filteredApps.map(app => [
            app.id,
            app.clientName,
            app.clientType,
            app.region,
            app.status,
            app.submittedDate,
            app.submittedBy
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Registry_Report_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({ title: "Export Started", description: "Your CSV report is downloading." });
    };

    if (selectedApplication) {
        const appForReview = applications.find(a => a.id === selectedApplication.id) || selectedApplication;
        return <ApplicationReview application={appForReview} onBack={() => setSelectedApplication(null)} user={user} />;
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 border-b border-white/5 pb-8">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
                    <LayoutDashboard className="h-10 w-10 text-primary" />
                    Management Oversight
                  </h2>
                  <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Board Reporting and Network Performance.</p>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-12 bg-white/5 border-white/10 text-white font-bold px-6 rounded-xl shadow-xl">
                                <ListFilter className="mr-2 h-4 w-4 text-primary" /> Global Filters
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-[#1e1b4b] border-white/10 p-6 space-y-6 shadow-2xl rounded-2xl" align="end">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Reporting Period</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} className="bg-black/20 border-white/10 text-[10px]" />
                                    <Input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} className="bg-black/20 border-white/10 text-[10px]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Sales Leader (ASL)</label>
                                <Select value={selectedAsl} onValueChange={setSelectedAsl}>
                                    <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="All Staff" /></SelectTrigger>
                                    <SelectContent className="bg-[#1e1b4b] text-white">
                                        <SelectItem value="all">All Staff</SelectItem>
                                        {allUsers.filter(u => u.role === 'asl').map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Province / Region</label>
                                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                                    <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="All Regions" /></SelectTrigger>
                                    <SelectContent className="bg-[#1e1b4b] text-white">
                                        <SelectItem value="all">All Regions</SelectItem>
                                        {zimRegions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="w-full font-black uppercase tracking-widest bg-primary text-primary-foreground h-10" onClick={() => {
                                setDateRange({start: '', end: ''});
                                setSelectedAsl('all');
                                setSelectedRegion('all');
                            }}>Reset Filters</Button>
                        </PopoverContent>
                    </Popover>
                    <Button onClick={handleExportCSV} variant="secondary" className="h-12 px-6 font-black rounded-xl border-2 shadow-2xl">
                        <FileSpreadsheet className="mr-2 h-5 w-5" /> EXPORT EXCEL
                    </Button>
                </div>
            </div>
            
            {/* KPI Overview Grid */}
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                <Card className="bg-white/5 border-white/10 rounded-2xl shadow-xl">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Created</CardTitle></CardHeader>
                    <CardContent><div className="text-4xl font-black text-white">{stats.created}</div></CardContent>
                </Card>
                <Card className="bg-primary/10 border-primary/20 rounded-2xl shadow-xl">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Approved</CardTitle></CardHeader>
                    <CardContent><div className="text-4xl font-black text-primary">{stats.approved}</div></CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-2xl shadow-xl">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-destructive tracking-[0.2em]">Rejected</CardTitle></CardHeader>
                    <CardContent><div className="text-4xl font-black text-destructive">{stats.rejected}</div></CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-2xl shadow-xl">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Pending Review</CardTitle></CardHeader>
                    <CardContent><div className="text-4xl font-black text-amber-500">{stats.pending}</div></CardContent>
                </Card>
                <Card className="bg-primary/5 border-white/5 rounded-2xl shadow-xl">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Total Processed</CardTitle></CardHeader>
                    <CardContent><div className="text-4xl font-black text-white/80">{stats.processed}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="approval-desk" className="w-full">
                <TabsList className="bg-white/5 p-1.5 rounded-xl border border-white/5 mb-10 w-full sm:w-auto overflow-x-auto justify-start h-auto">
                    <TabsTrigger value="approval-desk" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em]">
                        <FileSignature className="mr-2 h-4 w-4" /> BOARD SIGN-OFF
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em]">
                        <Award className="mr-2 h-4 w-4" /> ASL PERFORMANCE
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="px-8 h-10 rounded-lg font-black uppercase text-[10px] tracking-[0.2em]">
                        <TrendingUp className="mr-2 h-4 w-4" /> REGIONAL TRENDS
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="approval-desk" className="animate-in fade-in duration-500">
                    <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div>
                                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Technical Authorization Queue</CardTitle>
                                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Review and sign finalized agent agreements.</p>
                                </div>
                                {selectedIds.length > 0 && (
                                    <Button onClick={() => setIsBulkSignOpen(true)} className="h-14 px-8 bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl">
                                        <Fingerprint className="mr-2 h-6 w-6" /> BATCH AUTHORIZE ({selectedIds.length})
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredApps.filter(a => a.status === 'Management Review').length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-black/20 border-white/5">
                                            <TableHead className="w-[80px] pl-8">
                                                <Checkbox 
                                                    checked={selectedIds.length === filteredApps.filter(a => a.status === 'Management Review').length}
                                                    onCheckedChange={() => {
                                                        const signable = filteredApps.filter(a => a.status === 'Management Review');
                                                        if (selectedIds.length === signable.length) setSelectedIds([]);
                                                        else setSelectedIds(signable.map(a => a.id));
                                                    }}
                                                />
                                            </TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black">APPLICANT</TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black">REGION</TableHead>
                                            <TableHead className="text-right pr-8 text-white/40 uppercase text-[10px] font-black">ACTION</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredApps.filter(a => a.status === 'Management Review').map((app) => (
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
                                                    <div className="text-[10px] text-white/30 uppercase">{app.clientType} • {app.id}</div>
                                                </TableCell>
                                                <TableCell><Badge variant="outline" className="text-[9px] font-black">{app.region}</Badge></TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>AUDIT</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-24 text-center">
                                    <CheckCircle2 className="h-16 w-16 text-white/10 mb-4" />
                                    <p className="text-white/40 font-black uppercase tracking-widest">Board queue is currently clear.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="animate-in fade-in duration-500">
                    <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden">
                        <CardHeader className="bg-white/5 py-8 px-10 border-b border-white/5">
                            <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Award className="h-6 w-6 text-primary" /> Staff Performance Scorecard
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                                        <TableHead className="pl-10 text-[10px] font-black uppercase text-white/40">Sales Leader (ASL)</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase text-white/40">Submissions</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase text-white/40">Approved</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase text-white/40">Rejected</TableHead>
                                        <TableHead className="pr-10 text-right text-[10px] font-black uppercase text-white/40">Clearance Rate</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {aslPerformance.map((atl) => (
                                        <TableRow key={atl.name} className="hover:bg-white/5 border-white/5 transition-colors">
                                            <TableCell className="pl-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-10 w-10 border-2 border-white/10 shadow-lg">
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">{atl.initials}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-black text-white text-lg uppercase">{atl.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-lg font-black text-white">{atl.created}</TableCell>
                                            <TableCell className="text-center font-mono text-lg font-black text-green-500">{atl.approved}</TableCell>
                                            <TableCell className="text-center font-mono text-lg font-black text-destructive">{atl.rejected}</TableCell>
                                            <TableCell className="pr-10 text-right">
                                                <Badge className={cn(
                                                    "font-black text-sm px-4 py-1 rounded-full",
                                                    atl.efficiency > 75 ? "bg-green-500/20 text-green-500" : "bg-white/5 text-white/60"
                                                )}>
                                                    {atl.efficiency}%
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="animate-in fade-in duration-500">
                    <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                            <CardTitle className="flex items-center gap-3 text-xl font-black uppercase">
                                <MapPin className="h-6 w-6 text-primary" /> Regional Volume Analysis
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

