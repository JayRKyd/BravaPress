"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, FileText, Calendar, DollarSign, ExternalLink, RefreshCw } from "lucide-react"
import Link from "next/link"

type PaymentStatus = "completed" | "pending" | "failed"

interface Payment {
  id: string
  date: string
  amountFormatted: string
  status: PaymentStatus
  pressReleaseTitle: string
  invoiceUrl?: string
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true)
        setError(false)
        const res = await fetch(`/api/payments/history?limit=20`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch payments')
        const json = await res.json()
        const paymentsData: Payment[] = (json.transactions || []).map((t: any) => {
          // status mapping from API ('Paid'|'Failed'|'Refunded'|'Pending') to local
          const statusMap: Record<string, PaymentStatus> = {
            Paid: 'completed',
            Refunded: 'completed',
            Failed: 'failed',
            Pending: 'pending'
          }
          const title = (t.description || '').replace(/^Press Release:\s*/i, '') || 'Press Release'
          return {
            id: t.id,
            date: t.date,
            amountFormatted: t.amount || '$0.00',
            status: statusMap[t.status] || 'pending',
            pressReleaseTitle: title,
            invoiceUrl: t.stripe_hosted_invoice_url
          }
        })
        setPayments(paymentsData)
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [])

  const handleRetry = () => {
    setLoading(true)
    setError(false)
    // Simulate retry
    setTimeout(() => {
      setPayments(mockPayments)
      setLoading(false)
    }, 1000)
  }

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100"
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      case "failed":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-brava-600">Loading payment history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Unable to load payment history</h3>
          <p className="text-brava-600 mb-6">Please try again later</p>
          <Button onClick={handleRetry} className="bg-accent hover:bg-accent/90">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No payment history yet</h3>
          <p className="text-brava-600 mb-6">Make your first press release to see your payment history here</p>
          <Button asChild className="bg-accent hover:bg-accent/90">
            <Link href="/dashboard/new-release">
              Create Your First Release
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Payment History</h1>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <Card key={payment.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="font-semibold">{payment.pressReleaseTitle}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-brava-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(payment.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {payment.amountFormatted}
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm" asChild>
                <Link href={payment.invoiceUrl || '#'} target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Invoice
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
