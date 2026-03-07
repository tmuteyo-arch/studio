'use client';

import * as React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useAtom } from 'jotai';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import AtlDashboard from '@/components/roles/atl-dashboard';
import BackOfficeDashboard from '@/components/roles/back-office-dashboard';
import SupervisorDashboard from '@/components/roles/supervisor-dashboard';
import RetailExecutiveDashboard from '@/components/roles/retail-executive-dashboard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { users, User, Role } from '@/lib/users';
import { activeUserAtom } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Mail, Lock, LogIn, User as UserIcon, ShieldCheck, Crown } from 'lucide-react';

const AnimatedRoleCard = ({ role, title, description, onRoleSelect, delay, icon: Icon }: any) => {
  const ref = React.useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 200, damping: 25 });
  const ySpring = useSpring(y, { stiffness: 200, damping: 25 });

  const rotateX = useTransform(ySpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
     <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Card
        className="text-left h-full flex flex-col bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/15 transition-colors group cursor-default"
        style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                {Icon && <Icon className="h-5 w-5 text-white" />}
            </div>
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
          </div>
          <CardDescription className="text-white/70 text-sm leading-relaxed">{description}</CardDescription>
        </CardHeader>
        <CardFooter className="mt-auto pt-4">
          <Button 
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold h-11 rounded-xl shadow-lg"
            onClick={() => onRoleSelect(role)}>
            Enter Portal
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};


function AppContent() {
  const [loggedInUser, setLoggedInUser] = useAtom(activeUserAtom);
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
  const { toast } = useToast();

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userToLogin = users.find(u => u.role === selectedRole);
    if (userToLogin) {
      setLoggedInUser(userToLogin);
      toast({
        title: `Welcome, ${userToLogin.name}!`,
        description: `You are now logged in as a ${userToLogin.role.replace('-', ' ')}.`,
      });
    } else {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: `Could not find a user for the role: ${selectedRole}`,
      });
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setSelectedRole(null);
  };

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

  const renderLoginForm = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#4c1d95] bg-gradient-to-br from-[#1e1b4b] via-[#7c3aed] to-[#1e1b4b] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <Card className="overflow-hidden shadow-2xl border-white/20 bg-white/10 backdrop-blur-md text-white">
          <div className="bg-black/20 p-8 text-center border-b border-white/10">
              <div className='flex justify-center mb-4'>
                <Logo className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-bold">Secure Access</h2>
              <p className="text-sm text-white/70">Logging in as {selectedRole?.replace('-', ' ')}</p>
          </div>
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleLogin} className='space-y-4'>
              <div className="space-y-2">
                  <label className="text-sm font-medium leading-none flex items-center gap-2" htmlFor="email"><Mail className="h-4 w-4 text-white" />Email Address</label>
                  <Input id="email" type="email" placeholder="email@example.com" className='bg-white/10 border-white/30 text-white placeholder:text-white/40' required defaultValue={users.find(u => u.role === (selectedRole as Role))?.email}/>
              </div>
              <div className="space-y-2">
                  <label className="text-sm font-medium leading-none flex items-center gap-2" htmlFor="password"><Lock className="h-4 w-4 text-white"/>Password</label>
                  <Input id="password" type="password" className='bg-white/10 border-white/30 text-white placeholder:text-white/40' required defaultValue="password"/>
              </div>
              <Button type="submit" className="w-full !mt-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold shadow-lg">
                <LogIn className="mr-2 h-4 w-4"/> Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-black/20 p-4 text-center text-xs text-white/50 justify-center">
            <ShieldCheck className="mr-2 h-4 w-4 text-accent"/> Your session is encrypted and secure
          </CardFooter>
        </Card>
        <Button variant="link" className="mt-4 text-white/70 hover:text-white transition-colors" onClick={() => setSelectedRole(null)}>
          Back to portal selection
        </Button>
      </motion.div>
    </div>
  );
  
  const renderRoleSelection = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1e1b4b] bg-gradient-to-b from-[#1e1b4b] via-[#6d28d9] to-[#1e1b4b] p-8 text-center">
       <div className="flex flex-col items-center gap-4 mb-16">
        <Logo className="h-20 w-20 mb-2" />
        <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-md">InnBucks</h1>
            <p className="text-white font-bold tracking-[0.25em] text-sm uppercase opacity-90">Agent Onboarding System</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        <AnimatedRoleCard 
          role="atl"
          title="Field ATL"
          icon={UserIcon}
          description="Area Team Leaders submitting regional customer applications."
          onRoleSelect={handleRoleSelect}
          delay={0.1}
        />
        <AnimatedRoleCard 
          role="back-office"
          title="Back Office"
          icon={ShieldCheck}
          description="Validation officers processing applications."
          onRoleSelect={handleRoleSelect}
          delay={0.2}
        />
        <AnimatedRoleCard 
          role="supervisor"
          title="Supervisor"
          icon={Crown}
          description="Regulatory oversight and team management."
          onRoleSelect={handleRoleSelect}
          delay={0.3}
        />
        <AnimatedRoleCard 
          role="retail-executive"
          title="Executive"
          icon={Crown}
          description="High-level performance and regional oversight."
          onRoleSelect={handleRoleSelect}
          delay={0.4}
        />
      </div>
      
      <p className="mt-24 text-white/30 text-[10px] uppercase tracking-[0.3em] font-medium">InnBucks MicroBank Limited &copy; 2026</p>
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
    if (selectedRole) {
        return renderLoginForm();
    }
    return renderRoleSelection();
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
