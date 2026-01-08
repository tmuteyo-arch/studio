'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Landmark } from 'lucide-react';

const rates = [
  { currency: 'ZAR', bid: '13.3458', ask: '13.3564', average: '13.3511' },
  { currency: 'GBP', bid: '1.3097', ask: '1.3101', average: '1.3099' },
  { currency: 'JPY', bid: '111.98', ask: '111.99', average: '111.985' },
  { currency: 'ZMW/ZMK', bid: '9.9301', ask: '9.969', average: '9.94955' },
  { currency: 'BWP', bid: '0.0977', ask: '0.098', average: '0.09785' },
  { currency: 'CHF', bid: '0.9932', ask: '0.9935', average: '0.99335' },
  { currency: 'MWK', bid: '713.44', ask: '728.44', average: '720.94' },
];

export default function ExchangeRates() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Exchange Rates
        </CardTitle>
        <CardDescription>
            Bureau De Change Transactions Reporting System - Rates for 2018-08-02
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
