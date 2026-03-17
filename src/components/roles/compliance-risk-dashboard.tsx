'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { applicationsAtom, Application } from '@/lib/mock-data';
import { zimRegions } from '@/lib/types';
import { User } from '@/lib/users';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Scale, 
  MapPin, 
  Fingerprint,
  AlertTriangle,
  FileWarning,
  ListTodo,
  ShieldQuestion,
  Lock,
  Database,
  Activity,
  FileCheck,
  UserSearch
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Bar, BarChart as ReChartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, Pie, PieChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import ApplicationReview from '../onboarding/application-review';
import { cn } from '@/lib/utils';

const chartConfig = {
  count: {
    label: 'Records',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

type RiskCategory = 'Security' | 'Data' | 'Compliance' | 'System';
type RiskStatus = 'Open' | 'Closed';

interface ComplianceRiskItem {
  id: string;
  description: string;
  category: RiskCategory;
  likelihood: number; // 1-5
  impact: number; // 1-5
  mitigation: string;
  owner: string;
  status: RiskStatus;
}

const initialComplianceRisks: ComplianceRiskItem[] = [
  {
    id: 'CMP-001',
    description: 'PEP identification failure during automated screening.',
    category: 'Compliance',
    likelihood: 2,
    impact: 5,
    mitigation: 'Implement mandatory dual-clerk verification for all high-risk hits.',
    owner: 'Compliance Chief',
    status: 'Open',
  },
  {
    id: 'CMP-002',
    description: 'Storage of uncertified KYC document copies.',
    category: 'Data',
    likelihood: 3,
    impact: 4,
    mitigation: 'Automatic rejection of non-stamped uploads via Genkit AI validation.',
    owner: 'Back Office Lead',
    status: 'Open',
  },
  {
    id: 'CMP-003',
    description: 'Incomplete audit trail for supervisor overrides.',
    category: 'Compliance',
    likelihood: 1,
    impact: 5,
    mitigation: 'System enforces mandatory comment field for all manual approvals.',
    owner: 'IT Compliance',
    status: 'Open',
  }
];

export default function ComplianceRiskDashboard({ user }: { user: User }) {
  const [applications] = useAtom(applicationsAtom);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  const [risks] = React.useState<ComplianceRiskItem[]>(initialComplianceRisks);

  const complianceStats = React.useMemo(() => {
    const highRisk = applications.filter(a => a.fcbStatus === 'Adverse' || a.fcbStatus === 'PEP' || a.fcbStatus === 'Prior Adverse');
    const peps = applications.filter(a => a.fcbStatus === 'PEP');
    const pendingCompliance = applications.filter(a => ['Submitted', 'In Review', 'Pending Supervisor'].includes(a.status));
    
    const withFullDocs = applications.filter(a => a.documents.length >= 3).length;
    const precision = applications.length > 0 ? Math.round((withFullDocs / applications.length) * 100) : 0;

    return {
      hitCount: highRisk.length,
      pepCount: peps.length,
      pendingCount: pendingCompliance.length,
      precision,
      total: applications.length
    };
  }, [applications]);

  const fcbDistribution = React.useMemo(() => {
    const counts: Record<string, number> = {
      'Good': 0,
      'Inclusive': 0,
      'Adverse': 0,
      'PEP': 0,
      'Prior Adverse': 0
    };
    applications.forEach(a => {
      if (counts[a.fcbStatus] !== undefined) counts[a.fcbStatus]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const regionalComplianceData = React.useMemo(() => {
    return zimRegions.map(region => {
      const apps = applications.filter(a => a.region === region);
      const violations = apps.filter(a => a.fcbStatus === 'Adverse' || a.fcbStatus === 'Prior Adverse').length;
      return { name: region, count: apps.length, violations };
    }).sort((a, b) => b.violations - a.violations);
  }, [applications]);

  const priorityQueue = React.useMemo(() => {
    return applications
      .filter(a => (a.fcbStatus === 'PEP' || a.fcbStatus === 'Adverse' || a.fcbStatus === 'Prior Adverse') && a.status !== 'Archived')
      .filter(a => a.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || a.id.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [applications, searchTerm]);

  const complianceAuditTrail = React.useMemo(() => {
    return applications.flatMap(app => 
      app.history.map(log => ({ ...log, appId: app.id, clientName: app.clientName }))
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 30);
  }, [applications]);

  const getComplianceColor = (score: number) => {
    if (score >= 15) return 'text-destructive';
    if (score >= 8) return 'text-primary';
    return 'text-green-500';
  };

  if (selectedApplication) {
    return <ApplicationReview application={selectedApplication} onBack={() => setSelectedApplication(null)} user={user} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            COMPLIANCE & AML COMMAND
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold">Regulatory Auditing: KYC Verification & AML Hit Management</p>
        </div>
        <div className="flex gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1">
                <UserSearch className="mr-2 h-3 w-3" />
                {complianceStats.hitCount} Total Compliance Hits
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">AML Compliance Hits</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{complianceStats.hitCount}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase">Records requiring human audit</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">PEP Hit Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{complianceStats.pepCount}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase">Politically Exposed Persons</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">Audit Pipeline</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.pendingCount}</div>
            <p className="text-[10px] text-white/40 mt-1 uppercase">Awaiting final compliance check</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">KYC Precision Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-1">
                <span className="text-2xl font-bold">{complianceStats.precision}%</span>
                <FileCheck className="h-5 w-5 text-green-500" />
            </div>
            <Progress value={complianceStats.precision} className="h-1 bg-white/10" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="aml" className="w-full">
        <TabsList className="bg-black/20 p-1 mb-6">
          <TabsTrigger value="aml" className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> AML Investigation Queue</TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2"><Fingerprint className="h-4 w-4" /> Compliance Audit Trail</TabsTrigger>
          <TabsTrigger value="regional" className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Regional Compliance Hits</TabsTrigger>
          <TabsTrigger value="register" className="flex items-center gap-2"><ListTodo className="h-4 w-4" /> Compliance Registry</TabsTrigger>
        </TabsList>

        <TabsContent value="aml">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none bg-white/5 backdrop-blur-md">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <CardTitle>Priority Compliance Review</CardTitle>
                  <CardDescription>Records flagged for enhanced due diligence (EDD) by the system.</CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search hits..." className="pl-9 bg-black/20 border-white/10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                      <TableHead className="pl-6 text-[10px] font-bold uppercase text-white/50">Applicant Context</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50">Compliance Flag</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50">Audit Status</TableHead>
                      <TableHead className="pr-6 text-right text-[10px] font-bold uppercase text-white/50">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priorityQueue.map((app) => (
                      <TableRow key={app.id} className="border-white/5 hover:bg-white/5">
                        <TableCell className="pl-6 py-4">
                          <div><p className="font-bold text-white">{app.clientName}</p><p className="text-[10px] text-white/30 font-mono">{app.id}</p></div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={app.fcbStatus === 'PEP' ? 'secondary' : 'destructive'} className="uppercase text-[9px] font-bold">
                            {app.fcbStatus}
                          </Badge>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[9px]">{app.status}</Badge></TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => setSelectedApplication(app)}>Verify ID</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {priorityQueue.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="h-24 text-center text-white/20 italic">No outstanding compliance hits detected.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/5 backdrop-blur-md">
              <CardHeader><CardTitle>Compliance Distribution</CardTitle></CardHeader>
              <CardContent className="flex justify-center">
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={fcbDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {fcbDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={
                            entry.name === 'Adverse' || entry.name === 'Prior Adverse' ? 'hsl(var(--destructive))' :
                            entry.name === 'PEP' ? 'hsl(var(--primary))' :
                            'hsl(var(--muted))'
                          } />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent hideLabel />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col gap-2 items-start">
                <div className="flex items-center gap-2 text-xs text-white/60"><div className="h-2 w-2 rounded-full bg-destructive" /> Regulatory Violations</div>
                <div className="flex items-center gap-2 text-xs text-white/60"><div className="h-2 w-2 rounded-full bg-primary" /> PEP Monitoring Hit</div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="border-none bg-white/5 backdrop-blur-md">
            <CardHeader>
                <CardTitle>Full Compliance Audit Trail</CardTitle>
                <CardDescription>Immutable record of all identity verification, status transitions, and data access events.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 border-white/5">
                    <TableHead className="pl-6 text-[10px] font-bold uppercase text-white/50">Audit Time</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/50">Target Entity</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-white/50">Compliance Action</TableHead>
                    <TableHead className="pr-6 text-[10px] font-bold uppercase text-white/50">Authorized Actor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceAuditTrail.map((log, idx) => (
                    <TableRow key={idx} className="border-white/5 text-[11px] hover:bg-white/5">
                      <TableCell className="pl-6 text-white/40">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell><div><p className="font-bold text-white">{log.clientName}</p><p className="text-[9px] text-white/20 font-mono">{log.appId}</p></div></TableCell>
                      <TableCell><Badge variant="secondary" className="text-[9px] uppercase font-bold">{log.action}</Badge></TableCell>
                      <TableCell className="pr-6 font-medium text-white">{log.user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional">
          <Card className="border-none bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Regional AML Performance</CardTitle>
              <CardDescription>Concentration of adverse compliance findings across Zimbabwe's regional network.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer>
                  <ReChartsBarChart data={regionalComplianceData} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} className="text-[10px]" />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="violations" name="Compliance Failures" fill="hsl(var(--destructive))" radius={4} />
                    <Bar dataKey="count" name="Total Applications" fill="hsl(var(--muted))" radius={4} />
                  </ReChartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card className="border-none bg-white/5 backdrop-blur-md shadow-2xl">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-center border-b border-white/10 pb-6">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileWarning className="h-5 w-5 text-primary" />
                  Compliance & Regulatory Registry
                </CardTitle>
                <CardDescription>Official register of compliance-specific risks and regulatory mandates.</CardDescription>
              </div>
              <Button className="bg-primary text-primary-foreground font-bold">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Record Compliance Item
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-black/20 hover:bg-black/20 border-white/10">
                      <TableHead className="pl-6 text-[10px] font-bold uppercase text-white/50">Item ID & Context</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50">Compliance Tier</TableHead>
                      <TableHead className="text-center text-[10px] font-bold uppercase text-white/50">L × I</TableHead>
                      <TableHead className="text-center text-[10px) font-bold uppercase text-white/50">Score</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50">Mitigation Strategy</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50">Owner</TableHead>
                      <TableHead className="pr-6 text-right text-[10px] font-bold uppercase text-white/50">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {risks.map((risk) => {
                      const score = risk.likelihood * risk.impact;
                      return (
                        <TableRow key={risk.id} className="border-white/5 hover:bg-white/5 text-[11px]">
                          <TableCell className="pl-6 py-4">
                            <div className="max-w-[200px]">
                              <p className="font-bold text-white uppercase tracking-tighter">{risk.id}</p>
                              <p className="text-white/60 leading-relaxed mt-1">{risk.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {risk.category === 'Compliance' ? <Scale className="h-3 w-3 text-white" /> : <Database className="h-3 w-3 text-accent" />}
                              <span className="font-semibold">{risk.category}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-mono">
                            {risk.likelihood} × {risk.impact}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={cn("text-lg font-black", getComplianceColor(score))}>
                              {score}
                            </span>
                          </TableCell>
                          <TableCell>
                            <p className="max-w-[250px] text-white/40 italic">{risk.mitigation}</p>
                          </TableCell>
                          <TableCell className="font-medium text-white/80">{risk.owner}</TableCell>
                          <TableCell className="pr-6 text-right">
                            <Badge variant={risk.status === 'Open' ? 'destructive' : 'success'} className="uppercase text-[9px] font-bold">
                              {risk.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
