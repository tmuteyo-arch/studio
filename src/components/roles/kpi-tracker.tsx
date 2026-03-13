'use client';
import * as React from 'react';
import { differenceInHours, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Application } from '@/lib/mock-data';
import { getDocumentRequirements } from '@/lib/document-requirements';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Clock, CheckCircle } from 'lucide-react';

interface KpiTrackerProps {
  applications: Application[];
}

interface KpiItemProps {
  title: string;
  value: number | null;
  target: number;
  unit: string;
  lowerIsBetter?: boolean;
}

const KpiItem = ({ title, value, target, unit, lowerIsBetter = false }: KpiItemProps) => {
  const isAboveTarget = !lowerIsBetter && (value ?? 0) >= target;
  const isBelowTarget = lowerIsBetter && (value ?? 0) <= target;
  const isSuccess = isAboveTarget || isBelowTarget;

  const progressValue = value !== null ? Math.min(((value || 0) / target) * 100, 100) : 0;

  return (
    <div className="p-4 bg-muted/30 rounded-lg">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-bold">{value?.toLocaleString() ?? 'N/A'}</p>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <div className="flex items-center text-xs text-muted-foreground mt-2">
        <span className="mr-2">Target: {lowerIsBetter ? '≤' : '≥'}{target}{unit}</span>
        {value !== null && (
          <Badge variant={isSuccess ? 'success' : 'destructive'}>
            {isSuccess ? 'Met' : 'Missed'}
          </Badge>
        )}
      </div>
       <Progress value={progressValue} className="h-1 mt-2" />
    </div>
  );
};


export default function KpiTracker({ applications }: KpiTrackerProps) {
  const kpis = React.useMemo(() => {
    const totalSubmissions = applications.length;
    if (totalSubmissions === 0) {
      return {
        kycCompletenessRate: null,
        missingKycRate: null,
        approvalRate: null,
        reworkRate: null,
        avgOnboardingTat: null,
        avgKycResolutionTat: null,
      };
    }

    // 1. KYC Completeness
    const completeAtFirstSubmission = applications.reduce((acc, app) => {
      const wasReturned = app.history.some(h => h.action === 'Returned to ATL');
      if (wasReturned) return acc;

      const requiredDocs = getDocumentRequirements(app.clientType);
      const uploadedDocs = new Set(app.documents.map(d => d.type));
      const hasAllDocs = requiredDocs.every(req => uploadedDocs.has(req.document));
      
      if (hasAllDocs) {
        return acc + 1;
      }
      return acc;
    }, 0);
    const kycCompletenessRate = (completeAtFirstSubmission / totalSubmissions) * 100;

    // 2. Missing KYC
    const missingKycRate = 100 - kycCompletenessRate;

    // 3. Approval Rate
    const approvedCount = applications.filter(a => a.status === 'Signed').length;
    const approvalRate = (approvedCount / totalSubmissions) * 100;

    // 4. Rework Rate
    const reworkCount = applications.filter(a => ['Returned to ATL', 'Rejected'].includes(a.status)).length;
    const reworkRate = (reworkCount / totalSubmissions) * 100;

    // 5. Onboarding TAT
    let totalOnboardingHours = 0;
    const approvedApps = applications.filter(app => app.status === 'Signed');
    approvedApps.forEach(app => {
      const submittedLog = app.history.find(h => h.action === 'Submitted');
      const approvedLog = app.history.find(h => h.action === 'Signed');
      if (submittedLog && approvedLog) {
        totalOnboardingHours += differenceInHours(parseISO(approvedLog.timestamp), parseISO(submittedLog.timestamp));
      }
    });
    const avgOnboardingTat = approvedApps.length > 0 ? Math.round(totalOnboardingHours / approvedApps.length) : null;

    // 6. Missing KYC Resolution TAT
    let totalResolutionHours = 0;
    let resolvedCount = 0;
    const returnedApps = applications.filter(app => app.history.some(h => h.action === 'Returned to ATL'));
    returnedApps.forEach(app => {
        const returnedIndex = app.history.findIndex(h => h.action === 'Returned to ATL');
        if (returnedIndex !== -1 && app.history.length > returnedIndex + 1) {
            const returnedLog = app.history[returnedIndex];
            const nextLog = app.history[returnedIndex + 1];
            totalResolutionHours += differenceInHours(parseISO(nextLog.timestamp), parseISO(returnedLog.timestamp));
            resolvedCount++;
        }
    });
    const avgKycResolutionTat = resolvedCount > 0 ? Math.round(totalResolutionHours / resolvedCount) : null;

    return {
      kycCompletenessRate: Math.round(kycCompletenessRate),
      missingKycRate: Math.round(missingKycRate),
      approvalRate: Math.round(approvalRate),
      reworkRate: Math.round(reworkRate),
      avgOnboardingTat,
      avgKycResolutionTat
    };

  }, [applications]);

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target /> Performance KPIs</CardTitle>
            <CardDescription>Overview of team performance against key targets.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3"><CheckCircle /> Quality-Based Targets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiItem title="KYC Completeness Rate" value={kpis.kycCompletenessRate} target={95} unit="%" />
                    <KpiItem title="Missing KYC Submissions" value={kpis.missingKycRate} target={5} unit="%" lowerIsBetter />
                    <KpiItem title="Account Approval Rate" value={kpis.approvalRate} target={95} unit="%" />
                    <KpiItem title="Rework / Rejection Rate" value={kpis.reworkRate} target={5} unit="%" lowerIsBetter />
                </div>
            </div>
             <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3"><Clock /> Turnaround Time (TAT) Targets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <KpiItem title="Onboarding TAT" value={kpis.avgOnboardingTat} target={48} unit="hrs" lowerIsBetter />
                     <KpiItem title="Missing KYC Resolution TAT" value={kpis.avgKycResolutionTat} target={72} unit="hrs" lowerIsBetter />
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
