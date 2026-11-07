/** Plain-English explanations for jargon shown via glossary tooltips. */
export const GLOSSARY: Record<string, string> = {
  'Bonafide Certificate':
    'A letter from your college confirming you are currently enrolled there. Ask your college office — it usually takes 1–3 days.',
  'Income Certificate':
    'An official document from your local revenue office (tehsildar) stating your family’s total yearly income. Often valid for one financial year only.',
  Renewable:
    'You can keep receiving this scholarship in later years if you continue to meet the conditions (usually minimum marks and attendance).',
  'Statement of Purpose':
    'A short essay (usually 500–800 words) about who you are, what you want to study and why. Be specific and honest.',
  'Recommendation Letter':
    'A letter from a teacher, professor or coach vouching for you. Ask at least two weeks before the deadline.',
  'Caste Certificate':
    'An official certificate confirming your caste or community category, issued by your state government.',
  'Disability Certificate':
    'A certificate (or UDID card) from a government medical authority stating the type and percentage of disability.',
  DBT: 'Direct Benefit Transfer — the scholarship amount is paid straight into your Aadhaar-linked bank account.',
  'Full tuition':
    'The scholarship pays your entire tuition fee for the year, directly to the institution.',
  'One-time': 'Paid once, not every year.',
};

/** One-line "where do I get this?" help for each document in the Vault. */
export const DOC_HINTS: Record<import('@/types').DocType, string> = {
  Aadhaar: 'Your 12-digit UIDAI ID. Download the e-Aadhaar PDF from the official UIDAI site.',
  Photo: 'Recent passport-size photo on a plain light background, as a JPG under 100 KB.',
  Marksheet: 'Your most recent exam or semester marksheet, attested if the scholarship asks.',
  'Income Certificate':
    'Issued by your tehsil / revenue office. Usually valid for the current financial year only.',
  'Bonafide Certificate':
    'Request it from your college office — it proves you are currently enrolled.',
  'Bank Passbook': 'First page of a passbook in your own name, with the account linked to Aadhaar.',
  'Caste Certificate': 'Issued by your state government. Keep a scanned copy of both sides.',
  'Recommendation Letter': 'From a teacher, professor or coach on letterhead, signed and dated.',
  'Statement of Purpose':
    'A 500–800 word personal essay. Keep a master draft you adapt per scholarship.',
  'Disability Certificate': 'From a government medical board, or your UDID card.',
};
