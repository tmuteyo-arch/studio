'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import { PlusCircle, Search, Star, Award, UserCheck, Inbox } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding/onboarding-flow';
import ApplicationReview from '../onboarding/application-review';
import { User } from '@/lib/users';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getStatusVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'Signed': return 'success';
    case 'Rejected': return 'destructive';
    default: return 'secondary';
  }
};

interface InnerCircleDashboardProps {
    user: User;
}

export default function InnerCircleDashboard({ user }: InnerCircleDashboardProps) {
  const [isCreatingApplication, setIsCreatingApplication] = React.useState(false);
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  const [applications] = useAtom(applicationsAtom);
  const [searchTerm, setSearchTerm] = React.useState('');

  const myApplications = applications
    .filter(app => app.submittedBy === user.name)
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    
  const vipLeads = applications
    .filter(app => app.submittedBy === 'Customer' && app.status === 'Submitted')
    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());

  const filteredApplications = myApplications.filter(app => 
    app.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const applicationForReview = selectedApplication 
      ? applications.find(app => app.id === selectedApplication.id) 
      : null;

  if (isCreatingApplication) {
    return <OnboardingFlow user={user} onCancel={() => setIsCreatingApplication(false)} />;
  }

  if (applicationForReview) {
    return <ApplicationReview application={applicationForReview} onBack={() => setSelectedApplication(null)} user={user} />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-black text-[#7c3aed] flex items-center gap-3">
                <Star className="fill-[#7c3aed]" />
                Inner Circle Portal
            </h2>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Premium Client Onboarding & White-Glove Service</p>
        </div>
        <Button onClick={() => setIsCreatingApplication(true)} className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold shadow-xl">
            <PlusCircle className="mr-2 h-4 w-4" />
            Onboard New VIP
        </Button>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="pipeline" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    VIP Pipeline ({filteredApplications.length})
                </TabsTrigger>
                <TabsTrigger value="referrals" className="flex items-center gap-2">
                    <Inbox className="h-4 w-4" />
                    New Referrals
                </TabsTrigger>
            </TabsList>
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search VIP Name..."
                    className="pl-10 border-[#7c3aed]/20 focus:ring-[#7c3aed]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <TabsContent value="pipeline">
            <Card className="border-[#7c3aed]/10 shadow-xl overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-[#7c3aed]/10 to-transparent">
                    <CardTitle>Premium Client List</CardTitle>
                    <CardDescription>Managed applications for Inner Circle members.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredApplications.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Application</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredApplications.map((app) => (
                                    <TableRow key={app.id} className="hover:bg-[#7c3aed]/5 transition-colors">
                                        <TableCell className="pl-6">
                                            <div className="font-bold text-[#1e1b4b]">{app.clientName}</div>
                                            <div className="text-[10px] font-mono text-muted-foreground">{app.id}</div>
                                        </TableCell>
                                        <TableCell className="text-xs uppercase font-semibold">{app.clientType}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(app.status)} className="shadow-sm">{app.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="outline" size="sm" className="border-[#7c3aed]/20 text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white" onClick={() => setSelectedApplication(app)}>Service Client</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-20 text-center text-muted-foreground font-medium">No VIP applications in your pipeline.</div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="referrals">
            <Card className="border-[#7c3aed]/20">
                <CardHeader>
                    <CardTitle>VIP Enquiries</CardTitle>
                    <CardDescription>Inbound premium requests awaiting concierge assignment.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 text-center text-muted-foreground">
                    <p>Referral system is currently clear. All VIP enquirers have been assigned.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
