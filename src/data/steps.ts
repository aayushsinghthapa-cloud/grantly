import type { ApplicationStep } from '@/types';

/**
 * Reusable, plain-language application flows. Real scholarships follow a handful of
 * patterns (government portal, essay-based, campus office, research proposal, talent trial),
 * so each scholarship composes one of these with its own specifics.
 */

export function governmentPortalSteps(portal: string, extra?: ApplicationStep): ApplicationStep[] {
  return [
    {
      title: `Register on the ${portal}`,
      detail:
        'Create an account using your mobile number and Aadhaar. Write down your application ID — you will need it to log in and track status.',
    },
    {
      title: 'Fill in the application form',
      detail:
        'Enter your academic and family-income details exactly as they appear on your certificates. Mismatched spellings are the #1 reason for rejection.',
    },
    {
      title: 'Upload your documents',
      detail:
        'Scan each document as a clear PDF or JPG (usually under 200 KB). Make sure the Income Certificate is from the current financial year.',
    },
    ...(extra ? [extra] : []),
    {
      title: 'Get your institute to verify',
      detail:
        'Your college’s scholarship nodal officer must approve your application online. Visit the office and remind them well before the deadline.',
    },
    {
      title: 'Track status and receive funds',
      detail:
        'Check the portal every week. Approved amounts are paid by DBT straight into your Aadhaar-linked bank account.',
    },
  ];
}

export function essaySteps(
  provider: string,
  essayPrompt: string,
  interview = true,
): ApplicationStep[] {
  return [
    {
      title: `Create an applicant profile with ${provider}`,
      detail:
        'Sign up on the foundation’s website and complete the basic eligibility questionnaire.',
    },
    {
      title: 'Write your Statement of Purpose',
      detail: `Prompt: “${essayPrompt}” Aim for 600–800 words, use specific examples, and ask a friend to proofread.`,
    },
    {
      title: 'Request a recommendation letter',
      detail:
        'Ask a teacher or professor who knows your work. Give them at least two weeks and share your SOP so their letter supports it.',
    },
    {
      title: 'Submit the application',
      detail:
        'Upload your documents, review every section once more, and submit. You will get a confirmation email.',
    },
    ...(interview
      ? [
          {
            title: 'Prepare for the shortlist interview',
            detail:
              'Shortlisted students get a 15-minute video interview. Be ready to talk about your goals and how the scholarship will help.',
          },
        ]
      : []),
  ];
}

export function campusSteps(university: string, extra?: ApplicationStep): ApplicationStep[] {
  return [
    {
      title: `Log in to the ${university} student portal`,
      detail:
        'Use your enrolment number. First-year students receive login details in their admission email.',
    },
    {
      title: 'Open the Financial Aid section',
      detail:
        'Select this scholarship and confirm the declaration that the information you provide is accurate.',
    },
    {
      title: 'Attach supporting documents',
      detail:
        'Upload your marksheet, income proof and a Bonafide Certificate from the academic office.',
    },
    ...(extra ? [extra] : []),
    {
      title: 'Committee review',
      detail:
        'The scholarship committee reviews applications within 3–4 weeks. Results are posted on the portal notice board.',
    },
  ];
}

export function researchSteps(body: string): ApplicationStep[] {
  return [
    {
      title: 'Find a supervisor',
      detail:
        'Email faculty whose work matches your interests. A short, specific email with your CV gets the best replies.',
    },
    {
      title: 'Write a research proposal',
      detail:
        'Two to four pages: the question, why it matters, your method, and a realistic timeline. Your supervisor should review it.',
    },
    {
      title: `Submit to ${body}`,
      detail:
        'Upload the proposal, your academic records and the supervisor’s endorsement letter on the online form.',
    },
    {
      title: 'Present to the selection panel',
      detail:
        'Shortlisted candidates give a 10-minute presentation followed by questions. Practise with your lab mates.',
    },
  ];
}

export function talentSteps(kind: 'sports' | 'arts', body: string): ApplicationStep[] {
  const isSports = kind === 'sports';
  return [
    {
      title: isSports ? 'Collect your sports certificates' : 'Build a portfolio',
      detail: isSports
        ? 'Gather certificates from district, state or national-level competitions from the last three years.'
        : 'Select 8–12 of your strongest pieces. Quality beats quantity — include a short note on each work.',
    },
    {
      title: isSports ? 'Get a letter from your coach' : 'Write an artist statement',
      detail: isSports
        ? 'Your coach’s recommendation should mention your achievements, discipline and training schedule.'
        : 'One page on what you make, why, and what you want to explore next. Keep it personal and clear.',
    },
    {
      title: `Apply to ${body}`,
      detail:
        'Fill in the online form and upload your documents along with the supporting material.',
    },
    {
      title: isSports ? 'Attend the selection trial' : 'Attend the review session',
      detail: isSports
        ? 'Shortlisted athletes are invited to a trial. Bring original certificates and your ID.'
        : 'Shortlisted applicants discuss their work with a jury, online or in person.',
    },
  ];
}
