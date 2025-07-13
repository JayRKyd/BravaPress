"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Receipt, Loader2, AlertCircle, WifiOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  stripe_hosted_invoice_url?: string;
}

export default function PaymentsPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ type: 'network' | 'auth' | 'unknown'; message: string } | null>(null);

  // Fetch transaction history from API
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/payments/history');
      
      if (response.status === 401) {
        setError({ type: 'auth', message: 'Please log in to view your payment history.' });
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch transaction history');
      }
      
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(
        !window.navigator.onLine 
          ? { type: 'network', message: 'Please check your internet connection and try again.' }
          : { type: 'unknown', message: 'Unable to load payment history. Please try again later.' }
      );
      toast({
        title: "Error Loading Payments",
        description: "We couldn't load your payment history. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const ErrorDisplay = () => {
    switch (error?.type) {
      case 'network':
        return (
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              {error.message}
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={fetchTransactions}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        );
      case 'auth':
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              {error.message}
              <Link href="/auth/login">
                <Button className="mt-4 w-full">
                  Log In
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        );
      default:
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error?.message}
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={fetchTransactions}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        );
    }
  };

  const PageHeader = () => (
    <div className="flex items-center gap-2">
      <Link href="/dashboard">
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Card>
          <CardContent className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Loading payment history...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Card>
          <CardContent className="py-6">
            <ErrorDisplay />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader />

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
                All payments are processed securely through Stripe. Download your receipts anytime for your records.
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="text-muted-foreground">
                      <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No Payments Yet</p>
                      <p className="text-sm max-w-[400px] mx-auto mb-4">
                        Once you create and submit your first press release, your payment history will appear here.
                      </p>
                      <Link href="/dashboard/new-release">
                        <Button>
                          Create Press Release
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="font-medium">{transaction.amount}</TableCell>
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
                    <TableCell className="text-right">
                      {transaction.stripe_hosted_invoice_url ? (
                        <a 
                          href={transaction.stripe_hosted_invoice_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Download className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:inline-block">Receipt</span>
                          </Button>
                        </a>
                      ) : (
                        <Button variant="ghost" size="sm" className="gap-1" disabled>
                          <Download className="h-4 w-4" />
                          <span className="sr-only md:not-sr-only md:inline-block">Processing</span>
                        </Button>
                      )}
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
