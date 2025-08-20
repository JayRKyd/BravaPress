import { NextRequest, NextResponse } from 'next/server'
import { createDirectClient } from '@/utils/supabase/server'
import { EINPresswireAutomation } from '@/services/einpresswire-automation'

export async function POST(request: NextRequest) {
  try {
    const supabase = createDirectClient()
    
    // Get the next available job
    const { data: job, error: jobError } = await supabase
      .rpc('get_next_job')

    if (jobError || !job || job.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No jobs available' 
      })
    }

    const jobData = job[0]
    console.log(`🔄 Processing job: ${jobData.job_id} (${jobData.job_type})`)
    console.log(`📊 Raw jobData:`, JSON.stringify(jobData, null, 2))

    // Always fetch submission_id directly from jobs table to avoid RPC issues
    console.log(`🔍 Fetching job details for job_id: ${jobData.job_id}`)
    const { data: fullJob, error: jobFetchError } = await supabase
      .from('jobs')
      .select('submission_id')
      .eq('id', jobData.job_id)
      .single()
    
    console.log(`📊 Full job query result:`, JSON.stringify(fullJob, null, 2))
    console.log(`❌ Job fetch error:`, jobFetchError)
    
    if (jobFetchError || !fullJob?.submission_id) {
      const errorMsg = `Cannot fetch submission_id: ${jobFetchError?.message || 'submission_id is null'}`
      console.error(`🚨 ${errorMsg}`)
      await supabase
        .from('jobs')
        .update({ status: 'failed', error: errorMsg })
        .eq('id', jobData.job_id)
      return NextResponse.json({ 
        success: false, 
        error: errorMsg 
      })
    }
    
    const submissionId = fullJob.submission_id
    console.log(`✅ Got submission_id: ${submissionId}`)

    // Update job status to processing
    await supabase
      .from('jobs')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', jobData.job_id)

    try {
      if (jobData.job_type === 'press_release_submission') {
        // Get submission details
        console.log(`🔍 Fetching submission with ID: ${submissionId}`)
        const { data: submission, error: subError } = await supabase
          .from('press_release_submissions')
          .select('*')
          .eq('id', submissionId)
          .single()

        if (subError) {
          console.error(`❌ Submission fetch error:`, subError)
          throw new Error(`Failed to fetch submission: ${subError.message}`)
        }

        if (!submission) {
          throw new Error(`Submission not found: ${submissionId}`)
        }

        console.log(`✅ Found submission: ${submission.title}`)

        // Check if this is a manual payment submission that should skip purchase
        const skipPurchase = (jobData as any).job_data?.skip_purchase === true

        if (skipPurchase) {
          console.log('💰 Manual payment submission - skipping purchase step')
          // Update submission status to processing
          await supabase
            .from('press_release_submissions')
            .update({ status: 'processing' })
            .eq('id', submission.id)
          
          // Go straight to submission
          const automation = new EINPresswireAutomation()
          await automation.initialize(true) // headless for production
          
          try {
            const submissionResult = await automation.submitPressRelease({
              title: submission.title,
              content: submission.content,
              summary: submission.summary,
              companyName: submission.company_name,
              contactName: submission.contact_name,
              contactEmail: submission.contact_email,
              contactPhone: submission.contact_phone,
              websiteUrl: submission.website_url,
              industry: submission.industry,
              location: submission.location
            })

            if (submissionResult.success) {
              // Update submission as completed
              await supabase
                .from('press_release_submissions')
                .update({ 
                  status: 'completed',
                  completed_at: new Date().toISOString()
                })
                .eq('id', submission.id)

              // Mark job as completed
              await supabase
                .from('jobs')
                .update({ 
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  result: submissionResult
                })
                .eq('id', jobData.job_id)

              console.log('✅ Manual payment submission completed successfully')
            } else {
              throw new Error(submissionResult.error || 'Submission failed')
            }
          } finally {
            await automation.cleanup()
          }
        } else {
          // Regular submission flow with purchase
          console.log('💳 Regular submission - proceeding with purchase')
          
          const automation = new EINPresswireAutomation()
          await automation.initialize(true) // headless for production
          
          try {
            // Purchase package
            const purchaseResult = await automation.purchasePackage('basic')
            
            if ((purchaseResult as any).requiresManualPayment) {
              // Update submission status
              await supabase
                .from('press_release_submissions')
                .update({ status: 'payment_required_manual' })
                .eq('id', submission.id)

              // Mark job as failed with manual payment required
              await supabase
                .from('jobs')
                .update({ 
                  status: 'failed',
                  error: purchaseResult.error,
                  completed_at: new Date().toISOString()
                })
                .eq('id', jobData.job_id)

              console.log('🛑 Manual payment required for submission')
              return NextResponse.json({ 
                success: false, 
                status: 'manual_payment_required',
                submission_id: submission.id
              })
            }

            if (!purchaseResult.success) {
              throw new Error(purchaseResult.error || 'Purchase failed')
            }

            // Update submission status to processing
            await supabase
              .from('press_release_submissions')
              .update({ status: 'processing' })
              .eq('id', submission.id)

            // Submit press release
            const submissionResult = await automation.submitPressRelease({
              title: submission.title,
              content: submission.content,
              summary: submission.summary,
              companyName: submission.company_name,
              contactName: submission.contact_name,
              contactEmail: submission.contact_email,
              contactPhone: submission.contact_phone,
              websiteUrl: submission.website_url,
              industry: submission.industry,
              location: submission.location
            })

            if (submissionResult.success) {
              // Update submission as completed
              await supabase
                .from('press_release_submissions')
                .update({ 
                  status: 'completed',
                  completed_at: new Date().toISOString()
                })
                .eq('id', submission.id)

              // Mark job as completed
              await supabase
                .from('jobs')
                .update({ 
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  result: { purchase: purchaseResult, submission: submissionResult }
                })
                .eq('id', jobData.job_id)

              console.log('✅ Press release submission completed successfully')
            } else {
              throw new Error(submissionResult.error || 'Submission failed')
            }
          } finally {
            await automation.cleanup()
          }
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Job processed successfully',
        job_id: jobData.job_id
      })

    } catch (error) {
      console.error(`❌ Job processing failed: ${error}`)
      
      // Mark job as failed
      await supabase
        .from('jobs')
        .update({ 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString()
        })
        .eq('id', jobData.job_id)

      // Update submission status if it exists
      if ((jobData as any).submission_id || (jobData as any).job_submission_id) {
        await supabase
          .from('press_release_submissions')
          .update({ status: 'failed' })
          .eq('id', submissionId as string)
      }

      return NextResponse.json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        job_id: jobData.job_id
      })
    }

  } catch (error) {
    console.error('💥 Job processor error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 