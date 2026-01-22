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

const AnimatedRoleCard = ({ role, title, description, onRoleSelect, buttonVariant, delay }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 200, damping: 25 });
  const ySpring = useSpring(y, { stiffness: 200, damping: 25 });

  const rotateX = useTransform(ySpring, [-0.5, 0.5], ["12.5deg", "-12.5deg"]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ["-12.5deg", "12.5deg"]);

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
    >
      <Card
        className="text-left h-full flex flex-col bg-white/10 backdrop-blur-lg border-white/20 text-white"
        style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
      >
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-white/80">{description}</CardDescription>
        </CardHeader>
        <CardFooter className="mt-auto">
          <Button 
            className="w-full"
            variant={buttonVariant || 'default'}
            onClick={() => onRoleSelect(role)}>
            Login as {title}
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <Card className="overflow-hidden shadow-2xl">
          <div className="bg-slate-900 p-6 text-center text-card-foreground">
              {selectedRole === 'retail-executive' ? 
                <Crown className="mx-auto h-8 w-8 mb-2 text-primary"/> :
                <UserIcon className="mx-auto h-8 w-8 mb-2 text-primary"/>
              }
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-sm text-muted-foreground">Sign in to access your {selectedRole?.replace('-', ' ')} dashboard.</p>
          </div>
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleLogin} className='space-y-4'>
              <div className="space-y-2">
                  <label className="text-sm font-medium leading-none flex items-center gap-2" htmlFor="email"><Mail className="h-4 w-4 text-muted-foreground" />Email Address</label>
                  <Input id="email" type="email" placeholder="email@example.com" required defaultValue={users.find(u => u.role === selectedRole)?.email}/>
              </div>
              <div className="space-y-2">
                  <label className="text-sm font-medium leading-none flex items-center gap-2" htmlFor="password"><Lock className="h-4 w-4 text-muted-foreground"/>Password</label>
                  <Input id="password" type="password" required defaultValue="password"/>
              </div>
              <Button type="submit" className="w-full !mt-6">
                <LogIn className="mr-2 h-4 w-4"/> Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 p-4 text-center text-xs text-muted-foreground justify-center">
            <ShieldCheck className="mr-2 h-4 w-4 text-green-500"/> Your data is secure and protected
          </CardFooter>
        </Card>
        <Button variant="link" className="mt-4 text-white/80" onClick={() => setSelectedRole(null)}>
          Back to role selection
        </Button>
      </motion.div>
    </div>
  );
  
  const renderRoleSelection = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-center" style={{ perspective: 1200 }}>
       <div className="flex items-center gap-4 mb-4">
        <Logo className="h-10 w-10" />
        <h1 className="text-3xl font-bold tracking-tight text-white">InnBucks Agent Onboarding</h1>
      </div>
      <h2 className="text-2xl font-semibold text-white/90 mb-2">Select a Role to Continue</h2>
      <p className="text-white/70 mb-12">Simulate the login for different user roles in the system.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl">
        <AnimatedRoleCard 
          role="atl"
          title="ATL"
          description="Account Taking Leaders who submit applications."
          onRoleSelect={handleRoleSelect}
          buttonVariant="default"
          delay={0.1}
        />
        <AnimatedRoleCard 
          role="back-office"
          title="Back Office"
          description="Officers who validate and process applications."
          onRoleSelect={handleRoleSelect}
          buttonVariant="secondary"
          delay={0.2}
        />
        <AnimatedRoleCard 
          role="supervisor"
          title="Supervisor"
          description="Supervisors who review, approve, or reject applications."
          onRoleSelect={handleRoleSelect}
          buttonVariant="outline"
          delay={0.3}
        />
        <AnimatedRoleCard 
          role="retail-executive"
          title="Retail Executive"
          description="High-level overview of onboarding performance."
          onRoleSelect={handleRoleSelect}
          buttonVariant="ghost"
          delay={0.4}
        />
      </div>
    </div>
  );

  const renderContent = () => {
    if (loggedInUser) {
        return (
            <div className="p-4 sm:p-8 max-w-7xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo className="h-8 w-8" />
                        <h1 className="text-2xl font-bold text-foreground">InnBucks Agent Onboarding</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                        <p className="font-semibold">{loggedInUser.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{loggedInUser.role.replace('-', ' ')}</p>
                        </div>
                        <Button variant="outline" onClick={handleLogout}>Log Out</Button>
                    </div>
                </header>
                <main>{renderDashboard()}</main>
            </div>
        );
    }
    if (selectedRole) {
        return renderLoginForm();
    }
    return renderRoleSelection();
  }

  return (
    <div className="w-full bg-background min-h-screen">
      {renderContent()}
    </div>
  );
}

export default function Home() {
  return (
      <AppContent />
  );
}
