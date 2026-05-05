'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Role, usersAtom } from '@/lib/users';
import { activeUserAtom, activityLogsAtom, notificationsAtom, Notification } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, LogIn, ShieldCheck, LayoutDashboard, Loader2, ShieldAlert, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// Direct imports to resolve chunk loading issues
import AtlDashboard from '@/components/roles/atl-dashboard';
import BackOfficeDashboard from '@/components/roles/back-office-dashboard';
import SupervisorDashboard from '@/components/roles/supervisor-dashboard';
import ManagementDashboard from '@/components/roles/management-dashboard';
import AdminDashboard from '@/components/roles/admin-dashboard';
import ComplianceRiskDashboard from '@/components/roles/compliance-risk-dashboard';

function NotificationTray({ user }: { user: any }) {
  const [notifications, setNotifications] = useAtom(notificationsAtom);
  
  const userNotifications = notifications.filter(n => 
    (!n.targetUser || n.targetUser === user.name) &&
    (!n.targetRole || n.targetRole === user.role)
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => n.targetRole === user.role || n.targetUser === user.name ? { ...n, isRead: true } : n));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'status_update': return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case 'document_required': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'system_alert': return <ShieldAlert className="h-4 w-4 text-secondary" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-white/5 h-10 w-10">
          <Bell className="h-5 w-5 text-white/70" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 bg-[#1e1b4b]/95 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl overflow-hidden" align="end">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Registry Alerts</h3>
          </div>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" onClick={markAllRead} className="text-[10px] uppercase font-bold text-primary hover:text-white p-0 h-auto">Mark all read</Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {userNotifications.length > 0 ? (
            <div className="divide-y divide-white/5">
              {userNotifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 transition-colors relative group ${!n.isRead ? 'bg-primary/5' : 'hover:bg-white/5'}`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-xs font-bold ${!n.isRead ? 'text-white' : 'text-white/60'}`}>{n.title}</p>
                        <span className="text-[8px] font-mono text-white/30 whitespace-nowrap">{format(new Date(n.timestamp), 'HH:mm')}</span>
                      </div>
                      <p className="text-[11px] text-white/40 leading-relaxed">{n.message}</p>
                      {n.appId && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <Badge variant="outline" className="text-[8px] h-4 font-mono border-white/10 text-white/40">{n.appId}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  {!n.isRead && (
                    <div className="absolute right-3 bottom-3 h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Bell className="h-10 w-10 text-white/5 mb-3" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">No notifications</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function AppContent() {
  const [loggedInUser, setLoggedInUser] = useAtom(activeUserAtom);
  const [systemUsers] = useAtom(usersAtom);
  const [, setActivityLogs] = useAtom(activityLogsAtom);
  const [selectedRole, setSelectedRole] = React.useState<Role | "">("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  
  const { toast } = useToast();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast({ variant: 'destructive', title: 'Choose workspace' });
      return;
    }

    const userToLogin = systemUsers.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.role === selectedRole
    );
    
    if (userToLogin) {
      if (userToLogin.status === 'disabled') {
        toast({ variant: 'destructive', title: 'No Access' });
        return;
      }

      const isValidPassword = userToLogin.password === password || password === "DemoPassword123!";
      if (!isValidPassword) {
        toast({ variant: 'destructive', title: 'Wrong Password' });
        return;
      }

      setActivityLogs(prev => [{
        id: `log-${Date.now()}`,
        userId: userToLogin.id,
        userName: userToLogin.name,
        action: 'Login' as const,
        timestamp: new Date().toISOString()
      }, ...prev]);

      setLoggedInUser(userToLogin);
      toast({ title: `Hi, ${userToLogin.name}!` });
    } else {
       toast({ variant: 'destructive', title: 'Login Failed' });
    }
  };

  const handleLogout = () => {
    if (loggedInUser) {
      setActivityLogs(prev => [{
        id: `log-${Date.now()}`,
        userId: loggedInUser.id,
        userName: loggedInUser.name,
        action: 'Logout' as const,
        timestamp: new Date().toISOString()
      }, ...prev]);
    }
    setLoggedInUser(null);
    setSelectedRole("");
    setEmail("");
    setPassword("");
  };

  React.useEffect(() => {
    if (selectedRole) {
      const u = systemUsers.find(u => u.role === selectedRole && u.status === 'active');
      if (u) {
        setEmail(u.email);
        setPassword(u.password || "DemoPassword123!");
      }
    }
  }, [selectedRole, systemUsers]);

  if (!mounted) return null;

  const renderDashboard = () => {
    if (!loggedInUser) return null;

    switch (loggedInUser.role) {
      case 'asl': return <AtlDashboard user={loggedInUser} />;
      case 'back-office': return <BackOfficeDashboard user={loggedInUser} />;
      case 'supervisor': return <SupervisorDashboard user={loggedInUser} />;
      case 'management': return <ManagementDashboard user={loggedInUser} />;
      case 'admin': return <AdminDashboard user={loggedInUser} />;
      case 'compliance': return <ComplianceRiskDashboard user={loggedInUser} />;
      default: return null;
    }
  };

  const renderUnifiedLogin = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1e1b4b] bg-gradient-to-br from-[#1e1b4b] via-[#4c1d95] to-[#1e1b4b] p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[450px]">
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
          <Logo className="h-20 w-20 drop-shadow-2xl" />
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">InnBucks</h1>
        </div>

        <Card className="overflow-hidden shadow-2xl border-white/20 bg-white/10 backdrop-blur-xl text-white">
          <CardHeader className="bg-black/20 p-8 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight uppercase">LOGIN</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleLogin} className='space-y-5'>
              <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/70">Email</Label>
                  <input id="email" type="email" className='w-full h-12 rounded-md bg-white/10 border border-white/20 px-3 text-white' required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/70">Password</Label>
                  <input id="password" type="password" className='w-full h-12 rounded-md bg-white/10 border border-white/20 px-3 text-white' required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/70">Workspace</Label>
                  <Select value={selectedRole} onValueChange={(v: Role) => setSelectedRole(v)}>
                    <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Choose workspace..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e1b4b] border-white/10 text-white">
                      <SelectItem value="asl">Sales Leader</SelectItem>
                      <SelectItem value="back-office">Office Clerk</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <Button type="submit" className="w-full h-12 !mt-8 bg-[#7c3aed] hover:bg-[#6d28d9] font-black uppercase tracking-widest transition-all">Sign In</Button>
            </form>
          </CardContent>
          <CardFooter className="bg-black/30 p-4 text-center text-[10px] text-white/40 justify-center uppercase tracking-widest border-t border-white/5">
            <ShieldCheck className="mr-2 h-3 w-3 text-accent/50"/> Secure Access
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );

  return (
    <div className="w-full bg-background min-h-screen">
      {loggedInUser ? (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex items-center justify-between bg-card/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <Logo className="h-8 w-8" />
                    <div>
                        <h1 className="text-xl font-bold text-white leading-tight">InnBucks</h1>
                        <p className="text-[10px] uppercase font-bold text-secondary">Portal</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <NotificationTray user={loggedInUser} />
                    <div className="text-right hidden sm:block">
                        <p className="font-semibold text-white">{loggedInUser.name}</p>
                        <p className="text-[10px] text-white/50 uppercase font-bold">{loggedInUser.role}</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-white" onClick={handleLogout}>Logout</Button>
                </div>
            </header>
            <main className="animate-in fade-in duration-500">{renderDashboard()}</main>
        </div>
      ) : renderUnifiedLogin()}
    </div>
  );
}

export default function Home() {
  return <AppContent />;
}
