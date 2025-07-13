"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, Send, CheckCircle, ArrowRight, CreditCard, Sparkles, AlertCircle, Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  generatePressReleaseContent, 
  validatePressReleaseContent, 
  submitPressRelease,
  contentToSubmission,
  type PressReleaseContent, 
  type ValidationResult, 
  type PressReleaseGenerationParams,
  type FullSubmissionResult 
} from "@/utils/openai/client"
import { useToast } from "@/components/ui/use-toast"

export function PressReleaseForm() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0) // 0: input, 1: payment, 2: preview, 3: validation
  const [submissionProgress, setSubmissionProgress] = useState<string | null>(null)
  const [submissionComplete, setSubmissionComplete] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [finalSubmissionResult, setFinalSubmissionResult] = useState<FullSubmissionResult | null>(null)
  
  // Add scheduling state
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [scheduledTime, setScheduledTime] = useState<string>("12:00")
  const [timezone, setTimezone] = useState<string>("UTC")
  
  // Form data state
  const [formData, setFormData] = useState<PressReleaseGenerationParams>({
    companyName: '',
    companyDescription: '',
    eventDescription: '',
    industry: 'Technology',
    location: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    websiteUrl: '',
    scheduledRelease: null // Add scheduled release data
  })
  
  // Generated content state
  const [generatedContent, setGeneratedContent] = useState<PressReleaseContent>({
    title: '',
    twitterTitle: '',
    summary: '',
    fullContent: ''
  })
  
  // Validation result state
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  
  // Helper to get current tab value based on step
  const getTabValue = () => {
    switch (currentStep) {
      case 0: return "input"
      case 1: return "payment"
      case 2: return "preview"
      case 3: return "validation"
      default: return "input"
    }
  }
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }
  
  // Handle select input changes
  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSchedulingChange = (value: string) => {
    setIsScheduled(value === "scheduled")
    if (value !== "scheduled") {
      setFormData(prev => ({
        ...prev,
        scheduledRelease: null
      }))
    } else if (scheduledDate) {
      updateScheduledRelease()
    }
  }

  const updateScheduledRelease = () => {
    if (!scheduledDate || !isScheduled) return

    const [hours, minutes] = scheduledTime.split(":").map(Number)
    const date = new Date(scheduledDate)
    date.setHours(hours, minutes)

    setFormData(prev => ({
      ...prev,
      scheduledRelease: {
        date: date.toISOString(),
        timezone
      }
    }))
  }
  
  // Test click handler for debugging
  const testClickHandler = () => {
    console.log('🧪 [TEST] Button clicked! This proves click events are working.');
    alert('Button click detected! Check console for more details.');
  }
  
  // Simulate payment process and trigger content generation
  const handlePayment = async () => {
    console.log('🚀 [DEBUG] handlePayment function called!'); // Debug log
    console.log('🚀 [DEBUG] Current state:', { isSubmitting, currentStep, formData }); // Debug state
    
    try {
      setIsSubmitting(true)
      setSubmissionProgress("Processing payment...")
      
      console.log('🚀 [DEBUG] Set isSubmitting to true, starting timeout...'); // Debug log
      
      // Simulate payment processing
      setTimeout(async () => {
        console.log('🚀 [DEBUG] Payment timeout completed, processing...'); // Debug log
        
        try {
          setPaymentComplete(true)
          setSubmissionProgress("Generating your press release...")
          
          console.log('🚀 [DEBUG] About to call handleGenerate...'); // Debug log
          
          // Generate content after payment
          await handleGenerate()
          
          console.log('🚀 [DEBUG] handleGenerate completed successfully'); // Debug log
          
          setIsSubmitting(false)
          toast({
            title: "Payment Successful",
            description: "Your payment has been processed and content generated successfully.",
          })
        } catch (error) {
          console.error('🚀 [DEBUG] Error in handleGenerate:', error); // Debug log
          setIsSubmitting(false)
          setSubmissionProgress(null) // Clear progress on error
          toast({
            title: "Generation Failed",
            description: "Payment processed but content generation failed. Please try again.",
            variant: "destructive"
          })
        }
      }, 2000)
      
    } catch (error) {
      console.error('🚀 [DEBUG] Error in handlePayment:', error); // Debug log
      setIsSubmitting(false)
      setSubmissionProgress(null)
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Generate press release content using OpenAI
  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      
      // Validate form data
      if (!formData.companyName || !formData.companyDescription || !formData.eventDescription) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        })
        setIsGenerating(false)
        return
      }
      
      // Call OpenAI API to generate content
      const content = await generatePressReleaseContent(formData)
      setGeneratedContent(content)
      
      // Move to preview step
      setCurrentStep(2)
      
      toast({
        title: "Content Generated",
        description: "Your press release has been generated. Please review and edit if needed.",
      })
    } catch (error) {
      console.error('Error generating content:', error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate press release content. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }
  
  // Validate press release content
  const handleValidate = async () => {
    try {
      setIsGenerating(true)
      setSubmissionProgress("Validating content...")
      
      // Call OpenAI API to validate content
      const result = await validatePressReleaseContent(generatedContent)
      setValidationResult(result)
      
      // Move to validation result step
      setCurrentStep(3)
      
      if (result.isValid) {
        toast({
          title: "Validation Successful",
          description: "Your press release meets all distribution guidelines.",
        })
      } else {
        toast({
          title: "Validation Issues",
          description: "There are some issues with your press release. Please review the feedback.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error validating content:', error)
      toast({
        title: "Validation Failed",
        description: "Failed to validate press release content. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
      setSubmissionProgress(null)
    }
  }

  // Submit press release for distribution using browser automation
  const handleSubmit = async () => {
    if (!validationResult?.isValid) {
      toast({
        title: "Validation Required",
        description: "Please validate your content before submission.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    setSubmissionProgress("Preparing submission...")

    try {
      // Convert content to submission format
      const submissionData = contentToSubmission(generatedContent, formData)
      
      setSubmissionProgress("Purchasing press release package...")
      
      // Submit using browser automation (production mode)
      const result = await submitPressRelease(submissionData, 'basic', false, false) // Use production mode
      
      setSubmissionProgress("Submitting to media outlets...")
      
      if (result.submission.success) {
        setFinalSubmissionResult(result)
        setSubmissionProgress("Success!")
        setIsSubmitting(false)
        setSubmissionComplete(true)
        
        toast({
          title: "Submission Successful",
          description: `Your press release has been submitted successfully. Submission ID: ${result.submission.submissionId}`,
        })
      } else {
        throw new Error(result.submission.error || 'Submission failed')
      }
      
    } catch (error) {
      console.error('Error submitting press release:', error)
      setIsSubmitting(false)
      setSubmissionProgress(null)
      
      toast({
        title: "Submission Failed",
        description: "Failed to submit your press release. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Press Release Details</CardTitle>
        <CardDescription>Enter information about your company and newsworthy event</CardDescription>
      </CardHeader>
      <CardContent>
        {!submissionComplete ? (
          <Tabs value={getTabValue()} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="input" disabled={currentStep < 0}>
                Company Info
              </TabsTrigger>
              <TabsTrigger value="payment" disabled={currentStep < 1}>
                Payment
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={currentStep < 2}>
                Preview & Edit
              </TabsTrigger>
              <TabsTrigger value="validation" disabled={currentStep < 3}>
                Validation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
                    <Input 
                      id="companyName" 
                      placeholder="Your company name" 
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl">Company Website</Label>
                    <Input 
                      id="websiteUrl" 
                      placeholder="https://example.com" 
                      value={formData.websiteUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyDescription">Company Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="companyDescription"
                    placeholder="Brief description of your company, its mission, and background"
                    rows={3}
                    value={formData.companyDescription}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDescription">Newsworthy Event <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="eventDescription"
                    placeholder="Describe the news you want to announce (product launch, milestone, partnership, etc.)"
                    rows={4}
                    value={formData.eventDescription}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleSelectChange(value, 'industry')}>
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Automotive">Automotive</SelectItem>
                      <SelectItem value="Energy">Energy</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">City/Location <span className="text-red-500">*</span></Label>
                    <Input 
                      id="location" 
                      placeholder="City, State" 
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="State" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" placeholder="Country" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Release Timing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="release-time">Release Time</Label>
                      <Select defaultValue="immediate">
                        <SelectTrigger id="release-time">
                          <SelectValue placeholder="Select release time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate Release</SelectItem>
                          <SelectItem value="scheduled">Scheduled Release</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="est">
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="est">Eastern Time (ET)</SelectItem>
                          <SelectItem value="cst">Central Time (CT)</SelectItem>
                          <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                          <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name <span className="text-red-500">*</span></Label>
                      <Input 
                        id="contactName" 
                        placeholder="Full name" 
                        value={formData.contactName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email <span className="text-red-500">*</span></Label>
                      <Input 
                        id="contactEmail" 
                        type="email" 
                        placeholder="email@example.com" 
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input 
                        id="contactPhone" 
                        placeholder="(555) 123-4567" 
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(1)} disabled={!formData.companyName || !formData.companyDescription || !formData.eventDescription || !formData.contactName || !formData.contactEmail}>
                  Next: Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="payment" className="space-y-6">
              {/* Debug Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <h4 className="font-medium text-blue-900 mb-2">🐛 Debug Info:</h4>
                <div className="space-y-1 text-blue-700">
                  <p>Current Step: {currentStep}</p>
                  <p>Is Submitting: {isSubmitting.toString()}</p>
                  <p>Form Valid: {(formData.companyName && formData.companyDescription && formData.eventDescription && formData.contactName && formData.contactEmail).toString()}</p>
                  <p>Submission Progress: {submissionProgress || 'null'}</p>
                </div>
                <div className="mt-3 p-2 bg-blue-100 rounded text-blue-800">
                  <p className="font-medium">🧪 Testing Instructions:</p>
                  <p>1. Open browser console (F12)</p>
                  <p>2. Click the "Pay $395 and Generate" button</p>
                  <p>3. Check console for debug logs and alert popup</p>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>Select your press release distribution package</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-2 border-primary">
                      <CardHeader>
                        <CardTitle>Basic</CardTitle>
                        <CardDescription>Essential distribution</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-4">$395</div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Distribution to 100+ media outlets</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> AI-powered content generation</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Basic analytics report</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2 border-muted">
                      <CardHeader>
                        <CardTitle>Premium</CardTitle>
                        <CardDescription>Enhanced visibility</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-4">$695</div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Distribution to 300+ media outlets</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> AI-powered content generation</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Detailed analytics report</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Social media distribution</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2 border-muted">
                      <CardHeader>
                        <CardTitle>Enterprise</CardTitle>
                        <CardDescription>Maximum reach</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-4">$995</div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Distribution to 500+ media outlets</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> AI-powered content generation</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Comprehensive analytics dashboard</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Social media distribution</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Priority placement</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Alert className="bg-primary/10 border-primary/20">
                    <CreditCard className="h-4 w-4" />
                    <AlertTitle>Secure Payment</AlertTitle>
                    <AlertDescription>
                      All payments are processed securely through Stripe. We do not store your credit card information.
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(0)}>
                    Back
                  </Button>
                  <Button 
                    onClick={(e) => {
                      console.log('🚀 [DEBUG] Button clicked event:', e);
                      testClickHandler(); // Test handler
                      handlePayment(); // Original handler
                    }} 
                    disabled={isSubmitting}
                    type="button"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {submissionProgress}
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay $395 and Generate
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-lg font-medium">Generating your press release...</p>
                  <p className="text-sm text-muted-foreground">This may take a few moments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI-Generated
                    </Badge>
                    <p className="text-sm text-muted-foreground">You can edit any part of this content before submission</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Press Release Title</Label>
                    <Input
                      id="title"
                      value={generatedContent.title}
                      onChange={(e) => setGeneratedContent({...generatedContent, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitterTitle">Twitter Title (Max 280 characters)</Label>
                    <Input
                      id="twitterTitle"
                      value={generatedContent.twitterTitle}
                      onChange={(e) => setGeneratedContent({...generatedContent, twitterTitle: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary">Press Release Summary</Label>
                    <Textarea
                      id="summary"
                      value={generatedContent.summary}
                      onChange={(e) => setGeneratedContent({...generatedContent, summary: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullContent">Press Release Content</Label>
                    <Textarea
                      id="fullContent"
                      value={generatedContent.fullContent}
                      onChange={(e) => setGeneratedContent({...generatedContent, fullContent: e.target.value})}
                      rows={20}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back to Payment
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button onClick={handleValidate} disabled={isGenerating || !generatedContent.title || !generatedContent.summary || !generatedContent.fullContent}>
                    Validate Content
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="validation" className="space-y-6">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-lg font-medium">Validating your press release...</p>
                  <p className="text-sm text-muted-foreground">Checking against EINNewswire guidelines</p>
                </div>
              ) : validationResult ? (
                <div className="space-y-6">
                  {validationResult.isValid ? (
                    <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertTitle>Validation Successful</AlertTitle>
                      <AlertDescription>
                        Your press release meets all distribution guidelines and is ready for submission.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/30">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertTitle>Review Needed</AlertTitle>
                      <AlertDescription>
                        Please review the feedback below and make necessary changes to your press release.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Validation Results</CardTitle>
                      <CardDescription>
                        {validationResult.isValid 
                          ? "Your press release has passed all validation checks" 
                          : "Please address the following feedback before submission"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {validationResult.isValid ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <p>No promotional language or excessive superlatives</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <p>Content is newsworthy and factual</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <p>Professional tone and language</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <p>Proper grammar and spelling</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 p-4 bg-muted/30 rounded-md">
                          <p className="whitespace-pre-line">{validationResult.feedback}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back to Edit
                    </Button>
                    {validationResult.isValid ? (
                      <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {submissionProgress}
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Submit for Distribution
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button onClick={() => setCurrentStep(2)}>
                        Edit Content
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No validation results yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Please generate and validate your content first</p>
                  <Button onClick={() => setCurrentStep(2)}>
                    Back to Content
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">Press Release Submitted Successfully!</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Your press release has been submitted to premium media outlets for distribution. You will receive a
              confirmation email shortly.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              <p>A distribution report will be available 24 hours after publication.</p>
              <p>You can view the status of your press release on your dashboard.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard">View All Press Releases</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">
                  Return to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
