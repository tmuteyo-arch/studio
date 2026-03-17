'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usersAtom, User, Role } from '@/lib/users';
import { applicationsAtom } from '@/lib/mock-data';
import { 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  UserCog,
  Search,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Edit2,
  Activity,
  Users,
  Shield,
  Fingerprint,
  Lock,
  EyeOff
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminDashboard({ user: adminUser }: { user: User }) {
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useAtom(usersAtom);
  const [applications] = useAtom(applicationsAtom);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  
  const [newUser, setNewUser] = React.useState({
    name: '',
    email: '',
    role: '' as Role,
    password: '',
  });

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const globalActivity = React.useMemo(() => {
    return applications.flatMap(app => 
      app.history.map(log => ({
        ...log,
        appId: app.id,
        clientName: app.clientName
      }))
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [applications]);

  const amlOversight = React.useMemo(() => {
    return {
      pending: applications.filter(a => ['Submitted', 'In Review', 'Pending Supervisor'].includes(a.status)).length,
      approved: applications.filter(a => a.status === 'Archived' || a.status === 'Signed').length,
      rejected: applications.filter(a => a.status === 'Rejected').length,
    };
  }, [applications]);

  const toggleUserStatus = (userId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'active' ? 'disabled' : 'active';
        toast({
          title: `User Access ${newStatus === 'active' ? 'Restored' : 'Revoked'}`,
          description: `${u.name} status updated in registry.`,
          variant: newStatus === 'active' ? 'default' : 'destructive'
        });
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const handleUpdateRole = (userId: string, newRole: Role) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        toast({
          title: "Access Level Updated",
          description: `${u.name} assigned to ${newRole.toUpperCase()} workspace.`,
        });
        return { ...u, role: newRole };
      }
      return u;
    }));
    setEditingUser(null);
  };

  const handleResetPassword = (userName: string) => {
    toast({
      title: "Security Reset Sent",
      description: `Instruction sent to ${userName}. Google Authenticator required.`,
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === adminUser.id) {
      toast({ variant: 'destructive', title: "Action Denied", description: "Self-deletion prohibited." });
      return;
    }
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    toast({ title: "User Purged", description: `${userName} removed from security registry.` });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) return;

    const initials = newUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const id = `${newUser.role}-${Date.now()}`;

    const createdUser: User = {
      id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      password: newUser.password,
      initials,
      status: 'active'
    };

    setAllUsers(prev => [...prev, createdUser]);
    setIsAddUserOpen(false);
    setNewUser({ name: '', email: '', role: '' as any, password: '' });
    toast({ title: "Account Provisioned", description: `${createdUser.name} active in ${createdUser.role} group.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            SECURITY & ACCESS CONTROL
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold">Admin Hub: Identity, Role, & Data Boundary Management</p>
        </div>
        
        <div className="flex gap-2">
            <Button variant="outline" className="border-white/10 text-white/70">
                <Fingerprint className="mr-2 h-4 w-4" />
                Security Audit
            </Button>
            <Button onClick={() => setIsAddUserOpen(true)} className="bg-primary text-primary-foreground font-bold shadow-lg">
                <UserPlus className="mr-2 h-4 w-4" />
                Provision Personnel
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20 lg:col-span-1">
            <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-primary font-bold">AML Pipeline Security</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-xs text-white/60">Active Queue</span><span className="font-bold">{amlOversight.pending}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs text-white/60">Finalized</span><span className="font-bold text-green-500">{amlOversight.approved}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs text-white/60">Declined</span><span className="font-bold text-destructive">{amlOversight.rejected}</span></div>
                </div>
            </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/10 lg:col-span-3">
            <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">System Control Summary</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1"><span className="text-[9px] uppercase font-bold text-white/40">Access</span><span className="text-xs font-semibold flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> Identity Validated</span></div>
                    <div className="flex flex-col gap-1"><span className="text-[9px] uppercase font-bold text-white/40">Roles</span><span className="text-xs font-semibold flex items-center gap-1"><Lock className="h-3 w-3 text-primary" /> Multi-Tier Active</span></div>
                    <div className="flex flex-col gap-1"><span className="text-[9px] uppercase font-bold text-white/40">Data Boundary</span><span className="text-xs font-semibold flex items-center gap-1"><EyeOff className="h-3 w-3 text-accent" /> Restricted View</span></div>
                    <div className="flex flex-col gap-1"><span className="text-[9px] uppercase font-bold text-white/40">Personnel</span><span className="text-xs font-semibold">{allUsers.length} Active Profiles</span></div>
                </div>
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="access" className="w-full">
        <TabsList className="bg-black/20 p-1 mb-6">
          <TabsTrigger value="access" className="flex items-center gap-2"><Users className="h-4 w-4" /> Identity Registry</TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2"><Activity className="h-4 w-4" /> System Oversight</TabsTrigger>
        </TabsList>

        <TabsContent value="access">
          <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md">
            <CardHeader className="border-b border-white/10 pb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <CardTitle>Personnel Access Management</CardTitle>
                <CardDescription>Grant workspace entry, assign roles, and manage system permissions.</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search name or workspace..." className="pl-9 bg-black/20 border-white/10 text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                    <TableHead className="pl-6 text-white/50 uppercase text-[10px] font-bold tracking-widest">Personnel Profile</TableHead>
                    <TableHead className="text-white/50 uppercase text-[10px] font-bold tracking-widest">Workspace / Role</TableHead>
                    <TableHead className="text-white/50 uppercase text-[10px] font-bold tracking-widest">Entry Permission</TableHead>
                    <TableHead className="pr-6 text-white/50 uppercase text-[10px] font-bold tracking-widest text-right">Security Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center font-bold text-primary">{u.initials}</div>
                          <div><p className="font-bold text-white">{u.name}</p><p className="text-xs text-white/40">{u.email}</p></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="uppercase text-[9px] font-bold tracking-widest border-white/10 text-white/70">{u.role.replace('-', ' ')}</Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-white/20 hover:text-primary" onClick={() => setEditingUser(u)}><Edit2 className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                            <Switch checked={u.status === 'active'} onCheckedChange={() => toggleUserStatus(u.id)} disabled={u.id === adminUser.id} />
                            {u.status === 'active' ? (
                                <span className="text-green-500 text-[10px] font-bold uppercase tracking-wider">Access Granted</span>
                            ) : (
                                <span className="text-destructive text-[10px] font-bold uppercase tracking-wider">Access Revoked</span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" title="Security Password Reset" onClick={() => handleResetPassword(u.name)}><KeyRound className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-destructive" title="Purge Identity" onClick={() => handleDeleteUser(u.id, u.name)} disabled={u.id === adminUser.id}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md">
            <CardHeader className="border-b border-white/10">
              <CardTitle>Security Oversight & Activity Monitoring</CardTitle>
              <CardDescription>Live telemetry of workspace interactions and AML pipeline events.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-black/20 border-white/5">
                      <TableHead className="pl-6 text-[10px] font-bold uppercase text-white/50">Timestamp</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50">Security Context (User)</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50">Action Logged</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50">Impacted Record</TableHead>
                      <TableHead className="pr-6 text-[10px] font-bold uppercase text-white/50">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {globalActivity.map((log, idx) => (
                      <TableRow key={idx} className="border-white/5 text-[11px] hover:bg-white/5">
                        <TableCell className="pl-6 text-white/40">{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="font-bold text-white">{log.user}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-[9px] uppercase font-bold">{log.action}</Badge></TableCell>
                        <TableCell><div><p className="font-medium text-white">{log.clientName}</p><p className="text-[9px] text-white/30">{log.appId}</p></div></TableCell>
                        <TableCell className="pr-6 text-white/60 italic max-w-[200px] truncate">{log.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Alert className="bg-primary/10 border-primary/20 text-primary">
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Admin Security Summary</AlertTitle>
        <AlertDescription className="text-[11px] leading-relaxed mt-1">
            <strong>System Safeguards Active:</strong> Access Control (Registry Monitoring) • User Profile Management • Role-Based Permissions (Workspace Isolation) • AML Approval Oversight • Data Privacy Boundaries.
        </AlertDescription>
      </Alert>

      {/* Workspace / Role Management Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="bg-card border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserCog className="h-5 w-5" /> Workspace Assignment</DialogTitle>
            <DialogDescription>Shift <strong>{editingUser?.name}</strong> to a different security tier or operational group.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-white/60">Functional Group (Role)</Label>
              <Select defaultValue={editingUser?.role} onValueChange={(v: Role) => editingUser && handleUpdateRole(editingUser.id, v)}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select Role..." /></SelectTrigger>
                <SelectContent className="bg-[#1e1b4b] border-white/10">
                  <SelectItem value="asl">Area Sales Leaders (Field Entry)</SelectItem>
                  <SelectItem value="back-office">Back Office Clerk (Verification)</SelectItem>
                  <SelectItem value="supervisor">Supervisor (Audit & Sign-off)</SelectItem>
                  <SelectItem value="management">MANAGEMENT (Business Reporting)</SelectItem>
                  <SelectItem value="admin">System Administrator (Security)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 rounded bg-white/5 border border-white/5 text-[10px] text-white/40 leading-relaxed">
                Notice: Role changes are immediate. Existing sessions will reflect new data boundaries on next operation.
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditingUser(null)} className="border-white/10 text-white">Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Provision User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="bg-card border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Identity Provisioning</DialogTitle>
            <DialogDescription>Create a new staff identity and assign initial workspace access.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-white/60">Full Name</Label>
              <Input placeholder="John Doe" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-white/60">Work Email</Label>
              <Input type="email" placeholder="name@inbucks.app" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-white/60">Temporary Password</Label>
              <Input type="password" placeholder="••••••••" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-white/60">Workspace Authorization</Label>
              <Select onValueChange={(v: Role) => setNewUser({...newUser, role: v})}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Pick group..." /></SelectTrigger>
                <SelectContent className="bg-[#1e1b4b] border-white/10">
                  <SelectItem value="asl">Area Sales Leaders</SelectItem>
                  <SelectItem value="back-office">Back Office Clerk</SelectItem>
                  <SelectItem value="supervisor">Back Office Supervisor</SelectItem>
                  <SelectItem value="management">MANAGEMENT</SelectItem>
                  <SelectItem value="admin">System Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full font-bold bg-primary text-primary-foreground">Generate Security Credentials</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
