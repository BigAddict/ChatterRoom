#!/usr/bin/env node

/**
 * Pirate Devs — Automated GitHub Org & Team Invitation Script
 *
 * Reads roster.csv, deduplicates entries, creates missing track teams,
 * and sends organization invitations with direct team assignments.
 *
 * Usage:
 *   $env:GITHUB_TOKEN="ghp_your_token_here"  (PowerShell)
 *   node scripts/invite-devs.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const ORG = 'PiratesOfDevs';
const TOKEN = process.env.GITHUB_TOKEN;
const CSV_PATH = process.env.ROSTER_PATH || path.resolve(process.cwd(), 'roster.csv');

if (!TOKEN) {
  console.error('❌ Error: Missing GITHUB_TOKEN environment variable.');
  console.error('Generate a Classic token with "admin:org" scope at: https://github.com/settings/tokens');
  console.error('Run: $env:GITHUB_TOKEN="ghp_xxx" (Windows PowerShell) or export GITHUB_TOKEN="ghp_xxx" (Linux/macOS)');
  process.exit(1);
}

if (!fs.existsSync(CSV_PATH)) {
  console.error(`❌ Error: CSV file not found at ${CSV_PATH}`);
  console.error('Please export your Google Sheet as "roster.csv" and place it in the project root.');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
};

// 1. Parse CSV & deduplicate by email (latest entry wins)
function parseRoster(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  const rows = lines.slice(1).map((line) => {
    const cols = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map((c) => c.replace(/^"|"$/g, '').trim()) || [];
    const rawUser = cols[2] || '';
    const email = (cols[3] || '').toLowerCase();
    const track = cols[4] || '';

    const username = rawUser
      .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
      .replace(/^@/, '')
      .replace(/\/$/, '')
      .trim();

    return { username, email, track };
  });

  const deduped = new Map();
  for (const row of rows) {
    if (!row.username || !row.email) continue;
    deduped.set(row.email, row);
  }
  return Array.from(deduped.values());
}

// 2. Ensure the 5 track teams exist and return { slug: id }
async function ensureTeams() {
  const slugs = ['frontend', 'backend', 'crypto', 'qa-devops', 'docs'];
  const res = await fetch(`https://api.github.com/orgs/${ORG}/teams?per_page=50`, { headers });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to list teams for ${ORG}: ${err}`);
  }
  const existing = await res.json();
  const teamMap = {};

  for (const t of existing) teamMap[t.slug] = t.id;

  for (const slug of slugs) {
    if (!teamMap[slug]) {
      const createRes = await fetch(`https://api.github.com/orgs/${ORG}/teams`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: slug, privacy: 'closed' }),
      });
      const created = await createRes.json();
      teamMap[slug] = created.id;
      console.log(`✨ Created team: @${ORG}/${slug} (ID: ${created.id})`);
    } else {
      console.log(`✔️ Team @${ORG}/${slug} exists (ID: ${teamMap[slug]})`);
    }
  }
  return teamMap;
}

function mapTrackToSlug(trackText) {
  if (trackText.includes('Frontend')) return 'frontend';
  if (trackText.includes('Backend')) return 'backend';
  if (trackText.includes('Crypto')) return 'crypto';
  if (trackText.includes('QA')) return 'qa-devops';
  return 'docs';
}

async function run() {
  const roster = parseRoster(fs.readFileSync(CSV_PATH, 'utf8'));
  console.log(`📋 Found ${roster.length} unique builders in ${CSV_PATH}.\nVerifying teams...`);

  const teamMap = await ensureTeams();
  console.log(`\n🚀 Processing invitations for ${roster.length} builders...\n`);

  let invited = 0;
  let skipped = 0;
  let failed = 0;

  for (const dev of roster) {
    // Look up GitHub user ID
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(dev.username)}`, { headers });
    if (!userRes.ok) {
      console.log(`❌ INVALID USERNAME: "${dev.username}" (${dev.email}) — contact manually on WhatsApp`);
      failed++;
      continue;
    }
    const userData = await userRes.json();
    const teamSlug = mapTrackToSlug(dev.track);
    const teamId = teamMap[teamSlug];

    // Send Org invite + assign Team
    const invRes = await fetch(`https://api.github.com/orgs/${ORG}/invitations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        invitee_id: userData.id,
        role: 'direct_member',
        team_ids: [teamId],
      }),
    });

    if (invRes.ok) {
      console.log(`✅ Invited @${dev.username} -> @${ORG}/${teamSlug}`);
      invited++;
    } else {
      const err = await invRes.json();
      console.log(`⚠️  Skipped @${dev.username}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n🎉 Summary: ${invited} invited, ${skipped} skipped (already members/pending), ${failed} failed.`);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
