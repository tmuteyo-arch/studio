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
  LayoutDashboard,
  Users,
  MousePointerClick
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDashboard({ user: adminUser }: { user: User }) {
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useAtom(usersAtom);
  const [applications] = useAtom(applicationsAtom);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Dialog States
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  
  // New User Form State
  const [newUser, setNewUser] = React.useState({
    name: '',
    email: '',
    role: '' as Role,
  });

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Monitoring & Oversight Logic: Flatten all application histories into a global feed
  const globalActivity = React.useMemo(() => {
    return applications.flatMap(app => 
      app.history.map(log => ({
        ...log,
        appId: app.id,
        clientName: app.clientName
      }))
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [applications]);

  // Workspace Statistics
  const workspaceStats = React.useMemo(() => {
    return {
      asl: allUsers.filter(u => u.role === 'asl').length,
      clerical: allUsers.filter(u => u.role === 'back-office').length,
      supervisory: allUsers.filter(u => u.role === 'supervisor').length,
      management: allUsers.filter(u => u.role === 'management').length,
    };
  }, [allUsers]);

  const toggleUserStatus = (userId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'active' ? 'disabled' : 'active';
        toast({
          title: `User ${newStatus === 'active' ? 'Enabled' : 'Disabled'}`,
          description: `Access for ${u.name} has been updated.`,
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
          title: "Workspace Assigned",
          description: `${u.name} is now moved to the ${newRole.toUpperCase()} workspace.`,
        });
        return { ...u, role: newRole };
      }
      return u;
    }));
    setEditingUser(null);
  };

  const handleResetPassword = (userName: string) => {
    toast({
      title: "Security Reset Request",
      description: `A security reset instruction has been sent to ${userName}.`,
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === adminUser.id) {
      toast({ variant: 'destructive', title: "Action Denied", description: "You cannot delete yourself." });
      return;
    }
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    toast({ title: "User Removed", description: `${userName} has been purged from the system.` });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.role) return;

    const initials = newUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const id = `${newUser.role}-${Date.now()}`;

    const createdUser: User = {
      id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      initials,
      status: 'active'
    };

    setAllUsers(prev => [...prev, createdUser]);
    setIsAddUserOpen(false);
    setNewUser({ name: '', email: '', role: '' as any });
    
    toast({
      title: "Account Created",
      description: `${createdUser.name} has been assigned to the ${createdUser.role} workspace.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <UserCog className="h-8 w-8 text-primary" />
            SYSTEM ADMINISTRATION
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold">Workspace Control, Personnel & System Oversight</p>
        </div>
        
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 transition-transform">
              <UserPlus className="mr-2 h-4 w-4" />
              Provision New Personnel
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Provision User Account</DialogTitle>
              <DialogDescription>Create a new staff identity and assign them to an initial workspace.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Full Name</Label>
                <Input id="new-name" placeholder="John Doe" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Work Email</Label>
                <Input id="new-email" type="email" placeholder="name@inbucks.app" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-role">Assigned Workspace</Label>
                <Select onValueChange={(v: Role) => setNewUser({...newUser, role: v})}>
                  <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Pick workspace..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asl">Area Sales Leaders (ASL)</SelectItem>
                    <SelectItem value="back-office">Back Office Clerk</SelectItem>
                    <SelectItem value="supervisor">Back Office Supervisor</SelectItem>
                    <SelectItem value="management">MANAGEMENT (Oversight)</SelectItem>
                    <SelectItem value="admin">System Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full font-bold">Generate Credentials</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/5 border-white/5">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">Total Personnel</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{allUsers.length}</div></CardContent>
        </Card>
        <Card className="bg-white/5 border-white/5">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">ASL Field Workspace</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-primary">{workspaceStats.asl}</div></CardContent>
        </Card>
        <Card className="bg-white/5 border-white/5">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">Clerical Workspace</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-accent">{workspaceStats.clerical}</div></CardContent>
        </Card>
        <Card className="bg-white/5 border-white/5">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold">Supervisory Group</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-secondary">{workspaceStats.supervisory}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personnel" className="w-full">
        <TabsList className="bg-black/20 p-1 mb-6">
          <TabsTrigger value="personnel" className="flex items-center gap-2"><Users className="h-4 w-4" /> Personnel Directory</TabsTrigger>
          <TabsTrigger value="oversight" className="flex items-center gap-2"><Activity className="h-4 w-4" /> System Oversight</TabsTrigger>
        </TabsList>

        <TabsContent value="personnel">
          <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md">
            <CardHeader className="border-b border-white/10 pb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <CardTitle>Workspace Access Control</CardTitle>
                <CardDescription>Assign roles and manage entry permissions for all staff.</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search staff or role..." className="pl-9 bg-black/20 border-white/10 text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                    <TableHead className="pl-6 text-white/50 uppercase text-[10px] font-bold tracking-widest">Identity</TableHead>
                    <TableHead className="text-white/50 uppercase text-[10px] font-bold tracking-widest">Active Workspace</TableHead>
                    <TableHead className="text-white/50 uppercase text-[10px] font-bold tracking-widest">Status</TableHead>
                    <TableHead className="text-white/50 uppercase text-[10px] font-bold tracking-widest text-center">Login Toggle</TableHead>
                    <TableHead className="pr-6 text-white/50 uppercase text-[10px] font-bold tracking-widest text-right">Actions</TableHead>
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
                        {u.status === 'active' ? (
                          <div className="flex items-center gap-1.5 text-green-500 text-[10px] font-bold uppercase"><CheckCircle2 className="h-3 w-3" /> Active</div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-destructive text-[10px] font-bold uppercase"><ShieldAlert className="h-3 w-3" /> Blocked</div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center"><Switch checked={u.status === 'active'} onCheckedChange={() => toggleUserStatus(u.id)} disabled={u.id === adminUser.id} /></div>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" title="Reset Credentials" onClick={() => handleResetPassword(u.name)}><KeyRound className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-destructive" title="Remove Account" onClick={() => handleDeleteUser(u.id, u.name)} disabled={u.id === adminUser.id}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oversight">
          <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md">
            <CardHeader className="border-b border-white/10">
              <CardTitle>System Activity Monitoring</CardTitle>
              <CardDescription>A live global feed of all user interactions and workspace events.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-black/20 border-white/5">
                      <TableHead className="pl-6 text-[10px] font-bold uppercase text-white/50">Timestamp</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50">Initiator (User)</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50">Action Taken</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50">Impacted Record</TableHead>
                      <TableHead className="pr-6 text-[10px] font-bold uppercase text-white/50">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {globalActivity.map((log, idx) => (
                      <TableRow key={idx} className="border-white/5 text-[11px] hover:bg-white/5">
                        <TableCell className="pl-6 text-white/40">{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="font-bold text-white">{log.user}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-[9px] uppercase">{log.action}</Badge></TableCell>
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
      
      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <p className="text-xs text-primary font-medium leading-tight">
          <strong>Boundary Enforcement:</strong> All workspace movements are logged. Reassigning a role immediately shifts the user's operational context. Ensure users are placed in the correct group to prevent data leaks.
        </p>
      </div>

      {/* Workspace Management Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="bg-card border-white/10 text-white">
          <DialogHeader><DialogTitle>Workspace Assignment</DialogTitle><DialogDescription>Reassign <strong>{editingUser?.name}</strong> to a different functional workspace.</DialogDescription></DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label>Select Workspace (Group)</Label>
              <Select defaultValue={editingUser?.role} onValueChange={(v: Role) => editingUser && handleUpdateRole(editingUser.id, v)}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Choose Role..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asl">Area Sales Leaders (ASL)</SelectItem>
                  <SelectItem value="back-office">Back Office Clerk</SelectItem>
                  <SelectItem value="supervisor">Back Office Supervisor</SelectItem>
                  <SelectItem value="management">MANAGEMENT (Oversight)</SelectItem>
                  <SelectItem value="admin">System Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
