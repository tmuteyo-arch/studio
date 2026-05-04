'use client';
import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { applicationsAtom, ApplicationStatus, Application } from '@/lib/mock-data';
import { zimRegions } from '@/lib/types';
import { User, usersAtom } from '@/lib/users';
import { CheckCircle2, AlertCircle, Inbox, BarChart, FileSignature, Edit, FileCheck2, Eraser, MapPin, Award, LayoutDashboard, History, TrendingUp, ShieldCheck, Fingerprint } from 'lucide-react';
import ApplicationReview from '../onboarding/application-review';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import SignatureCanvas from 'react-signature-canvas';
import { useToast } from '@/hooks/use-toast';
import { Bar, BarChart as ReChartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStateLabel } from '@/lib/state-machine';
import { cn } from '@/lib/utils';

interface RetailExecutiveDashboardProps {
    user: User;
}

const BulkSignatureDialog = ({ isOpen, onClose, onSign, count }: { isOpen: boolean, onClose: () => void, onSign: (data: string) => void, count: number }) => {
  const sigPadRef = React.useRef<SignatureCanvas | null>(null);

  const handleClear = () => sigPadRef.current?.clear();
  
  const handleConfirm = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataUrl = sigPadRef.current.toDataURL();
      onSign(dataUrl);
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
            You are authorizing <strong>{count}</strong> selected agreements in a single regulatory action.
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

const regionalChartConfig = {
  count: {
    label: 'Volume',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function RetailExecutiveDashboard({ user }: RetailExecutiveDashboardProps) {
    const { toast } = useToast();
    const [applications, setApplications] = useAtom(applicationsAtom);
    const [allUsers] = useAtom(usersAtom);
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const [isBulkSignOpen, setIsBulkSignOpen] = React.useState(false);

    const summaryStats = React.useMemo(() => {
        return {
            totalToSign: applications.filter(a => a.status === 'Pending Executive Signature').length,
            totalActive: applications.filter(a => !['Archived', 'Locked', 'Rejected'].includes(a.status)).length,
            totalDone: applications.filter(a => ['Dispatched', 'Locked'].includes(a.status)).length,
            totalRejected: applications.filter(a => a.status === 'Rejected').length,
        };
    }, [applications]);

    const regionalData = React.useMemo(() => {
        return zimRegions.map(region => ({
            name: region,
            count: applications.filter(app => app.region === region).length,
        })).sort((a, b) => b.count - a.count);
    }, [applications]);

    const agreementsToSign = React.useMemo(() => 
        applications.filter(app => app.status === 'Pending Executive Signature')
    , [applications]);

    const toggleSelectAll = () => {
        if (selectedIds.length === agreementsToSign.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(agreementsToSign.map(a => a.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

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
        toast({ title: "Authorized", description: `${selectedIds.length} records signed and returned to Supervisors.` });
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
                    <Award className="h-10 w-10 text-primary" />
                    Management
                  </h2>
                  <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Board Audit and Signature Authority.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-5 py-2 bg-primary/10 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] animate-pulse shadow-lg">
                        <Fingerprint className="mr-2 h-4 w-4" /> {summaryStats.totalToSign} PENDING AUTHORIZATION
                    </Badge>
                </div>
            </div>
            
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
                <Card className="bg-primary/10 border-primary/20 rounded-2xl group hover:bg-primary/20 transition-all cursor-default">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">To Authorize</CardTitle>
                        <FileSignature className="h-8 w-8 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-primary">{summaryStats.totalToSign}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Active Queue</CardTitle>
                        <Inbox className="h-8 w-8 text-white/20" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white">{summaryStats.totalActive}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Success Volume</CardTitle>
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-green-500">{summaryStats.totalDone}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Regulatory Blocks</CardTitle>
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white">{summaryStats.totalRejected}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="sign-off" className="w-full">
                <TabsList className="bg-white/5 p-1.5 rounded-xl border border-white/5 mb-10">
                    <TabsTrigger value="sign-off" className="px-10 h-10 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase text-[10px] tracking-[0.2em] transition-all">
                        <FileSignature className="mr-2 h-4 w-4" /> AUTHORIZATION DESK
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="px-10 h-10 rounded-lg data-[state=active]:bg-white/20 font-black uppercase text-[10px] tracking-[0.2em] transition-all">
                        <TrendingUp className="mr-2 h-4 w-4" /> ANALYTICS
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sign-off" className="animate-in fade-in duration-500">
                    {agreementsToSign.length > 0 ? (
                        <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
                            <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                    <div>
                                        <CardTitle className="text-2xl font-black uppercase tracking-tight">Pending Board Approval</CardTitle>
                                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Authorize multiple records for final core registry activation.</p>
                                    </div>
                                    {selectedIds.length > 0 && (
                                        <Button onClick={() => setIsBulkSignOpen(true)} className="h-14 px-8 bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl animate-in slide-in-from-right-4">
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
                                                    checked={selectedIds.length === agreementsToSign.length && agreementsToSign.length > 0}
                                                    onCheckedChange={toggleSelectAll}
                                                    className="border-white/20 data-[state=checked]:bg-primary"
                                                />
                                            </TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">APPLICANT</TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">REGION</TableHead>
                                            <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">AUDIT TRAIL</TableHead>
                                            <TableHead className="text-right pr-8 text-white/40 uppercase text-[10px] font-black tracking-widest">ACTION</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {agreementsToSign.map((app) => (
                                            <TableRow key={app.id} className={cn("hover:bg-white/10 border-white/5 transition-colors group", selectedIds.includes(app.id) && "bg-primary/5")}>
                                                <TableCell className="pl-8">
                                                    <Checkbox 
                                                        checked={selectedIds.includes(app.id)}
                                                        onCheckedChange={() => toggleSelect(app.id)}
                                                        className="border-white/20 data-[state=checked]:bg-primary"
                                                    />
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    <div className="font-black text-white text-lg uppercase tracking-tight group-hover:text-primary transition-colors">{app.clientName}</div>
                                                    <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">{app.clientType} • {app.id}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="border-white/10 text-white/50 font-bold uppercase text-[9px] tracking-widest px-3 py-1 bg-white/5">{app.region}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                            <span className="text-[9px] font-black uppercase text-white/40">AUDITED BY: {app.history.find(h => h.action.includes('Supervisor'))?.user || 'SUPERVISOR'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                            <span className="text-[9px] font-black uppercase text-white/40">ID ASSIGNED: {app.details.brIdentity}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <Button variant="outline" size="sm" className="font-black uppercase h-9 px-6 rounded-lg shadow-lg" onClick={() => setSelectedApplication(app)}>AUDIT & SIGN</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-dashed border-2 border-white/5 bg-white/5 backdrop-blur-sm rounded-3xl">
                            <CardContent className="flex flex-col items-center justify-center p-24 text-center">
                                <CheckCircle2 className="h-20 w-20 text-white/10 mb-8" />
                                <p className="text-2xl font-black uppercase tracking-tight text-white/40">Queue is clear</p>
                                <p className="text-sm text-white/20 font-bold uppercase tracking-widest mt-2">All agreements have been processed.</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="analytics" className="animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-2 border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
                            <CardHeader className="bg-white/5 border-b border-white/5">
                                <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
                                    <MapPin className="h-6 w-6 text-primary" /> Regional Oversight
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <ChartContainer config={regionalChartConfig} className="h-[400px] w-full">
                                    <ResponsiveContainer>
                                        <ReChartsBarChart data={regionalData} layout="vertical" margin={{ left: 50, right: 30 }}>
                                            <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.05} />
                                            <XAxis type="number" hide />
                                            <YAxis 
                                                dataKey="name" 
                                                type="category" 
                                                tickLine={false} 
                                                axisLine={false} 
                                                width={140}
                                                className="text-[10px] font-black uppercase text-white/30"
                                            />
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
                        
                        <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
                            <CardHeader className="bg-white/5 border-b border-white/5">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Network Ranking</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {regionalData.slice(0, 10).map((region, index) => (
                                        <div key={region.name} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-black shadow-lg ${index < 3 ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-white/30'}`}>
                                                    {index + 1}
                                                </div>
                                                <span className="text-sm font-black uppercase tracking-tight text-white/70 group-hover:text-white">{region.name}</span>
                                            </div>
                                            <Badge variant="secondary" className="font-mono text-sm px-3 bg-white/5 text-white/40">{region.count}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
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
