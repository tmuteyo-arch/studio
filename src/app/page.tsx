
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import AtlDashboard from '@/components/roles/atl-dashboard';
import BackOfficeDashboard from '@/components/roles/back-office-dashboard';
import SupervisorDashboard from '@/components/roles/supervisor-dashboard';
import RetailExecutiveDashboard from '@/components/roles/retail-executive-dashboard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { users, Role } from '@/lib/users';
import { activeUserAtom } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Mail, Lock, LogIn, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

function AppContent() {
  const [loggedInUser, setLoggedInUser] = useAtom(activeUserAtom);
  const [selectedRole, setSelectedRole] = React.useState<Role | "">("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("password");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast({
        variant: 'destructive',
        title: 'Selection Required',
        description: 'Please select a designated dashboard to enter.',
      });
      return;
    }

    // In this mock, we find the first user matching the role
    const userToLogin = users.find(u => u.role === selectedRole);
    
    if (userToLogin) {
      setLoggedInUser(userToLogin);
      toast({
        title: `Welcome, ${userToLogin.name}!`,
        description: `Access granted to the ${userToLogin.role.replace('-', ' ')} portal.`,
      });
    } else {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: `Credentials invalid or role not found.`,
      });
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setSelectedRole("");
    setEmail("");
  };

  // Sync email when role changes for easy demoing
  React.useEffect(() => {
    if (selectedRole) {
      const u = users.find(u => u.role === selectedRole);
      if (u) setEmail(u.email);
    }
  }, [selectedRole]);

  const renderDashboard = () => {
    if (!loggedInUser) return null;

    switch (loggedInUser.role) {
      case 'atl':
        return <AtlDashboard user={loggedInUser} />;
      case 'back-office':
        return <BackOfficeDashboard user={loggedInUser} />;
      case 'supervisor':
        return <SupervisorDashboard user={loggedInUser} />;
      case 'retail-executive':
        return <RetailExecutiveDashboard user={loggedInUser} />;
      default:
        return null;
    }
  };

  const renderUnifiedLogin = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#4c1d95] bg-gradient-to-br from-[#1e1b4b] via-[#7c3aed] to-[#1e1b4b] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[450px]"
      >
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
          <Logo className="h-20 w-20 drop-shadow-2xl" />
          <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-white">InnBucks</h1>
              <p className="text-white font-bold tracking-[0.2em] text-[10px] uppercase opacity-80">Agent Onboarding System</p>
          </div>
        </div>

        <Card className="overflow-hidden shadow-2xl border-white/20 bg-white/10 backdrop-blur-xl text-white">
          <CardHeader className="bg-black/20 p-8 text-center border-b border-white/10">
              <CardTitle className="text-2xl font-bold">Secure Sign In</CardTitle>
              <CardDescription className="text-white/60">Enter your credentials and select your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleLogin} className='space-y-5'>
              <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-2" htmlFor="email">
                    <Mail className="h-3 w-3" /> Email Address / Username
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@inbucks.app" 
                    className='h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:ring-secondary focus:border-secondary' 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
              </div>
              <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-2" htmlFor="password">
                    <Lock className="h-3 w-3" /> Password
                  </Label>
                  <Input 
                    id="password" 
                    type="password" 
                    className='h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:ring-secondary focus:border-secondary' 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
              </div>
              <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-2" htmlFor="role">
                    <LayoutDashboard className="h-3 w-3" /> Designated Dashboard
                  </Label>
                  <Select value={selectedRole} onValueChange={(v: Role) => setSelectedRole(v)}>
                    <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white focus:ring-secondary">
                      <SelectValue placeholder="Search or select dashboard..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e1b4b] border-white/20 text-white">
                      <SelectItem value="atl">Area Team Leaders (ATL)</SelectItem>
                      <SelectItem value="back-office">Back Office Operations</SelectItem>
                      <SelectItem value="supervisor">Regulatory Supervisor</SelectItem>
                      <SelectItem value="retail-executive">Retail Executive</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              
              <Button type="submit" className="w-full h-12 !mt-8 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold shadow-xl border-t border-white/20 transition-all active:scale-[0.98]">
                <LogIn className="mr-2 h-5 w-5"/> Sign Into Portal
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-black/30 p-4 text-center text-[10px] text-white/40 justify-center uppercase tracking-widest border-t border-white/5">
            <ShieldCheck className="mr-2 h-3 w-3 text-accent/50"/> End-to-End Encrypted Session
          </CardFooter>
        </Card>
        
        <p className="mt-12 text-center text-white/20 text-[9px] uppercase tracking-[0.4em] font-medium">InnBucks MicroBank Limited &copy; 2026</p>
      </motion.div>
    </div>
  );

  const renderContent = () => {
    if (loggedInUser) {
        return (
            <div className="p-4 sm:p-8 max-w-7xl mx-auto">
                <header className="mb-8 flex items-center justify-between bg-card/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Logo className="h-8 w-8" />
                        <div>
                            <h1 className="text-xl font-bold text-white leading-tight">InnBucks</h1>
                            <p className="text-[10px] uppercase tracking-tighter text-secondary font-bold">Onboarding Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="font-semibold text-white">{loggedInUser.name}</p>
                            <p className="text-[10px] text-white/50 uppercase font-bold">{loggedInUser.role.replace('-', ' ')}</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-white" onClick={handleLogout}>Log Out</Button>
                    </div>
                </header>
                <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">{renderDashboard()}</main>
            </div>
        );
    }
    return renderUnifiedLogin();
  }

  return (
    <div className="w-full bg-background min-h-screen selection:bg-secondary selection:text-secondary-foreground">
      {renderContent()}
    </div>
  );
}

export default function Home() {
  return (
      <AppContent />
  );
}
