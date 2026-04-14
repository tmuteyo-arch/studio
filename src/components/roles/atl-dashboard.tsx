'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import { PlusCircle, Search, Inbox, UserCheck, User, Building2, Landmark, ChevronDown, X, Sparkles, FileEdit, Eye } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding/onboarding-flow';
import ApplicationReview from '../onboarding/application-review';
import { User as UserProfile } from '@/lib/users';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getStateLabel } from '@/lib/state-machine';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getStatusVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'Locked':
    case 'Dispatched':
    case 'Approved':
      return 'success';
    case 'Under Review':
    case 'Pending Documents':
    case 'In Progress':
      return 'secondary';
    case 'Rejected':
      return 'destructive';
    case 'Draft':
      return 'outline';
    default:
      return 'outline';
  }
};

interface AtlDashboardProps {
    user: UserProfile;
}

export default function AtlDashboard({ user }: AtlDashboardProps) {
  const [isCreatingApplication, setIsCreatingApplication] = React.useState(false);
  const [preselectedType, setPreselectedType] = React.useState<string | null>(null);
  const [draftToEdit, setDraftToEdit] = React.useState<Application | null>(null);
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  const [applications] = useAtom(applicationsAtom);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isNewAppMenuOpen, setIsNewAppMenuOpen] = React.useState(false);

  const myApplications = applications
    .filter(app => app.submittedBy === user.name)
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    
  const customerSubmissions = applications
    .filter(app => app.submittedBy === 'Customer' && (app.status === 'Draft' || app.status === 'In Progress'))
    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());

  const filteredApplications = myApplications.filter(app => {
    return app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
           app.clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredSubmissions = customerSubmissions.filter(app => {
    return app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
           app.clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleStartApplication = (type: string) => {
    setDraftToEdit(null);
    setPreselectedType(type);
    setIsCreatingApplication(true);
    setIsNewAppMenuOpen(false);
  };

  const handleContinueDraft = (app: Application) => {
    setDraftToEdit(app);
    setIsCreatingApplication(true);
  };

  const applicationForReview = selectedApplication 
      ? applications.find(app => app.id === selectedApplication.id) 
      : null;

  if (isCreatingApplication) {
    return <OnboardingFlow 
              user={user} 
              onCancel={() => { setIsCreatingApplication(false); setPreselectedType(null); setDraftToEdit(null); }} 
              preselectedType={preselectedType} 
              existingApplication={draftToEdit}
            />;
  }

  if (applicationForReview) {
    return <ApplicationReview 
                application={applicationForReview} 
                onBack={() => setSelectedApplication(null)} 
                user={user}
            />;
  }

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 border-b border-white/5 pb-8">
              <div>
                  <h2 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
                    <User className="h-10 w-10 text-primary" />
                    Sales Dashboard
                  </h2>
                  <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Manage your lifecycle records and submissions.</p>
              </div>
              <Button 
                onClick={() => setIsNewAppMenuOpen(!isNewAppMenuOpen)}
                className="h-14 px-10 font-black shadow-2xl transition-all active:scale-95 text-lg rounded-xl border-2"
              >
                {isNewAppMenuOpen ? <X className="mr-2 h-6 w-6" /> : <PlusCircle className="mr-2 h-6 w-6" />}
                {isNewAppMenuOpen ? "CANCEL" : "NEW APPLICATION"}
              </Button>
          </div>
          
          {isNewAppMenuOpen && (
            <Card className="border-primary/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 bg-white/5 backdrop-blur-2xl rounded-3xl">
                <CardHeader className="bg-primary/10 border-b border-white/5 pb-6">
                    <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
                        <Sparkles className="h-4 w-4" /> START NEW
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 pb-10">
                    <div className="flex flex-wrap gap-6 justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-20 w-full sm:w-72 border-primary/20 bg-white/5 font-bold shadow-xl rounded-2xl px-6">
                                    <User className="h-5 w-5 text-primary mr-4" />
                                    <div className="text-left flex-1">
                                        <p className="text-[10px] uppercase text-white/40 font-black mb-1">Class</p>
                                        <p className="text-lg text-white">PERSONAL</p>
                                    </div>
                                    <ChevronDown className="ml-2 h-5 w-5 opacity-30" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-72 bg-background/95 backdrop-blur-xl border-white/10 p-2 rounded-2xl">
                                <DropdownMenuItem className="py-4 px-4 font-bold" onClick={() => handleStartApplication('Individual Accounts')}>Individual</DropdownMenuItem>
                                <DropdownMenuItem className="py-4 px-4 font-bold" onClick={() => handleStartApplication('Sole Trader')}>Sole Trader</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-20 w-full sm:w-72 border-secondary/20 bg-white/5 font-bold shadow-xl rounded-2xl px-6">
                                    <Building2 className="h-5 w-5 text-secondary mr-4" />
                                    <div className="text-left flex-1">
                                        <p className="text-[10px] uppercase text-white/40 font-black mb-1">Class</p>
                                        <p className="text-lg text-white">CORPORATE</p>
                                    </div>
                                    <ChevronDown className="ml-2 h-5 w-5 opacity-30" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-80 bg-background/95 backdrop-blur-xl border-white/10 p-2 rounded-2xl">
                                <DropdownMenuItem className="py-4 px-4 font-bold" onClick={() => handleStartApplication('Private Limited (Pvt) Company')}>Pvt Ltd Company</DropdownMenuItem>
                                <DropdownMenuItem className="py-4 px-4 font-bold" onClick={() => handleStartApplication('Private Business Corporate (PBC)')}>PBC Company</DropdownMenuItem>
                                <DropdownMenuItem className="py-4 px-4 font-bold" onClick={() => handleStartApplication('Public Limited company')}>Public Company</DropdownMenuItem>
                                <DropdownMenuItem className="py-4 px-4 font-bold" onClick={() => handleStartApplication('Partnerships')}>Partnership</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="my-apps" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6">
              <TabsList className="bg-white/5 p-1.5 rounded-xl border border-white/5">
                  <TabsTrigger value="my-apps" className="flex items-center gap-3 px-6 h-10 font-black uppercase text-xs tracking-widest">
                      <UserCheck className="h-4 w-4" />
                      MY PIPELINE ({filteredApplications.length})
                  </TabsTrigger>
                  <TabsTrigger value="leads" className="flex items-center gap-3 px-6 h-10 font-black uppercase text-xs tracking-widest relative">
                      <Inbox className="h-4 w-4" />
                      SUBMISSIONS ({filteredSubmissions.length})
                  </TabsTrigger>
              </TabsList>
              <div className="relative w-full sm:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                  <Input placeholder="Search..." className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
          </div>

          <TabsContent value="my-apps" className="animate-in fade-in duration-500">
              <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-2xl">
                  <CardHeader className="bg-white/5 py-6 px-8 border-b border-white/5">
                      <CardTitle className="text-xl font-black uppercase">My Applications</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                      {filteredApplications.length > 0 ? (
                          <Table>
                              <TableHeader>
                                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                                      <TableHead className="pl-8 text-white/40 uppercase text-[10px] font-black">ID</TableHead>
                                      <TableHead className="text-white/40 uppercase text-[10px] font-black">CLIENT</TableHead>
                                      <TableHead className="text-white/40 uppercase text-[10px] font-black">LIFECYCLE STATE</TableHead>
                                      <TableHead className="text-right pr-8 text-white/40 uppercase text-[10px] font-black">ACTION</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {filteredApplications.map((app) => (
                                      <TableRow key={app.id} className="hover:bg-white/5 border-white/5 group">
                                          <TableCell className="font-mono text-xs pl-8 text-white/60 font-bold">{app.id}</TableCell>
                                          <TableCell className="py-5">
                                              <div className="font-black text-white text-md uppercase group-hover:text-primary">{app.clientName}</div>
                                              <div className="text-[10px] text-white/40 uppercase font-black mt-1.5">{app.clientType}</div>
                                          </TableCell>
                                          <TableCell>
                                              <Badge variant={getStatusVariant(app.status)} className="px-3 py-1 uppercase text-[10px] font-black">{getStateLabel(app.status)}</Badge>
                                          </TableCell>
                                          <TableCell className="text-right pr-8">
                                              {['Draft', 'Pending Documents', 'In Progress'].includes(app.status) ? (
                                                <Button variant="default" size="sm" className="font-black uppercase tracking-widest px-5 rounded-lg" onClick={() => handleContinueDraft(app)}>
                                                  <><FileEdit className="mr-2 h-4 w-4" /> CONTINUE</>
                                                </Button>
                                              ) : (
                                                <Button variant="outline" size="sm" className="font-black uppercase tracking-widest px-5 rounded-lg" onClick={() => setSelectedApplication(app)}>
                                                  <><Eye className="mr-2 h-4 w-4" /> VIEW</>
                                                </Button>
                                              )}
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      ) : (
                          <div className="flex flex-col items-center justify-center p-24 text-center">
                              <UserCheck className="h-16 w-16 text-white/10 mb-4" />
                              <p className="text-white/40 font-black uppercase tracking-widest">Pipeline is empty.</p>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="leads" className="animate-in fade-in duration-500">
              <Card className="border-none bg-secondary/5 backdrop-blur-md shadow-2xl rounded-2xl">
                  <CardHeader className="bg-secondary/10 py-6 px-8 border-b border-white/5">
                      <CardTitle className="flex items-center gap-3 text-xl font-black uppercase">
                          <Inbox className="h-6 w-6 text-secondary" />
                          Customer Submissions
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                      {filteredSubmissions.length > 0 ? (
                          <Table>
                              <TableHeader>
                                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                                      <TableHead className="pl-8 text-white/40 uppercase text-[10px] font-black">REF</TableHead>
                                      <TableHead className="text-white/40 uppercase text-[10px] font-black">NAME</TableHead>
                                      <TableHead className="text-white/40 uppercase text-[10px] font-black">STATUS</TableHead>
                                      <TableHead className="text-right pr-8 text-white/40 uppercase text-[10px] font-black">ACTION</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {filteredSubmissions.map((app) => (
                                      <TableRow key={app.id} className="hover:bg-secondary/10 border-white/5 transition-colors group">
                                          <TableCell className="font-mono text-xs pl-8 text-white/60 font-bold">{app.id}</TableCell>
                                          <TableCell className="py-5 font-black text-white uppercase">{app.clientName}</TableCell>
                                          <TableCell>
                                              <Badge variant={getStatusVariant(app.status)} className="font-black uppercase text-[10px]">{getStateLabel(app.status)}</Badge>
                                          </TableCell>
                                          <TableCell className="text-right pr-8">
                                              <Button variant="default" size="sm" className="font-black uppercase tracking-widest bg-secondary text-secondary-foreground px-6 rounded-lg shadow-lg" onClick={() => setSelectedApplication(app)}>PROCESS</Button>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      ) : (
                          <div className="flex flex-col items-center justify-center p-24 text-center">
                              <Inbox className="h-16 w-16 text-secondary/20 mb-4 animate-pulse" />
                              <p className="text-white/40 font-black uppercase tracking-widest">No new submissions.</p>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
