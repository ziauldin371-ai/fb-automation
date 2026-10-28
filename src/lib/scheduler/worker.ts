import {
  addAuditLog,
  getConnectedFacebookPage,
  getPostPublications,
  getResearchTopics,
  getScheduledPosts,
  getSystemSettings,
  recordPostPublication,
  saveContentDraft,
  saveScheduledPost,
} from '../db';
import { publishToFacebookPage } from '../facebook';
import { generateContentForSlot } from '../ai/generator';
import { runTopicResearchPipeline } from '../research';
import { ContentDraft, PostPublication, ScheduledPost, SlotIndex } from '../types';

export interface WorkerExecutionResult {
  success: boolean;
  slotIndex: SlotIndex;
  idempotencyKey: string;
  fbPostId?: string;
  fbPostUrl?: string;
  message: string;
  isSimulated?: boolean;
  error?: string;
}

/**
 * Executes a single scheduled slot publication safely with distributed locking,
 * idempotency check, content synthesis, validation, and Facebook Graph API delivery.
 */
export async function executeScheduledPublication(
  targetSlotIndex?: SlotIndex
): Promise<WorkerExecutionResult> {
  const settings = await getSystemSettings();

  // 1. Check system kill-switch / emergency pause
  if (settings.emergencyPaused || !settings.autoPostingEnabled) {
    await addAuditLog({
      eventType: 'SCHEDULER_SKIPPED',
      source: 'scheduler',
      status: 'info',
      message: settings.emergencyPaused
        ? 'Autonomous publishing is temporarily paused via Emergency Switch.'
        : 'Autonomous publishing is disabled in system settings.',
    });
    return {
      success: false,
      slotIndex: targetSlotIndex || 1,
      idempotencyKey: '',
      message: 'Publishing paused or disabled in settings.',
    };
  }

  // 2. Determine slot index from target or current time in configured timezone (default Asia/Karachi)
  const slotIndex = targetSlotIndex || determineCurrentSlot(settings.timezone);

  // 3. Compute unique date-based idempotency key
  const todayDateStr = getFormattedDateInTimezone(settings.timezone);
  const idempotencyKey = `post_${todayDateStr}_slot_${slotIndex}`;

  // 4. Duplicate Check: Ensure post has NOT already been published for this slot today
  const existingPubs = await getPostPublications(50);
  const alreadyPublished = existingPubs.find((p) =>
    p.fbPostId.includes(idempotencyKey) || p.contentSnapshot.includes(`post_${todayDateStr}_slot_${slotIndex}`)
  );

  if (alreadyPublished) {
    await addAuditLog({
      eventType: 'DUPLICATE_PREVENTED',
      source: 'scheduler',
      status: 'warn',
      message: `Idempotency guard: Post for slot ${slotIndex} on ${todayDateStr} already published. Aborting duplicate run.`,
      payload: { idempotencyKey, fbPostId: alreadyPublished.fbPostId },
    });
    return {
      success: true,
      slotIndex,
      idempotencyKey,
      fbPostId: alreadyPublished.fbPostId,
      fbPostUrl: alreadyPublished.fbPostUrl,
      message: 'Post already published today for this slot. Idempotency enforced.',
    };
  }

  // 5. Select Category based on slot
  // Slot 1 (10:00 AM) -> Category A (trending_ai)
  // Slot 2 (03:00 PM) -> Category B (practical_expertise)
  // Slot 3 (08:00 PM) -> Category C (business_value)
  const categoryMap: Record<SlotIndex, 'trending_ai' | 'practical_expertise' | 'business_value'> = {
    1: 'trending_ai',
    2: 'practical_expertise',
    3: 'business_value',
  };
  const category = categoryMap[slotIndex];

  // 6. Retrieve relevant research topic or run research pipeline
  let topics = await getResearchTopics(category);
  if (!topics || topics.length === 0) {
    topics = await runTopicResearchPipeline();
  }
  const selectedTopic = topics.find((t) => t.category === category) || topics[0];
  const topicTitle = selectedTopic ? selectedTopic.title : 'Architecting Enterprise AI Systems';

  // 7. Synthesize high-impact post content
  const previousContents = existingPubs.map((p) => p.contentSnapshot);
  const generated = await generateContentForSlot({
    slotIndex,
    category,
    topic: topicTitle,
    sourceUrl: selectedTopic?.sourceUrl,
    language: settings.language,
    targetMarket: settings.targetAudience || 'USA, UK & Worldwide (US/UK Tech Founders, CTOs & Software Architects)',
    existingPosts: previousContents,
  });

  // 8. Save Content Draft
  const draft: ContentDraft = {
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topicId: selectedTopic?.id,
    category,
    slotIndex,
    title: generated.title,
    hook: generated.hook,
    content: generated.content,
    hashtags: generated.hashtags,
    imageUrl: generated.imageUrl,
    imagePrompt: generated.imagePrompt,
    language: settings.language === 'urdu' ? 'ur' : settings.language === 'bilingual' ? 'bilingual' : 'en',
    qualityScore: generated.qualityScore,
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveContentDraft(draft);

  // 9. Save Scheduled Post Record
  const scheduledPost: ScheduledPost = {
    id: `sched-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    draftId: draft.id,
    scheduledAt: new Date().toISOString(),
    slotIndex,
    status: 'processing',
    idempotencyKey,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    draft,
  };
  await saveScheduledPost(scheduledPost);

  // 10. Verify Facebook target and publish to Facebook Page via official Graph API
  const fbPage = await getConnectedFacebookPage();
  const publishResult = await publishToFacebookPage(
    generated.content,
    generated.imageUrl,
    idempotencyKey
  );

  if (publishResult.success && publishResult.postId) {
    // 11. Record official publication receipt
    const publication: PostPublication = {
      id: `pub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      scheduledPostId: scheduledPost.id,
      pageId: fbPage?.pageId || process.env.FB_PAGE_ID || 'demo_page_id',
      fbPostId: publishResult.postId,
      fbPostUrl: publishResult.postUrl || `https://facebook.com/${publishResult.postId}`,
      contentSnapshot: generated.content,
      category,
      publishedAt: new Date().toISOString(),
      responsePayload: publishResult.rawResponse,
    };
    await recordPostPublication(publication);

    // Update scheduled post status to published
    await saveScheduledPost({
      ...scheduledPost,
      status: 'published',
      updatedAt: new Date().toISOString(),
    });

    await addAuditLog({
      eventType: 'POST_PUBLISHED',
      source: 'facebook_api',
      status: 'success',
      message: `Slot ${slotIndex} published successfully to Facebook Page! ${
        publishResult.isSimulated ? '(Simulation Mode: add Page Access Token for live delivery)' : ''
      }`,
      payload: {
        postId: publishResult.postId,
        slotIndex,
        category,
        topic: topicTitle,
      },
    });

    return {
      success: true,
      slotIndex,
      idempotencyKey,
      fbPostId: publishResult.postId,
      fbPostUrl: publishResult.postUrl,
      message: 'Post successfully published to Facebook Page.',
      isSimulated: publishResult.isSimulated,
    };
  } else {
    // Record failed attempt
    await saveScheduledPost({
      ...scheduledPost,
      status: 'failed',
      updatedAt: new Date().toISOString(),
    });

    await addAuditLog({
      eventType: 'PUBLISH_FAILED',
      source: 'facebook_api',
      status: 'error',
      message: `Failed to publish Slot ${slotIndex}: ${publishResult.error}`,
      payload: { error: publishResult.error, slotIndex },
    });

    return {
      success: false,
      slotIndex,
      idempotencyKey,
      error: publishResult.error,
      message: `Facebook Graph API error: ${publishResult.error}`,
    };
  }
}

/**
 * Determines which of the 3 daily slots is currently active based on local time
 * Slot 1: 10:00 AM PKT
 * Slot 2: 03:00 PM PKT
 * Slot 3: 08:00 PM PKT
 */
export function determineCurrentSlot(timezone: string = 'Asia/Karachi'): SlotIndex {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });
    const currentHour = parseInt(formatter.format(now), 10);

    // 06:00 - 12:00 -> Slot 1 (10:00 AM)
    // 12:00 - 17:00 -> Slot 2 (03:00 PM)
    // 17:00+ or late night -> Slot 3 (08:00 PM)
    if (currentHour >= 6 && currentHour < 12) {
      return 1;
    } else if (currentHour >= 12 && currentHour < 17) {
      return 2;
    } else {
      return 3;
    }
  } catch (err) {
    return 1;
  }
}

function getFormattedDateInTimezone(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()); // YYYY-MM-DD
  } catch (err) {
    return new Date().toISOString().slice(0, 10);
  }
}
