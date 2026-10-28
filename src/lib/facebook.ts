import { APP_CONFIG } from './config';
import { FBPageStatus } from './types';

export interface PublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
  isSimulated?: boolean;
  rawResponse?: any;
}

export interface MetaTargetVerification {
  isValidPage: boolean;
  isPersonalProfile: boolean;
  targetId: string;
  pageName?: string;
  category?: string;
  followers?: number;
  permissions?: string[];
  diagnosticMessage: string;
  remediationSteps?: string[];
}

/**
 * Validates whether the configured Facebook ID and Token correspond to an official Facebook Page
 * or an unsupported Personal Profile (as per Meta Platform Policy).
 */
export async function verifyFacebookTarget(
  targetId: string,
  accessToken: string
): Promise<MetaTargetVerification> {
  if (!targetId || !accessToken) {
    return {
      isValidPage: false,
      isPersonalProfile: false,
      targetId,
      diagnosticMessage: 'Missing Facebook Target ID or Access Token in configuration.',
      remediationSteps: [
        'Obtain a permanent Page Access Token from Meta for Developers (Graph API Explorer).',
        'Provide the numeric or vanity ID of your Facebook Business Page.',
      ],
    };
  }

  // Check if user accidentally pasted their personal profile ID (e.g. 61596194632492)
  const isLikelyProfileId = targetId === '61596194632492';

  try {
    const url = `${APP_CONFIG.fbGraphBaseUrl}/${targetId}?fields=id,name,category,fan_count,followers_count,is_published,tasks&access_token=${accessToken}`;
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();

    if (data.error) {
      // Analyze Meta error code
      // Code 100 / 200: Unsupported object or permission mismatch (classic sign of personal profile vs page)
      const errorMsg = data.error.message || '';
      const isProfileErr =
        isLikelyProfileId ||
        errorMsg.includes('pages_manage_posts') ||
        errorMsg.includes('does not exist') ||
        data.error.code === 100 ||
        data.error.code === 200;

      return {
        isValidPage: false,
        isPersonalProfile: isProfileErr,
        targetId,
        diagnosticMessage: isProfileErr
          ? `Meta Graph API strictly prohibits automated publishing to personal profiles (Target ID: ${targetId}). Meta only supports programmatic publishing to official Facebook Pages.`
          : `Facebook Graph API verification failed: ${errorMsg} (Code: ${data.error.code})`,
        remediationSteps: [
          'Meta Platform Policy strictly limits feed publishing APIs to Facebook Pages.',
          'If "Zia Ul Din (ID: 61596194632492)" is your personal profile, convert it to a Facebook Page or create a dedicated Page (e.g. "Zia-ul-din | Full Stack AI & Automation Architect").',
          'Grant the app "pages_manage_posts", "pages_read_engagement", and "pages_show_list" permissions.',
          'Select your managed Page in Graph API Explorer to generate a Page Access Token.',
        ],
      };
    }

    // Must have a category to be an official Facebook Page
    if (!data.category) {
      return {
        isValidPage: false,
        isPersonalProfile: true,
        targetId,
        pageName: data.name,
        diagnosticMessage: `Target "${data.name}" appears to be a personal user profile or group without Page publishing capabilities.`,
        remediationSteps: [
          'Create a Facebook Page for your personal brand at facebook.com/pages/create.',
          'Generate a Page Access Token with pages_manage_posts.',
        ],
      };
    }

    return {
      isValidPage: true,
      isPersonalProfile: false,
      targetId: data.id,
      pageName: data.name,
      category: data.category,
      followers: data.followers_count || data.fan_count || 0,
      permissions: data.tasks || ['pages_manage_posts', 'pages_read_engagement'],
      diagnosticMessage: `Successfully verified official Facebook Page: "${data.name}" (${data.category}). Ready for automated cloud publishing.`,
    };
  } catch (err: any) {
    return {
      isValidPage: false,
      isPersonalProfile: false,
      targetId,
      diagnosticMessage: `Network error verifying Meta Graph API: ${err.message}`,
      remediationSteps: ['Check internet connectivity and verify Facebook Graph API status.'],
    };
  }
}

/**
 * Checks overall Facebook connection status using environment variables or stored settings
 */
export async function checkFacebookConnection(): Promise<FBPageStatus> {
  const pageId = process.env.FB_PAGE_ID;
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    return {
      connected: false,
      isProfileDetected: false,
      error: 'Facebook Page credentials not configured. Set FB_PAGE_ID & FB_PAGE_ACCESS_TOKEN.',
    };
  }

  const verification = await verifyFacebookTarget(pageId, accessToken);

  if (!verification.isValidPage) {
    return {
      connected: false,
      isProfileDetected: verification.isPersonalProfile,
      pageId,
      error: verification.diagnosticMessage,
    };
  }

  return {
    connected: true,
    isProfileDetected: false,
    pageId: verification.targetId,
    pageName: verification.pageName,
    category: verification.category,
    followers: verification.followers,
    permissions: verification.permissions,
  };
}

/**
 * Publishes content directly to a verified Facebook Page using the official Meta Graph API.
 */
export async function publishToFacebookPage(
  message: string,
  imageUrl?: string,
  idempotencyKey?: string
): Promise<PublishResult> {
  const pageId = process.env.FB_PAGE_ID;
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

  // If no credentials configured yet, return a clean simulation indicator for test runs
  if (!pageId || !accessToken) {
    console.warn('Facebook credentials not configured. Running in safe simulation test mode.');
    const simulatedId = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      success: true,
      postId: simulatedId,
      postUrl: `https://facebook.com/simulated_post/${simulatedId}`,
      isSimulated: true,
    };
  }

  // Pre-check for personal profile to avoid Meta account bans or API lockouts
  if (pageId === '61596194632492') {
    return {
      success: false,
      error:
        'Blocked by Meta Graph API: Target 61596194632492 is a Personal Profile. Programmatic posting is only permitted on Facebook Pages. Please connect a Facebook Page.',
    };
  }

  try {
    let endpoint = `${APP_CONFIG.fbGraphBaseUrl}/${pageId}/feed`;
    const payload: Record<string, string> = {
      access_token: accessToken,
    };

    // If an image URL is supplied, use /photos endpoint for higher organic reach
    if (imageUrl && !imageUrl.startsWith('/')) {
      endpoint = `${APP_CONFIG.fbGraphBaseUrl}/${pageId}/photos`;
      payload.url = imageUrl;
      payload.caption = message;
    } else {
      payload.message = message;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(payload).toString(),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Meta Facebook Graph API Publish Error:', data.error);
      return {
        success: false,
        error: `${data.error.message} (Code: ${data.error.code}${
          data.error.error_subcode ? `, Subcode: ${data.error.error_subcode}` : ''
        })`,
        rawResponse: data,
      };
    }

    const postId = data.id || data.post_id;
    const postUrl = `https://www.facebook.com/${postId}`;

    return {
      success: true,
      postId,
      postUrl,
      rawResponse: data,
    };
  } catch (err: any) {
    console.error('Network exception during Facebook publication:', err);
    return {
      success: false,
      error: `Network exception while publishing to Meta Graph API: ${err.message}`,
    };
  }
}

/**
 * Fetches real engagement metrics (reach, impressions, reactions, comments) where allowed by Meta
 */
export async function fetchPostMetrics(
  pageId: string,
  fbPostId: string,
  accessToken: string
) {
  try {
    const url = `${APP_CONFIG.fbGraphBaseUrl}/${fbPostId}?fields=shares,comments.summary(true),reactions.summary(true)&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return {
        metricsAvailable: false,
        reactions: 0,
        comments: 0,
        shares: 0,
      };
    }

    return {
      metricsAvailable: true,
      reactions: data.reactions?.summary?.total_count || 0,
      comments: data.comments?.summary?.total_count || 0,
      shares: data.shares?.count || 0,
      reach: null, // Insights require pages_read_user_content and Page review
      impressions: null,
    };
  } catch (err) {
    return {
      metricsAvailable: false,
      reactions: 0,
      comments: 0,
      shares: 0,
    };
  }
}
