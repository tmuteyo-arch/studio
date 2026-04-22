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
  EyeOff,
  Mail,
  User as UserIcon
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

  const toggleUserStatus = (userId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'active' ? 'disabled' : 'active';
        toast({
          title: `${newStatus === 'active' ? 'Enabled' : 'Disabled'}`,
          description: `${u.name} access updated.`,
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
          title: "Role Updated",
          description: `${u.name} is now ${newRole}.`,
        });
        return { ...u, role: newRole };
      }
      return u;
    }));
    setEditingUser(null);
  };

  const handleResetPassword = (userName: string) => {
    toast({
      title: "Reset Link Sent",
      description: `Instruction sent to ${userName}'s email.`,
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === adminUser.id) {
      toast({ variant: 'destructive', title: "Action Blocked", description: "You cannot remove your own admin account." });
      return;
    }
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    toast({ title: "User Removed", description: `${userName} has been deleted from the registry.` });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) {
        toast({ variant: 'destructive', title: "Incomplete Form", description: "Please fill in all staff details." });
        return;
    }

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
    toast({ title: "Success", description: `${createdUser.name} has been added to the ${newUser.role} workspace.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            ADMIN PANEL
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold">Manage system access and staff identities.</p>
        </div>
        
        <div className="flex gap-2">
            <Button onClick={() => setIsAddUserOpen(true)} className="h-12 bg-primary text-primary-foreground font-black px-6 shadow-lg rounded-xl">
                <UserPlus className="mr-2 h-5 w-5" />
                ADD NEW STAFF
            </Button>
        </div>
      </div>

      <Tabs defaultValue="access" className="w-full">
        <TabsList className="bg-black/20 p-1.5 mb-6 rounded-xl border border-white/5">
          <TabsTrigger value="access" className="flex items-center gap-2 h-10 px-6 font-bold"><Users className="h-4 w-4" /> Staff Registry</TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2 h-10 px-6 font-bold"><Activity className="h-4 w-4" /> System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="access" className="animate-in fade-in duration-500">
          <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-white/10 pb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <CardTitle className="text-xl font-black uppercase">Staff Access Control</CardTitle>
                <CardDescription className="text-white/40">Manage workforce identities and workspace permissions.</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search name or role..." className="pl-9 bg-black/20 border-white/10 text-white h-10 rounded-xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                    <TableHead className="pl-8 text-white/50 uppercase text-[10px] font-bold tracking-widest">Employee</TableHead>
                    <TableHead className="text-white/50 uppercase text-[10px] font-bold tracking-widest">Role / Workspace</TableHead>
                    <TableHead className="text-white/50 uppercase text-[10px] font-bold tracking-widest">Account Status</TableHead>
                    <TableHead className="pr-8 text-white/50 uppercase text-[10px] font-bold tracking-widest text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="pl-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center font-black text-primary text-xs shadow-inner">{u.initials}</div>
                          <div>
                            <p className="font-black text-white uppercase tracking-tight">{u.name}</p>
                            <p className="text-xs text-white/30 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="uppercase text-[9px] font-black tracking-widest py-1 px-3 border-white/10 bg-white/5 text-white/70">
                            {u.role.replace('-', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                            <Switch checked={u.status === 'active'} onCheckedChange={() => toggleUserStatus(u.id)} disabled={u.id === adminUser.id} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${u.status === 'active' ? 'text-green-500' : 'text-destructive'}`}>
                                {u.status === 'active' ? 'ACTIVE' : 'DISABLED'}
                            </span>
                        </div>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-white/40 hover:text-primary transition-colors" title="Reset Password" onClick={() => handleResetPassword(u.name)}>
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-white/40 hover:text-destructive transition-colors" title="Delete User" onClick={() => handleDeleteUser(u.id, u.name)} disabled={u.id === adminUser.id}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="animate-in fade-in duration-500">
          <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-xl font-black uppercase">Technical Audit Log</CardTitle>
              <CardDescription className="text-white/40">Real-time system events and staff actions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-black/20 border-white/5">
                      <TableHead className="pl-8 text-[10px] font-bold uppercase text-white/50 tracking-widest">Timestamp</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50 tracking-widest">Member</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50 tracking-widest">Event</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50 tracking-widest">Registry Reference</TableHead>
                      <TableHead className="pr-8 text-[10px] font-bold uppercase text-white/50 tracking-widest">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {globalActivity.map((log, idx) => (
                      <TableRow key={idx} className="border-white/5 text-[11px] hover:bg-white/5 transition-colors">
                        <TableCell className="pl-8 text-white/40 font-mono">{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="font-bold text-white uppercase">{log.user}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5">{log.action}</Badge></TableCell>
                        <TableCell>
                            <div>
                                <p className="font-bold text-white/70 uppercase">{log.clientName}</p>
                                <p className="text-[9px] text-white/20 font-mono">{log.appId}</p>
                            </div>
                        </TableCell>
                        <TableCell className="pr-8 text-white/60 italic max-w-[250px] truncate">{log.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Staff Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="bg-[#1e1b4b] border-white/10 text-white rounded-3xl shadow-2xl max-w-md">
            <DialogHeader className="p-2">
                <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-primary">
                    <UserPlus className="h-6 w-6" /> Staff Onboarding
                </DialogTitle>
                <DialogDescription className="text-white/50 mt-1">Create a new organizational identity and assign a workspace.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-6 py-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Full Name</Label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <Input 
                                placeholder="e.g. John Madondo" 
                                className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl font-bold"
                                value={newUser.name}
                                onChange={e => setNewUser({...newUser, name: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Work Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <Input 
                                type="email"
                                placeholder="name@inbucks.app" 
                                className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl font-mono"
                                value={newUser.email}
                                onChange={e => setNewUser({...newUser, email: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Workspace Role</Label>
                            <Select onValueChange={(v: Role) => setNewUser({...newUser, role: v})}>
                                <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl font-bold">
                                    <SelectValue placeholder="Select workspace..." />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="asl" className="font-bold py-3">Sales Leader (ASL)</SelectItem>
                                    <SelectItem value="back-office" className="font-bold py-3">Office Clerk</SelectItem>
                                    <SelectItem value="supervisor" className="font-bold py-3">Supervisor</SelectItem>
                                    <SelectItem value="management" className="font-bold py-3">Management</SelectItem>
                                    <SelectItem value="compliance" className="font-bold py-3">Compliance Officer</SelectItem>
                                    <SelectItem value="admin" className="font-bold py-3">System Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Temporary Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <Input 
                                type="text"
                                placeholder="Min 8 chars..." 
                                className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl font-mono"
                                value={newUser.password}
                                onChange={e => setNewUser({...newUser, password: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter className="pt-4 gap-3 sm:flex-col">
                    <Button type="submit" className="w-full h-12 bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm rounded-xl shadow-xl transition-all active:scale-95">
                        CREATE ACCOUNT
                    </Button>
                    <Button variant="ghost" type="button" onClick={() => setIsAddUserOpen(false)} className="w-full text-white/40 font-bold hover:text-white">
                        CANCEL
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
