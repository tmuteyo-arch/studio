'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Application, applicationsAtom, ApplicationStatus } from '@/lib/mock-data';
import { PlusCircle, Search, Inbox, UserCheck, User, Building2, Landmark, ChevronDown, X, Sparkles, FileEdit } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding/onboarding-flow';
import ApplicationReview from '../onboarding/application-review';
import { User as UserProfile } from '@/lib/users';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
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
    case 'Signed':
    case 'Archived':
      return 'success';
    case 'Pending Supervisor':
    case 'Sent to Supervisor':
    case 'In Review':
    case 'Sent to Back Office':
    case 'Claimed by ASL':
    case 'Approved by Compliance':
      return 'secondary';
    case 'Rejected':
    case 'Returned to ATL':
    case 'Returned to ASL':
    case 'Rejected by ASL':
      return 'destructive';
    case 'Draft':
      return 'outline';
    case 'Submitted':
      return 'outline';
    default:
      return 'outline';
  }
};

const translateStatus = (status: ApplicationStatus) => {
    switch (status) {
        case 'Submitted': return 'Sent';
        case 'In Review': return 'Checking';
        case 'Pending Supervisor': return 'Working';
        case 'Sent to Supervisor': return 'Awaiting Check';
        case 'Signed': return 'Done';
        case 'Rejected': return 'Rejected';
        case 'Returned to ATL': return 'Needs Fix';
        case 'Returned to ASL': return 'Needs Fix';
        case 'Archived': return 'Approved';
        case 'Sent to Back Office': return 'Sent to Office';
        case 'Claimed by ASL': return 'Taken';
        case 'Rejected by ASL': return 'Rejected';
        case 'Approved by Compliance': return 'Cleared';
        case 'Draft': return 'Draft';
        default: return status;
    }
}

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
    .filter(app => app.submittedBy === user.name && ['Draft', 'Submitted', 'Returned to ATL', 'Returned to ASL', 'Signed', 'Rejected', 'Pending Supervisor', 'Sent to Supervisor', 'Archived', 'Sent to Back Office', 'Claimed by ASL', 'Approved by Compliance'].includes(app.status))
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    
  const customerLeads = applications
    .filter(app => app.submittedBy === 'Customer' && ['Submitted', 'Rejected by ASL'].includes(app.status))
    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());

  const filteredApplications = myApplications.filter(app => {
    return app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
           app.clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredLeads = customerLeads.filter(app => {
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
                  <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Manage your records and leads.</p>
              </div>
              <Button 
                onClick={() => setIsNewAppMenuOpen(!isNewAppMenuOpen)}
                variant={isNewAppMenuOpen ? "outline" : "default"}
                className={`h-14 px-10 font-black shadow-2xl transition-all active:scale-95 text-lg rounded-xl border-2 ${isNewAppMenuOpen ? "border-white/20" : "border-primary/50 shadow-primary/20"}`}
              >
                {isNewAppMenuOpen ? <X className="mr-2 h-6 w-6" /> : <PlusCircle className="mr-2 h-6 w-6" />}
                {isNewAppMenuOpen ? "CANCEL" : "NEW APPLICATION"}
              </Button>
          </div>
          
          {isNewAppMenuOpen && (
            <Card className="border-primary/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 bg-white/5 backdrop-blur-2xl rounded-3xl">
                <CardHeader className="bg-primary/10 border-b border-white/5 pb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
                                <Sparkles className="h-4 w-4" /> START NEW
                            </CardTitle>
                            <CardDescription className="text-xs text-white/60 font-medium uppercase mt-1 tracking-widest">Choose a category to begin.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8 pb-10">
                    <div className="flex flex-wrap gap-6 justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-20 w-full sm:w-72 border-primary/20 bg-white/5 hover:bg-white/10 hover:border-primary/50 font-bold shadow-xl transition-all active:scale-95 rounded-2xl px-6">
                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-1">Type</p>
                                        <p className="text-lg text-white">PERSONAL</p>
                                    </div>
                                    <ChevronDown className="ml-2 h-5 w-5 opacity-30" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-72 bg-background/95 backdrop-blur-xl border-white/10 p-2 rounded-2xl shadow-2xl">
                                <DropdownMenuLabel className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-black px-4 py-3">Choose Type</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem className="cursor-pointer py-4 px-4 font-bold text-md rounded-xl hover:bg-primary hover:text-primary-foreground m-1 transition-colors" onClick={() => handleStartApplication('Individual Accounts')}>
                                    Individual
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer py-4 px-4 font-bold text-md rounded-xl hover:bg-primary hover:text-primary-foreground m-1 transition-colors" onClick={() => handleStartApplication('Sole Trader')}>
                                    Sole Trader
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-20 w-full sm:w-72 border-secondary/20 bg-white/5 hover:bg-white/10 hover:border-secondary/50 font-bold shadow-xl transition-all active:scale-95 rounded-2xl px-6">
                                    <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center mr-4">
                                        <Building2 className="h-5 w-5 text-secondary" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-1">Type</p>
                                        <p className="text-lg text-white">CORPORATE</p>
                                    </div>
                                    <ChevronDown className="ml-2 h-5 w-5 opacity-30" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-80 bg-background/95 backdrop-blur-xl border-white/10 p-2 rounded-2xl shadow-2xl">
                                <DropdownMenuLabel className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-black px-4 py-3">Choose Type</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <div className="max-h-[400px] overflow-y-auto">
                                    <DropdownMenuItem className="cursor-pointer py-4 px-4 font-bold rounded-xl hover:bg-secondary hover:text-white m-1 transition-colors" onClick={() => handleStartApplication('Private Limited (Pvt) Company')}>
                                        Pvt Ltd Company
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer py-4 px-4 font-bold rounded-xl hover:bg-secondary hover:text-white m-1 transition-colors" onClick={() => handleStartApplication('Private Business Corporate (PBC)')}>
                                        PBC Company
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer py-4 px-4 font-bold rounded-xl hover:bg-secondary hover:text-white m-1 transition-colors" onClick={() => handleStartApplication('Public Limited company')}>
                                        Public Company
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer py-4 px-4 font-bold rounded-xl hover:bg-secondary hover:text-white m-1 transition-colors" onClick={() => handleStartApplication('Partnerships')}>
                                        Partnership
                                    </DropdownMenuItem>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-20 w-full sm:w-72 border-accent/20 bg-white/5 hover:bg-white/10 hover:border-accent/50 font-bold shadow-xl transition-all active:scale-95 rounded-2xl px-6">
                                    <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center mr-4">
                                        <Landmark className="h-5 w-5 text-accent" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-1">Type</p>
                                        <p className="text-lg text-white">OTHER</p>
                                    </div>
                                    <ChevronDown className="ml-2 h-5 w-5 opacity-30" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-72 bg-background/95 backdrop-blur-xl border-white/10 p-2 rounded-2xl shadow-2xl">
                                <DropdownMenuLabel className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-black px-4 py-3">Choose Type</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem className="cursor-pointer py-4 px-4 font-bold rounded-xl hover:bg-accent hover:text-background m-1 transition-colors" onClick={() => handleStartApplication('NGO')}>
                                    NGO
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer py-4 px-4 font-bold rounded-xl hover:bg-accent hover:text-background m-1 transition-colors" onClick={() => handleStartApplication('Church')}>
                                    Church
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer py-4 px-4 font-bold rounded-xl hover:bg-accent hover:text-background m-1 transition-colors" onClick={() => handleStartApplication('School')}>
                                    School
                                </DropdownMenuItem>
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
                  <TabsTrigger value="my-apps" className="flex items-center gap-3 px-6 h-10 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase text-xs tracking-widest transition-all">
                      <UserCheck className="h-4 w-4" />
                      MY LIST ({filteredApplications.length})
                  </TabsTrigger>
                  <TabsTrigger value="leads" className="flex items-center gap-3 px-6 h-10 rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground font-black uppercase text-xs tracking-widest transition-all relative">
                      <Inbox className="h-4 w-4" />
                      LEADS ({filteredLeads.length})
                      {filteredLeads.length > 0 && <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse border-2 border-background" />}
                  </TabsTrigger>
              </TabsList>
              <div className="relative w-full sm:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                  <Input
                      placeholder="Search..."
                      className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary text-white placeholder:text-white/20 font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>

          <TabsContent value="my-apps" className="animate-in fade-in duration-500">
              <Card className="border-none shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md rounded-2xl">
                  <CardHeader className="bg-white/5 py-6 px-8 border-b border-white/5">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-black uppercase tracking-tight">Applications</CardTitle>
                        <Badge variant="outline" className="font-mono text-white/40 border-white/10 px-3">Live</Badge>
                      </div>
                  </CardHeader>
                  <CardContent className="p-0">
                      {filteredApplications.length > 0 ? (
                          <Table>
                              <TableHeader>
                                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                                      <TableHead className="pl-8 text-white/40 uppercase text-[10px] font-black tracking-widest">ID</TableHead>
                                      <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">NAME</TableHead>
                                      <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">STATUS</TableHead>
                                      <TableHead className="text-right pr-8 text-white/40 uppercase text-[10px] font-black tracking-widest">ACTION</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {filteredApplications.map((app) => (
                                      <TableRow key={app.id} className="hover:bg-white/5 border-white/5 transition-colors group">
                                          <TableCell className="font-mono text-xs pl-8 text-white/60 font-bold">{app.id}</TableCell>
                                          <TableCell className="py-5">
                                              <div className="font-black text-white text-md uppercase tracking-tight group-hover:text-primary transition-colors">{app.clientName}</div>
                                              <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1.5">{app.clientType}</div>
                                          </TableCell>
                                          <TableCell>
                                              <Badge variant={getStatusVariant(app.status)} className="px-3 py-1 uppercase text-[10px] font-black tracking-wider shadow-sm">{translateStatus(app.status)}</Badge>
                                          </TableCell>
                                          <TableCell className="text-right pr-8">
                                              <Button 
                                                variant={app.status === 'Draft' ? "default" : "outline"} 
                                                size="sm" 
                                                className="font-black uppercase tracking-widest h-9 transition-all active:scale-95 px-5 rounded-lg border-white/10" 
                                                onClick={() => app.status === 'Draft' ? handleContinueDraft(app) : setSelectedApplication(app)}
                                              >
                                                  {app.status === 'Draft' ? (
                                                    <><FileEdit className="mr-2 h-4 w-4" /> CONTINUE</>
                                                  ) : (app.status === 'Returned to ATL' || app.status === 'Returned to ASL' ? 'FIX' : 'VIEW')}
                                              </Button>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      ) : (
                          <div className="flex flex-col items-center justify-center p-24 text-center">
                              <UserCheck className="h-16 w-16 text-white/10 mb-4" />
                              <p className="text-white/40 font-black uppercase tracking-widest">List is empty.</p>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="leads" className="animate-in fade-in duration-500">
              <Card className="border-none bg-secondary/5 backdrop-blur-md shadow-2xl overflow-hidden rounded-2xl">
                  <CardHeader className="bg-secondary/10 py-6 px-8 border-b border-white/5">
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight text-white">
                            <Inbox className="h-6 w-6 text-secondary" />
                            NEW LEADS
                        </CardTitle>
                        <Badge variant="outline" className="font-mono border-secondary/30 text-secondary px-3 uppercase font-black">Sync Active</Badge>
                      </div>
                  </CardHeader>
                  <CardContent className="p-0">
                      {filteredLeads.length > 0 ? (
                          <Table>
                              <TableHeader>
                                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                                      <TableHead className="pl-8 text-white/40 uppercase text-[10px] font-black tracking-widest">REF</TableHead>
                                      <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">NAME</TableHead>
                                      <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">TYPE</TableHead>
                                      <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">STATUS</TableHead>
                                      <TableHead className="text-right pr-8 text-white/40 uppercase text-[10px] font-black tracking-widest">ACTION</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {filteredLeads.map((app) => (
                                      <TableRow key={app.id} className="hover:bg-secondary/10 border-white/5 transition-colors group">
                                          <TableCell className="font-mono text-xs pl-8 text-white/60 font-bold">{app.id}</TableCell>
                                          <TableCell className="py-5">
                                            <div className="font-black text-white uppercase tracking-tight group-hover:text-secondary transition-colors">{app.clientName}</div>
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant="outline" className="text-[10px] uppercase font-black tracking-tighter border-white/10 text-white/60">{app.clientType}</Badge>
                                          </TableCell>
                                          <TableCell>
                                              <Badge variant={getStatusVariant(app.status)} className="font-black uppercase text-[10px] tracking-widest px-3 py-1">{translateStatus(app.status)}</Badge>
                                          </TableCell>
                                          <TableCell className="text-right pr-8">
                                              <Button variant="default" size="sm" className="font-black uppercase tracking-widest h-9 bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all active:scale-95 px-6 rounded-lg shadow-lg" onClick={() => setSelectedApplication(app)}>PROCESS</Button>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      ) : (
                          <div className="flex flex-col items-center justify-center p-24 text-center">
                              <Inbox className="h-16 w-16 text-secondary/20 mb-4 animate-pulse" />
                              <p className="text-white/40 font-black uppercase tracking-widest">No leads found.</p>
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
