#!/usr/bin/env node
// Script to get IPv4 address for Supabase database

import dns from 'dns/promises';

const hostname = 'db.bykeincoqjgrderdikvg.supabase.co';

try {
  const addresses = await dns.resolve4(hostname);
  console.log(`IPv4 addresses for ${hostname}:`);
  addresses.forEach(addr => console.log(`  ${addr}`));
  
  if (addresses.length > 0) {
    const newUrl = `postgresql://postgres:LJqibY5d91xpDhrL@${addresses[0]}:5432/postgres`;
    console.log('\nUse this DATABASE_URL in Render:');
    console.log(newUrl);
  }
} catch (error) {
  console.error('Error resolving hostname:', error);
}