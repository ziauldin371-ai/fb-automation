// Autonomous Local Background Scheduler for NexusPulse AI Autoposter
// Target Audience: USA, UK & Worldwide (08:00 UTC, 13:00 UTC, 18:00 UTC)

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'dev_secret_key_123';
const POLL_INTERVAL_MS = 60 * 1000; // Check every 60 seconds

console.log('='.repeat(65));
console.log('🚀 NexusPulse AI Autoposter — Autonomous Background Worker');
console.log('👤 Brand: Zia Ul Din | Full Stack AI & Automation Architect');
console.log('🌍 Target Audience: USA, UK & Worldwide Tech Leaders');
console.log('⏰ Calibrated Peak Slots (UTC):');
console.log('   - Slot 1: 08:00 UTC (09:00 AM London | 04:00 AM NY/EST)');
console.log('   - Slot 2: 13:00 UTC (09:00 AM NY/EST | 02:00 PM London)');
console.log('   - Slot 3: 18:00 UTC (11:00 AM SF/PST | 02:00 PM NY/EST)');
console.log(`🌐 Base URL: ${BASE_URL}`);
console.log('='.repeat(65));

const executedToday = new Set();

function getCurrentDateStr() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentUtcTimeStr() {
  const d = new Date();
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

async function triggerSlot(slotIndex, reason = 'scheduled_time') {
  const today = getCurrentDateStr();
  const key = `${today}_slot_${slotIndex}`;

  if (executedToday.has(key)) {
    return;
  }

  console.log(`\n[${new Date().toISOString()}] ⚡ Triggering Slot ${slotIndex} (${reason})...`);
  try {
    const res = await fetch(`${BASE_URL}/api/cron/worker?slot=${slotIndex}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRON_SECRET}`,
      },
    });
    const data = await res.json();

    if (data.success) {
      executedToday.add(key);
      console.log(`✅ [Slot ${slotIndex}] Success!`);
      console.log(`   Post ID: ${data.fbPostId}`);
      console.log(`   Mode: ${data.isSimulated ? 'Simulation (Ready for live Page Token)' : 'Live Facebook Page'}`);
      console.log(`   URL: ${data.fbPostUrl}`);
    } else {
      console.warn(`⚠️ [Slot ${slotIndex}] Worker note: ${data.message || data.error}`);
    }
  } catch (err) {
    console.error(`❌ [Slot ${slotIndex}] Network error connecting to dev server: ${err.message}`);
  }
}

async function checkAndExecute() {
  const utcTime = getCurrentUtcTimeStr();
  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentMin = now.getUTCMinutes();

  // Match 08:00 UTC (Slot 1)
  if (currentHour === 8 && currentMin === 0) {
    await triggerSlot(1, '08:00 UTC Peak UK/EU');
  }
  // Match 13:00 UTC (Slot 2)
  else if (currentHour === 13 && currentMin === 0) {
    await triggerSlot(2, '13:00 UTC Peak US East & UK Midday');
  }
  // Match 18:00 UTC (Slot 3)
  else if (currentHour === 18 && currentMin === 0) {
    await triggerSlot(3, '18:00 UTC Peak Silicon Valley & US West');
  }
}

// Check if user requested an immediate trigger on launch via args (e.g. node scripts/auto-runner.mjs --now)
const args = process.argv.slice(2);
if (args.includes('--now') || args.includes('--immediate')) {
  console.log('\n⚡ Immediate startup trigger requested. Running active slot now...');
  const currentHour = new Date().getUTCHours();
  let startupSlot = 1;
  if (currentHour >= 12 && currentHour < 17) startupSlot = 2;
  else if (currentHour >= 17 || currentHour < 6) startupSlot = 3;

  triggerSlot(startupSlot, 'immediate_startup_flag');
}

// Start recurring loop
setInterval(checkAndExecute, POLL_INTERVAL_MS);
console.log(`\n⏳ Background worker active. Listening for UTC slot windows (Polling every 60s)...\n`);
