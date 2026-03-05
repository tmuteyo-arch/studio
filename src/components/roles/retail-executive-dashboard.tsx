'use client';
import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { applicationsAtom, ApplicationStatus, Application } from '@/lib/mock-data';
import { zimRegions } from '@/lib/types';
import { User, users as allUsers } from '@/lib/users';
import { CheckCircle2, AlertCircle, Inbox, BarChart, FileSignature, Edit, FileCheck2, Eraser, MapPin, Users, Award } from 'lucide-react';
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Batch Sign Agreements</DialogTitle>
          <DialogDescription>
            You are about to apply your signature to <strong>{count}</strong> selected agreements. This action will finalize all of them.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Label>Your Digital Signature</Label>
          <div className="w-full border rounded-md bg-white p-2">
            <SignatureCanvas 
              ref={sigPadRef} 
              penColor="black" 
              canvasProps={{ className: 'w-full h-32' }} 
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleClear}>
              <Eraser className="mr-2 h-4 w-4" />Clear
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Sign & Finalize {count} Items</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const regionalChartConfig = {
  count: {
    label: 'Applications',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function RetailExecutiveDashboard({ user }: RetailExecutiveDashboardProps) {
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

    const atlPerformance = React.useMemo(() => {
        const atlUsers = allUsers.filter(u => u.role === 'atl');
        return atlUsers.map(atl => {
            const atlApps = applications.filter(app => app.submittedBy === atl.name);
            return {
                name: atl.name,
                initials: atl.initials,
                total: atlApps.length,
                signed: atlApps.filter(a => a.status === 'Signed').length,
                rejected: atlApps.filter(a => a.status === 'Rejected').length,
                pending: atlApps.filter(a => !['Signed', 'Rejected', 'Archived'].includes(a.status)).length,
            };
        }).sort((a, b) => b.total - a.total);
    }, [applications]);

    const agreementsToSign = React.useMemo(() => 
        applications.filter(app => app.status === 'Pending Executive Signature'),
    [applications]);

    const signedAgreements = React.useMemo(() => 
        applications.filter(app => app.status === 'Signed'),
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
                        { action: 'Agreement Signed by Executive (Batch)', user: user.name, timestamp }
                    ]
                };
            }
            return app;
        }));
        
        toast({
            title: "Batch Signing Successful",
            description: `Successfully finalized ${selectedIds.length} agreements.`,
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
            <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold">Retail Executive Dashboard</h2>
                  <p className="text-muted-foreground">High-level summary and final verification of agreements across regions.</p>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Agreements to Sign</CardTitle>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.pendingAgreementSignature}</div>
                        <p className="text-xs text-muted-foreground">Awaiting your final signature.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
                        <Inbox className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalPending}</div>
                        <p className="text-xs text-muted-foreground">Total pipeline</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Onboarded</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalSigned}</div>
                        <p className="text-xs text-muted-foreground">Successfully signed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rejected</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalRejected}</div>
                        <p className="text-xs text-muted-foreground">Applications rejected</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalApplications}</div>
                        <p className="text-xs text-muted-foreground">System wide total</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Regional Performance (Zimbabwe)
                        </CardTitle>
                        <CardDescription>Breakdown of all account applications by province.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={regionalChartConfig} className="h-80 w-full">
                            <ResponsiveContainer>
                                <ReChartsBarChart data={regionalData} layout="vertical" margin={{ left: 50, right: 20 }}>
                                    <CartesianGrid horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        tickLine={false} 
                                        axisLine={false} 
                                        width={140}
                                        className="text-xs"
                                    />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Bar dataKey="count" radius={4}>
                                        {regionalData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} />
                                        ))}
                                    </Bar>
                                </ReChartsBarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Regional Ranking</CardTitle>
                        <CardDescription>Top performing regions by volume.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {regionalData.slice(0, 5).map((region, index) => (
                                <div key={region.name} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium">{region.name}</span>
                                    </div>
                                    <Badge variant="secondary">{region.count} Apps</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        ATL Individual Performance
                    </CardTitle>
                    <CardDescription>
                        Performance metrics for Account Taking Leaders based on their submitted applications.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ATL Name</TableHead>
                                <TableHead className="text-center">Total Submitted</TableHead>
                                <TableHead className="text-center text-green-600">Signed (Approved)</TableHead>
                                <TableHead className="text-center text-red-600">Rejected</TableHead>
                                <TableHead className="text-center text-amber-600">In Pipeline</TableHead>
                                <TableHead className="text-right">Success Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {atlPerformance.map((atl) => (
                                <TableRow key={atl.name}>
                                    <TableCell className="font-medium flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{atl.initials}</AvatarFallback>
                                        </Avatar>
                                        {atl.name}
                                    </TableCell>
                                    <TableCell className="text-center font-bold">{atl.total}</TableCell>
                                    <TableCell className="text-center">{atl.signed}</TableCell>
                                    <TableCell className="text-center">{atl.rejected}</TableCell>
                                    <TableCell className="text-center">{atl.pending}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={atl.total > 0 && (atl.signed / atl.total) > 0.8 ? 'success' : 'outline'}>
                                            {atl.total > 0 ? Math.round((atl.signed / atl.total) * 100) : 0}%
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            {agreementsToSign.length > 0 && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Edit className="h-5 w-5" />
                                    Agreements Pending Your Signature
                                </CardTitle>
                                <CardDescription>
                                    Review and sign multiple agreements at once to save time.
                                </CardDescription>
                            </div>
                            {selectedIds.length > 0 && (
                                <Button onClick={() => setIsBulkSignOpen(true)} className="bg-primary text-primary-foreground animate-in fade-in slide-in-from-right-2">
                                    <FileSignature className="mr-2 h-4 w-4" />
                                    Batch Sign ({selectedIds.length})
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox 
                                            checked={selectedIds.length === agreementsToSign.length && agreementsToSign.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>App ID</TableHead>
                                    <TableHead>Client Name</TableHead>
                                    <TableHead>Region</TableHead>
                                    <TableHead>Supervisor Signature</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {agreementsToSign.map((app) => (
                                    <TableRow key={app.id} className={selectedIds.includes(app.id) ? "bg-primary/5" : ""}>
                                        <TableCell>
                                            <Checkbox 
                                                checked={selectedIds.includes(app.id)}
                                                onCheckedChange={() => toggleSelect(app.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{app.id}</TableCell>
                                        <TableCell className="font-medium">{app.clientName}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal">{app.region}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    Signed by {app.history.find(h => h.action.includes('Supervisor'))?.user || 'Supervisor'}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>Individual Review</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileCheck2 />
                        Finalized Agency Agreements
                    </CardTitle>
                    <CardDescription>
                        A history of all agency agreements that have been fully signed and finalized.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {signedAgreements.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>App ID</TableHead>
                                    <TableHead>Client Name</TableHead>
                                    <TableHead>Region</TableHead>
                                    <TableHead>Date Finalized</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {signedAgreements.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-mono text-xs">{app.id}</TableCell>
                                        <TableCell className="font-medium">{app.clientName}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal">{app.region}</Badge>
                                        </TableCell>
                                        <TableCell>{app.details.executiveSignatureTimestamp ? new Date(app.details.executiveSignatureTimestamp).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(app)}>View Record</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex items-center justify-center p-12 text-center border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">
                                No finalized agency agreements found in the system.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <BulkSignatureDialog 
              isOpen={isBulkSignOpen}
              onClose={() => setIsBulkSignOpen(false)}
              onSign={handleBulkSign}
              count={selectedIds.length}
            />
        </div>
      )
}
