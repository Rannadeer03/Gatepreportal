import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { type, userId, data } = await req.json()

    switch (type) {
      case 'registration_approved':
        await sendRegistrationApprovedEmail(supabase, userId, data)
        break
      
      case 'test_created':
        await sendTestCreatedNotification(supabase, userId, data)
        break
      
      case 'assignment_submitted':
        await sendAssignmentSubmittedNotification(supabase, userId, data)
        break
      
      case 'test_result_available':
        await sendTestResultNotification(supabase, userId, data)
        break
      
      default:
        throw new Error(`Unknown notification type: ${type}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in email notifications:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function sendRegistrationApprovedEmail(supabase: any, userId: string, data: any) {
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) {
    throw new Error('User profile not found')
  }

  // Log the email notification
  await supabase
    .from('system_logs')
    .insert({
      user_id: userId,
      action_type: 'email_sent',
      action_details: {
        type: 'registration_approved',
        email: profile.email,
        template: 'registration_approved'
      }
    })

  // In a real implementation, you would integrate with an email service
  // like SendGrid, Mailgun, or AWS SES
  console.log(`Registration approved email sent to ${profile.email}`)
}

async function sendTestCreatedNotification(supabase: any, userId: string, data: any) {
  const { testId, testTitle } = data

  // Get test details
  const { data: test } = await supabase
    .from('tests')
    .select('*')
    .eq('id', testId)
    .single()

  if (!test) {
    throw new Error('Test not found')
  }

  // Get students who should be notified
  const { data: students } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')

  // Log the notification
  await supabase
    .from('system_logs')
    .insert({
      user_id: userId,
      action_type: 'notification_sent',
      action_details: {
        type: 'test_created',
        testId,
        testTitle,
        recipients: students?.length || 0
      }
    })

  console.log(`Test created notification sent for test: ${testTitle}`)
}

async function sendAssignmentSubmittedNotification(supabase: any, userId: string, data: any) {
  const { assignmentId, studentId } = data

  // Get assignment and student details
  const { data: assignment } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', assignmentId)
    .single()

  const { data: student } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', studentId)
    .single()

  if (!assignment || !student) {
    throw new Error('Assignment or student not found')
  }

  // Log the notification
  await supabase
    .from('system_logs')
    .insert({
      user_id: userId,
      action_type: 'notification_sent',
      action_details: {
        type: 'assignment_submitted',
        assignmentId,
        assignmentTitle: assignment.title,
        studentName: student.name,
        studentEmail: student.email
      }
    })

  console.log(`Assignment submitted notification sent for: ${assignment.title}`)
}

async function sendTestResultNotification(supabase: any, userId: string, data: any) {
  const { testId, studentId, score, totalMarks } = data

  // Get test and student details
  const { data: test } = await supabase
    .from('tests')
    .select('*')
    .eq('id', testId)
    .single()

  const { data: student } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', studentId)
    .single()

  if (!test || !student) {
    throw new Error('Test or student not found')
  }

  // Log the notification
  await supabase
    .from('system_logs')
    .insert({
      user_id: userId,
      action_type: 'notification_sent',
      action_details: {
        type: 'test_result_available',
        testId,
        testTitle: test.title,
        studentName: student.name,
        score,
        totalMarks,
        percentage: ((score / totalMarks) * 100).toFixed(2)
      }
    })

  console.log(`Test result notification sent for: ${test.title}`)
} 