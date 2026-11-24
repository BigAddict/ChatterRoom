#!/usr/bin/env node

/**
 * Pirate Devs — Automated AI Pull Request Reviewer
 *
 * Fetches the PR diff, sends it to Groq Llama-3-70B for analysis,
 * checks for breaking bugs, security issues, and best practices,
 * and posts a constructive review comment on the PR.
 */

import { execSync } from 'node:child_process';

const PR_NUMBER = process.env.PR_NUMBER;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!PR_NUMBER) {
  console.error('Missing PR_NUMBER environment variable');
  process.exit(1);
}

if (!GROQ_API_KEY) {
  console.log('GROQ_API_KEY not configured. Skipping automated AI review.');
  process.exit(0);
}

async function reviewPR() {
  console.log(`🔍 Fetching diff for PR #${PR_NUMBER}...`);
  let diff = '';
  try {
    diff = execSync(`gh pr diff ${PR_NUMBER}`, { maxBuffer: 10 * 1024 * 1024 }).toString();
  } catch (err) {
    console.error('Failed to get PR diff:', err.message);
    process.exit(1);
  }

  if (!diff || diff.trim().length === 0) {
    console.log('No diff found. Skipping review.');
    return;
  }

  // Truncate diff if massive to fit context window
  const truncatedDiff = diff.slice(0, 15000);

  const systemPrompt = `You are an expert senior code reviewer for "ChatterRoom", an open-source, zero-storage end-to-end encrypted (E2EE) WebSocket chat app by Pirate Devs.
Your job is to provide concise, friendly, and constructive reviews for open-source contributors.

Guidelines:
1. Check for security flaws:
   - Server must NEVER store or log message plaintext.
   - Keys must only exist in browser memory or URL hash.
   - Web Crypto API (SubtleCrypto) must be used directly.
2. Check for code quality:
   - TypeScript types, error handling, clean modular architecture.
   - No unnecessary dependencies.
3. Be encouraging and respectful: contributors are learning and building together.
4. Conclude with a clear verdict:
   - "✅ **Verdict: Ready to Merge**" OR
   - "⚠️ **Verdict: Changes Requested** (with actionable code fixes)"`;

  const userPrompt = `Please review this Pull Request diff for ChatterRoom:

\`\`\`diff
${truncatedDiff}
\`\`\`

Format your review in GitHub Markdown with:
### 🏴‍☠️ Pirate Devs AI Code Review
- **Summary**: (1-2 sentences)
- **Strengths**: (What was done well)
- **Suggestions / Fixes**: (If any, provide code snippets)
- **Verdict**: (Ready to merge / Changes requested)`;

  console.log('🤖 Sending diff to Groq Llama-3-70B...');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq API error:', errorText);
    return;
  }

  const data = await response.json();
  const reviewContent = data.choices?.[0]?.message?.content?.trim();

  if (!reviewContent) {
    console.log('No review generated.');
    return;
  }

  console.log('💬 Posting review comment on GitHub PR...');

  // Write review to temporary file to avoid shell escaping issues
  const fs = await import('node:fs');
  fs.writeFileSync('pr_review.md', reviewContent, 'utf8');

  try {
    execSync(`gh pr comment ${PR_NUMBER} --body-file pr_review.md`);
    console.log(`✅ Review posted successfully to PR #${PR_NUMBER}!`);
  } catch (err) {
    console.error('Failed to post PR comment:', err.message);
  } finally {
    if (fs.existsSync('pr_review.md')) fs.unlinkSync('pr_review.md');
  }
}

reviewPR().catch(console.error);
