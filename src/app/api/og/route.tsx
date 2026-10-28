import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Architecting Enterprise AI & High-ROI Automation Systems';
    const category = searchParams.get('category') || 'Full Stack AI';
    const hook = searchParams.get('hook') || 'Deterministic context engineering is the bedrock of production LLM applications.';

    // Read avatar as base64 data URI so it renders instantly in ImageResponse
    let avatarDataUri = '';
    try {
      const avatarPath = path.join(process.cwd(), 'public', 'brand-avatar.png');
      if (fs.existsSync(avatarPath)) {
        const buffer = fs.readFileSync(avatarPath);
        avatarDataUri = `data:image/png;base64,${buffer.toString('base64')}`;
      }
    } catch (e) {
      console.warn('Could not load brand avatar for OG image:', e);
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#0a0e17',
            backgroundImage:
              'radial-gradient(ellipse 90% 60% at 50% 0%, #1e293b 0%, #0a0e17 75%), linear-gradient(180deg, #111827 0%, #06090e 100%)',
            padding: '50px 70px',
            color: '#ffffff',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Subtle Brushed Metal Accent Border */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              right: '16px',
              bottom: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              pointerEvents: 'none',
            }}
          />

          {/* TOP SECTION: User Brand Portrait with Name & Theme */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              paddingBottom: '24px',
            }}
          >
            {/* Left: Avatar with Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {avatarDataUri ? (
                <img
                  src={avatarDataUri}
                  alt="Zia Ul Din"
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    border: '3px solid #e2e8f0',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.7)',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #38bdf8, #1e40af)',
                    border: '3px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    fontWeight: 'bold',
                  }}
                >
                  Z
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '32px',
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    color: '#f8fafc',
                    textShadow: '0 2px 10px rgba(0,0,0,0.6)',
                  }}
                >
                  Zia Ul Din
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#94a3b8',
                    letterSpacing: '0.02em',
                  }}
                >
                  Full Stack AI Engineer | Automation Architect | LLMs & Python
                </span>
              </div>
            </div>

            {/* Right: Category Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '8px 20px',
                borderRadius: '999px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)',
              }}
            >
              <span>⚡</span>
              <span>{category.replace('_', ' ')}</span>
            </div>
          </div>

          {/* MIDDLE SECTION: Post Title & Strategic Hook */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '20px 0' }}>
            <h1
              style={{
                fontSize: '44px',
                fontWeight: 900,
                lineHeight: 1.22,
                color: '#ffffff',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                margin: 0,
              }}
            >
              {title}
            </h1>

            <div
              style={{
                fontSize: '22px',
                lineHeight: 1.45,
                color: '#cbd5e1',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '20px 24px',
              }}
            >
              {hook}
            </div>
          </div>

          {/* BOTTOM FOOTER: Verifiable Pillars & Provenance */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <span style={{ fontSize: '15px', color: '#64748b', fontWeight: 600 }}>
                🔹 Production Next.js & Python
              </span>
              <span style={{ fontSize: '15px', color: '#64748b', fontWeight: 600 }}>
                🔹 Multi-Agent FinBots & n8n
              </span>
              <span style={{ fontSize: '15px', color: '#64748b', fontWeight: 600 }}>
                🔹 Grounded RAG & Context Engineering
              </span>
            </div>

            <div
              style={{
                fontSize: '14px',
                color: '#38bdf8',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              NexusPulse AI • Verified Page
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image: ${e.message}`, { status: 500 });
  }
}
