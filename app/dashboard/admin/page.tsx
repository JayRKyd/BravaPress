'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle, Clock, DollarSign, FileText, Users, RefreshCcw, AlertTriangle, Activity, Server, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface AdminMetrics {
  overview: {
    total_submissions: number
    completed_submissions: number
    failed_submissions: number
    pending_submissions: number
    success_rate: number
    total_revenue: number
    avg_processing_time_minutes: number
  }
  jobs: {
    total_jobs: number
    failed_jobs: number
    pending_jobs: number
    processing_jobs: number
    job_success_rate: number
  }
  recent_activity: {
    submissions_24h: number
    revenue_24h: number
  }
  status_breakdown: {
    draft: number
    payment_pending: number
    paid: number
    processing: number
    completed: number
    failed: number
  }
}

interface PressRelease {
  id: string
  title: string
  company_name: string
  status: string
  payment_amount: number
  created_at: string
  profiles: {
    email: string
    full_name: string
  }
}

interface Job {
  id: string
  type: string
  status: string
  attempts: number
  created_at: string
  error: string | null
  press_release_submissions?: {
    title: string
    company_name: string
    profiles: {
      email: string
      full_name: string
    }
  }
}

interface SystemHealth {
  health_score: number
  status: 'healthy' | 'degraded' | 'critical'
  checks: {
    database: {
      status: 'healthy' | 'error'
      response_time_ms: number
      details?: string
    }
    openai: {
      status: 'healthy' | 'error'
      response_time_ms: number
      details?: string
    }
    job_queue: {
      status: 'healthy' | 'warning' | 'error'
      pending_jobs: number
      failed_jobs: number
      oldest_pending_minutes: number
      details?: string
    }
    memory: {
      status: 'healthy' | 'warning' | 'error'
      used_mb: number
      free_mb: number
      usage_percent: number
      details?: string
    }
    environment: {
      status: 'healthy' | 'error'
      missing_vars: string[]
      details?: string
    }
  }
  recent_activity: {
    submissions_last_hour: number
    job_completion_rate: number
    avg_response_time_ms: number
  }
  alerts: Array<{
    severity: 'info' | 'warning' | 'error'
    message: string
    recommendation?: string
  }>
  timestamp: string
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Filters
  const [prFilter, setPrFilter] = useState({
    status: '',
    search: '',
    timeframe: '7days'
  })
  
  const [jobFilter, setJobFilter] = useState({
    status: '',
    type: ''
  })

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/admin/metrics?timeframe=${prFilter.timeframe}`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
      toast.error('Failed to load metrics')
    }
  }

  const fetchPressReleases = async () => {
    try {
      const params = new URLSearchParams({
        limit: '20',
        ...(prFilter.status && { status: prFilter.status }),
        ...(prFilter.search && { search: prFilter.search })
      })
      
      const response = await fetch(`/api/admin/press-releases?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPressReleases(data.press_releases)
      }
    } catch (error) {
      console.error('Failed to fetch press releases:', error)
      toast.error('Failed to load press releases')
    }
  }

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams({
        limit: '20',
        ...(jobFilter.status && { status: jobFilter.status }),
        ...(jobFilter.type && { type: jobFilter.type })
      })
      
      const response = await fetch(`/api/admin/jobs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      toast.error('Failed to load jobs')
    }
  }

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/admin/system-health')
      if (response.ok) {
        const data = await response.json()
        setSystemHealth(data)
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error)
      toast.error('Failed to load system health')
    }
  }

  const retryJob = async (jobId: string) => {
    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry_job', job_id: jobId })
      })
      
      if (response.ok) {
        toast.success('Job queued for retry')
        fetchJobs()
        fetchMetrics()
      } else {
        toast.error('Failed to retry job')
      }
    } catch (error) {
      console.error('Failed to retry job:', error)
      toast.error('Failed to retry job')
    }
  }

  const retryAllFailedJobs = async () => {
    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry_all_failed' })
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        fetchJobs()
        fetchMetrics()
      } else {
        toast.error('Failed to retry failed jobs')
      }
    } catch (error) {
      console.error('Failed to retry all failed jobs:', error)
      toast.error('Failed to retry failed jobs')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchMetrics(), fetchPressReleases(), fetchJobs(), fetchSystemHealth()])
      setLoading(false)
    }
    
    loadData()
  }, [prFilter.timeframe])

  useEffect(() => {
    fetchPressReleases()
  }, [prFilter.status, prFilter.search])

  useEffect(() => {
    fetchJobs()
  }, [jobFilter.status, jobFilter.type])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-purple-100 text-purple-800'
      case 'payment_pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Select value={prFilter.timeframe} onValueChange={(value) => setPrFilter(prev => ({ ...prev, timeframe: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1day">Last 24h</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => {
              fetchMetrics()
              fetchPressReleases()
              fetchJobs()
              fetchSystemHealth()
            }}
            variant="outline"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="press-releases">Press Releases</TabsTrigger>
          <TabsTrigger value="jobs">Job Queue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system-health">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics?.overview.total_revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  ${metrics?.recent_activity.revenue_24h} in last 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.overview.total_submissions}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.recent_activity.submissions_24h} in last 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.overview.success_rate}%</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.overview.completed_submissions} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(metrics?.overview.avg_processing_time_minutes || 0)}m</div>
                <p className="text-xs text-muted-foreground">
                  Average completion time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Press Release Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(metrics?.status_breakdown || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="capitalize">{status.replace('_', ' ')}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Queue Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Total Jobs</span>
                  <Badge variant="secondary">{metrics?.jobs.total_jobs}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pending</span>
                  <Badge variant="secondary">{metrics?.jobs.pending_jobs}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Processing</span>
                  <Badge className="bg-blue-100 text-blue-800">{metrics?.jobs.processing_jobs}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Failed</span>
                  <Badge className="bg-red-100 text-red-800">{metrics?.jobs.failed_jobs}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Job Success Rate</span>
                  <Badge variant="secondary">{metrics?.jobs.job_success_rate}%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="press-releases" className="space-y-4">
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Search by title or company..."
              value={prFilter.search}
              onChange={(e) => setPrFilter(prev => ({ ...prev, search: e.target.value }))}
              className="max-w-xs"
            />
            <Select value={prFilter.status || "all"} onValueChange={(value) => setPrFilter(prev => ({ ...prev, status: value === "all" ? "" : value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="payment_pending">Payment Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pressReleases.map((pr) => (
                  <TableRow key={pr.id}>
                    <TableCell className="font-medium">{pr.company_name}</TableCell>
                    <TableCell className="max-w-xs truncate">{pr.title}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pr.profiles.full_name}</div>
                        <div className="text-sm text-muted-foreground">{pr.profiles.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pr.status)}>
                        {pr.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>${pr.payment_amount}</TableCell>
                    <TableCell>{new Date(pr.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex gap-4 items-center">
            <Select value={jobFilter.status || "all"} onValueChange={(value) => setJobFilter(prev => ({ ...prev, status: value === "all" ? "" : value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={jobFilter.type || "all"} onValueChange={(value) => setJobFilter(prev => ({ ...prev, type: value === "all" ? "" : value }))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="press_release_generation">PR Generation</SelectItem>
                <SelectItem value="einpresswire_submission">EINPresswire</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={retryAllFailedJobs} variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retry All Failed
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submission</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">
                      {job.type.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {job.press_release_submissions && (
                        <div>
                          <div className="font-medium">{job.press_release_submissions.company_name}</div>
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {job.press_release_submissions.title}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.press_release_submissions?.profiles && (
                        <div>
                          <div className="font-medium">{job.press_release_submissions.profiles.full_name}</div>
                          <div className="text-sm text-muted-foreground">{job.press_release_submissions.profiles.email}</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {job.attempts}
                        {job.attempts > 3 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {job.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryJob(job.id)}
                        >
                          Retry
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                User management features coming soon - refunds, credits, account management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                User management interface will be available once we add the database tables.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system-health" className="space-y-6">
          {/* System Health Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth?.health_score}/100</div>
                <p className="text-xs text-muted-foreground">
                  System Status: {systemHealth?.status}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth?.recent_activity.avg_response_time_ms}ms</div>
                <p className="text-xs text-muted-foreground">
                  Last hour average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Job Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth?.recent_activity.job_completion_rate}%</div>
                <p className="text-xs text-muted-foreground">
                  {systemHealth?.recent_activity.submissions_last_hour} submissions last hour
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Checks */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Database */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Database</div>
                      <div className="text-sm text-muted-foreground">
                        {systemHealth?.checks.database.response_time_ms}ms response
                      </div>
                    </div>
                  </div>
                  <Badge className={
                    systemHealth?.checks.database.status === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }>
                    {systemHealth?.checks.database.status}
                  </Badge>
                </div>

                {/* OpenAI */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5" />
                    <div>
                      <div className="font-medium">OpenAI API</div>
                      <div className="text-sm text-muted-foreground">
                        {systemHealth?.checks.openai.response_time_ms}ms response
                      </div>
                    </div>
                  </div>
                  <Badge className={
                    systemHealth?.checks.openai.status === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }>
                    {systemHealth?.checks.openai.status}
                  </Badge>
                </div>

                {/* Job Queue */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Job Queue</div>
                      <div className="text-sm text-muted-foreground">
                        {systemHealth?.checks.job_queue.pending_jobs} pending, {systemHealth?.checks.job_queue.failed_jobs} failed
                      </div>
                    </div>
                  </div>
                  <Badge className={
                    systemHealth?.checks.job_queue.status === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : systemHealth?.checks.job_queue.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }>
                    {systemHealth?.checks.job_queue.status}
                  </Badge>
                </div>

                {/* Memory */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Memory Usage</div>
                      <div className="text-sm text-muted-foreground">
                        {systemHealth?.checks.memory.usage_percent}% used ({systemHealth?.checks.memory.used_mb}MB)
                      </div>
                    </div>
                  </div>
                  <Badge className={
                    systemHealth?.checks.memory.status === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : systemHealth?.checks.memory.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }>
                    {systemHealth?.checks.memory.status}
                  </Badge>
                </div>

                {/* Environment */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Environment</div>
                      <div className="text-sm text-muted-foreground">
                        Configuration status
                      </div>
                    </div>
                  </div>
                  <Badge className={
                    systemHealth?.checks.environment.status === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }>
                    {systemHealth?.checks.environment.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Alerts & Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Alerts & Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {systemHealth?.alerts && systemHealth.alerts.length > 0 ? (
                  systemHealth.alerts.map((alert, index) => (
                    <div key={index} className={`p-3 border rounded-lg ${
                      alert.severity === 'error' ? 'border-red-200 bg-red-50' :
                      alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }`}>
                      <div className="flex items-start gap-2">
                        {alert.severity === 'error' ? (
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        ) : alert.severity === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-sm">{alert.message}</div>
                          {alert.recommendation && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Recommendation: {alert.recommendation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div>All systems operational</div>
                    <div className="text-sm">No alerts or recommendations</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Last Updated */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-sm text-muted-foreground">
                Last updated: {systemHealth?.timestamp ? new Date(systemHealth.timestamp).toLocaleString() : 'Loading...'}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
