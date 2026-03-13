'use client';
import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { applicationsAtom, ApplicationStatus, Application } from '@/lib/mock-data';
import { zimRegions } from '@/lib/types';
import { User, users as allUsers } from '@/lib/users';
import { 
  CheckCircle2, 
  AlertCircle, 
  Inbox, 
  BarChart, 
  FileSignature, 
  Edit, 
  FileCheck2, 
  Eraser, 
  MapPin, 
  Award, 
  LayoutDashboard, 
  History, 
  TrendingUp,
  Users,
  ShieldCheck
} from 'lucide-react';
import ApplicationReview from '../onboarding/application-review';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import SignatureCanvas from 'react-signature-canvas';
import { useToast } from '@/hooks/use-toast';
import { Bar, BarChart as ReChartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ManagementDashboardProps {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Application Approval</DialogTitle>
          <DialogDescription>
            You are applying your executive signature to <strong>{count}</strong> selected applications. This action will finalize the agency agreements.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Label>Executive Digital Signature</Label>
          <div className="w-full border rounded-md bg-white p-2">
            <SignatureCanvas 
              ref={sigPadRef} 
              penColor="black" 
              canvasProps={{ className: 'w-full h-32' }} 
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleClear}>
              <Eraser className="mr-2 h-4 w-4" />Clear Signature
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Sign & Approve {count} Cases</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const regionalChartConfig = {
  count: {
    label: 'Applications',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function ManagementDashboard({ user }: ManagementDashboardProps) {
    const { toast } = useToast();
    const [applications, setApplications] = useAtom(applicationsAtom);
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const [isBulkSignOpen, setIsBulkSignOpen] = React.useState(false);

    const summaryStats = React.useMemo(() => {
        const pendingStatuses: ApplicationStatus[] = ['Submitted', 'In Review', 'Returned to ATL', 'Pending Supervisor', 'Pending Executive Signature'];
        return {
            totalPending: applications.filter(a => pendingStatuses.includes(a.status)).length,
            totalSigned: applications.filter(a => a.status === 'Signed').length,
            totalRejected: applications.filter(a => a.status === 'Rejected').length,
            totalApplications: applications.length,
            pendingAgreementSignature: applications.filter(a => a.status === 'Pending Executive Signature').length,
        };
    }, [applications]);

    const regionalData = React.useMemo(() => {
        return zimRegions.map(region => ({
            name: region,
            count: applications.filter(app => app.region === region).length,
        })).sort((a, b) => b.count - a.count);
    }, [applications]);

    const teamPerformance = React.useMemo(() => {
        const supervisors = allUsers.filter(u => u.role === 'supervisor');
        const clerks = allUsers.filter(u => u.role === 'back-office');

        return {
            supervisors: supervisors.map(sup => ({
                name: sup.name,
                initials: sup.initials,
                signed: applications.filter(a => a.history.some(h => h.user === sup.name && h.action.includes('Signed'))).length,
                rejected: applications.filter(a => a.history.some(h => h.user === sup.name && h.action === 'Rejected')).length,
            })),
            clerks: clerks.map(clk => ({
                name: clk.name,
                initials: clk.initials,
                processed: applications.filter(a => a.history.some(h => h.user === clk.name && (h.action === 'Pending Supervisor' || h.action === 'Returned to ATL'))).length,
            }))
        };
    }, [applications]);

    const agreementsToSign = React.useMemo(() => 
        applications.filter(app => app.status === 'Pending Executive Signature'),
    [applications]);

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
        setApplications(prev => prev.map(app => {
            if (selectedIds.includes(app.id)) {
                return {
                    ...app,
                    status: 'Signed' as ApplicationStatus,
                    lastUpdated: timestamp,
                    details: {
                        ...app.details,
                        executiveSignature: signatureData,
                        executiveSignatureTimestamp: timestamp,
                    },
                    history: [
                        ...app.history,
                        { action: 'Approved by Executive Management', user: user.name, timestamp }
                    ]
                };
            }
            return app;
        }));
        
        toast({
            title: "Bulk Approval Success",
            description: `Finalized and signed ${selectedIds.length} agency agreements.`,
        });
        
        setSelectedIds([]);
        setIsBulkSignOpen(false);
    };

    const applicationForReview = selectedApplication 
      ? applications.find(app => app.id === selectedApplication.id) 
      : null;

    if (applicationForReview) {
        return <ApplicationReview 
                  application={applicationForReview}
                  onBack={() => setSelectedApplication(null)}
                  user={user}
               />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold">Management Hub</h2>
                  <p className="text-muted-foreground">Strategic oversight, executive approvals, and operational metrics.</p>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-primary/5 border-primary/20 text-primary font-bold">
                    {summaryStats.pendingAgreementSignature} Awaiting Executive Review
                </Badge>
            </div>
            
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                <Card className="border-primary/50 bg-primary/5">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-primary">Pending Sign-off</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{summaryStats.pendingAgreementSignature}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-muted-foreground">Active Queue</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{summaryStats.totalPending}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-muted-foreground">Finalized</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{summaryStats.totalSigned}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-muted-foreground">Rejected</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{summaryStats.totalRejected}</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-muted-foreground">Registry Total</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{summaryStats.totalApplications}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="sign-offs" className="w-full">
                <TabsList className="bg-muted/50 p-1 mb-6">
                    <TabsTrigger value="sign-offs" className="flex items-center gap-2">
                        <FileSignature className="h-4 w-4" />
                        Executive Review
                    </TabsTrigger>
                    <TabsTrigger value="team" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team Performance
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Regional Trends
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sign-offs" className="space-y-6">
                    {agreementsToSign.length > 0 ? (
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div>
                                        <CardTitle>Awaiting Executive Mandate</CardTitle>
                                        <CardDescription>Applications verified by Back Office Supervisors and ready for final execution.</CardDescription>
                                    </div>
                                    {selectedIds.length > 0 && (
                                        <Button onClick={() => setIsBulkSignOpen(true)}>
                                            <FileSignature className="mr-2 h-4 w-4" />
                                            Execute Selected ({selectedIds.length})
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">
                                                <Checkbox checked={selectedIds.length === agreementsToSign.length} onCheckedChange={toggleSelectAll} />
                                            </TableHead>
                                            <TableHead>Client Legal Entity</TableHead>
                                            <TableHead>Region</TableHead>
                                            <TableHead>Supervisory Sign-off</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {agreementsToSign.map((app) => (
                                            <TableRow key={app.id}>
                                                <TableCell><Checkbox checked={selectedIds.includes(app.id)} onCheckedChange={() => toggleSelect(app.id)} /></TableCell>
                                                <TableCell><div className="font-medium">{app.clientName}</div></TableCell>
                                                <TableCell><Badge variant="secondary">{app.region}</Badge></TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        Verified by {app.history.find(h => h.action.includes('Supervisor'))?.user || 'Supervisor'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>Review & Sign</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="text-center p-12 bg-muted/20 rounded-lg border-2 border-dashed">
                            <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                            <p className="text-lg font-medium">Approval queue is currently clear.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="team" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle>Supervisory Output Metrics</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Supervisor</TableHead>
                                            <TableHead className="text-center">Approved</TableHead>
                                            <TableHead className="text-center">Rejected</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teamPerformance.supervisors.map(sup => (
                                            <TableRow key={sup.name}>
                                                <TableCell className="font-medium">{sup.name}</TableCell>
                                                <TableCell className="text-center text-green-600 font-bold">{sup.signed}</TableCell>
                                                <TableCell className="text-center text-destructive font-bold">{sup.rejected}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Clerk Processing Throughput</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Clerk</TableHead>
                                            <TableHead className="text-right">Applications Processed</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teamPerformance.clerks.map(clk => (
                                            <TableRow key={clk.name}>
                                                <TableCell className="font-medium">{clk.name}</TableCell>
                                                <TableCell className="text-right font-bold">{clk.processed}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Application Volume by Region</CardTitle></CardHeader>
                        <CardContent>
                            <ChartContainer config={regionalChartConfig} className="h-[300px] w-full">
                                <ResponsiveContainer>
                                    <ReChartsBarChart data={regionalData} layout="vertical" margin={{ left: 50 }}>
                                        <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={140} className="text-xs font-medium" />
                                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                        <Bar dataKey="count" radius={4} fill="hsl(var(--primary))" barSize={20} />
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
