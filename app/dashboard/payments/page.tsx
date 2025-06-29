"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Receipt, Loader2 } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

interface Transaction {
  id: string;
  date: string;
  amount: string;
  status: string;
  description: string;
  press_release_id: string;
  submission_status: string;
}

export default function PaymentsPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transaction history from API
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        const response = await fetch('/api/payments/history');
        
        if (!response.ok) {
          throw new Error('Failed to fetch transaction history');
        }
        
        const data = await response.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
        toast({
          title: "Error",
          description: "Failed to load payment history. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Failed to load payment history</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your payment history and download receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border p-4 bg-muted/30 mb-6 flex items-start gap-3">
            <Receipt className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Secure Payments via Stripe</p>
              <p className="text-sm text-muted-foreground">
                All payments are processed securely through Stripe. We do not store your credit card information.
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-muted-foreground">
                      <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No transactions yet</p>
                      <p className="text-sm">Your payment history will appear here after you create your first press release.</p>
                      <Link href="/dashboard/new-release">
                        <Button className="mt-4">
                          Create Press Release
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'Paid' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : transaction.status === 'Failed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : transaction.status === 'Refunded'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      }`}>
                        {transaction.status}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{transaction.description}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Download className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:inline-block">Receipt</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
