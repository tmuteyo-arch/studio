'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Landmark, Loader2, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Define a type for our rate data for better type safety
type Rate = {
  currency: string;
  bid: string;
  ask: string;
  average: string;
};

// This is where the static data currently lives. In a real scenario, this would be fetched.
const staticRates: Rate[] = [
  { currency: 'ZAR', bid: '13.3458', ask: '13.3564', average: '13.3511' },
  { currency: 'GBP', bid: '1.3097', ask: '1.3101', average: '1.3099' },
  { currency: 'JPY', bid: '111.98', ask: '111.99', average: '111.985' },
  { currency: 'ZMW/ZMK', bid: '9.9301', ask: '9.969', average: '9.94955' },
  { currency: 'BWP', bid: '0.0977', ask: '0.098', average: '0.09785' },
  { currency: 'CHF', bid: '0.9932', ask: '0.9935', average: '0.99335' },
  { currency: 'MWK', bid: '713.44', ask: '728.44', average: '720.94' },
];

export default function ExchangeRates() {
  const [rates, setRates] = React.useState<Rate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchRates = async () => {
      try {
        // In a real application, you would replace this with:
        // const response = await fetch('/api/rbz-rates');
        // if (!response.ok) throw new Error('Failed to fetch rates');
        // const data = await response.json();
        // setRates(data);

        // For now, we simulate a successful API call with our static data
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        setRates(staticRates);

      } catch (e: any) {
        setError(e.message || 'Could not load exchange rates.');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []); // The empty array ensures this effect runs only once when the component mounts

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between p-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                </div>
            ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-destructive">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p className="font-semibold">Error Loading Rates</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Bid</TableHead>
              <TableHead className="text-right">Ask</TableHead>
              <TableHead className="text-right">Average</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.map((rate) => (
              <TableRow key={rate.currency}>
                <TableCell className="font-medium">{rate.currency}</TableCell>
                <TableCell className="text-right">{rate.bid}</TableCell>
                <TableCell className="text-right">{rate.ask}</TableCell>
                <TableCell className="text-right">{rate.average}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground mt-4">
            Source: Reserve Bank of Zimbabwe. Rates are for informational purposes only.
        </p>
      </>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Exchange Rates
        </CardTitle>
        <CardDescription>
            Bureau De Change Transactions Reporting System - Rates for {new Date().toISOString().split('T')[0]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
