import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mountain, Users, Bookmark, Compass, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const SwipeSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const horizRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const horiz = horizRef.current;
    if (!container || !horiz) return;

    const panels = Array.from(horiz.querySelectorAll<HTMLElement>(".panel-horizontal"));
    if (panels.length === 0) return;

    ScrollTrigger.getAll().forEach((t) => t.kill());

    const totalHorizontalScreens = panels.length;

    const tween = gsap.to(horiz, {
      xPercent: -100 * (totalHorizontalScreens - 1),
      ease: "none",
    });

    const st = ScrollTrigger.create({
      animation: tween,
      trigger: container,
      start: "top top",
      pin: true,
      end: () => `+=${totalHorizontalScreens * window.innerHeight}`,
      scrub: 0.6,
      invalidateOnRefresh: true,
    });

    return () => {
      st.kill();
      tween.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; box-sizing: border-box; min-height: 100vh; }
        * { box-sizing: inherit; }

        .swipe-section-container {
          width: 100%;
          font-family: 'Satoshi-Variable', -apple-system, sans-serif;
        }

        .horizontal-wrap {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }

        .horizontal-inner {
          display: flex;
          width: 100%;
          height: 100%;
          will-change: transform;
        }

        .panel-horizontal {
          flex: 0 0 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem clamp(2rem, 8vw, 8rem);
          position: relative;
          overflow: hidden;
        }

        .panel-horizontal::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(122, 155, 118, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(168, 185, 156, 0.3) 0%, transparent 50%);
          pointer-events: none;
        }

        .panel-1 { 
          background: var(--sand);
          color: var(--slate);
        }
        
        .panel-2 { 
          background: var(--slate);
          color: var(--sand);
        }
        
        .panel-3 { 
          background: var(--sand);
          color: (--slate);
        }

        .panel-content {
          max-width: 900px;
          width: 100%;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          opacity: 0.7;
        }

        .panel-title {
          font-size: clamp(2.5rem, 6vw, 5rem);
          font-weight: 800;
          line-height: 1.1;
          margin: 0 0 1.5rem 0;
          letter-spacing: -0.02em;
        }

        .panel-description {
          font-size: clamp(1rem, 2vw, 1.25rem);
          line-height: 1.6;
          opacity: 0.8;
          max-width: 600px;
          margin: 0 0 2rem 0;
        }

        .icon-badge {
          width: 4rem;
          height: 4rem;
          border-radius: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .panel-1 .icon-badge { background: rgba(122, 155, 118, 0.15); }
        .panel-2 .icon-badge { background: rgba(168, 185, 156, 0.15); }
        .panel-3 .icon-badge { background: rgba(255, 255, 255, 0.15); }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1.5rem;
          margin-top: 3rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .vertical-panel {
          width: 100%;
          background: linear-gradient(180deg, #2C3E2E 0%, #1a2620 100%);
          color: #F5F3EF;
          min-height: 100vh;
          padding: clamp(4rem, 10vh, 8rem) clamp(2rem, 8vw, 8rem);
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .vertical-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 30% 20%, rgba(122, 155, 118, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(168, 185, 156, 0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .vertical-content {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .vertical-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 3rem;
          margin-top: 4rem;
        }

        .feature-card {
          padding: 2.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.5rem;
          backdrop-filter: blur(10px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(122, 155, 118, 0.3);
          transform: translateY(-4px);
        }

        .feature-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 1rem;
          background: linear-gradient(135deg, #7A9B76, #A8B99C);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
        }

        .feature-description {
          font-size: 1rem;
          line-height: 1.6;
          opacity: 0.8;
          margin: 0;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #D87855, #E8A87C);
          color: white;
          font-weight: 700;
          font-size: 1rem;
          border: none;
          border-radius: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 2rem;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(216, 120, 85, 0.4);
        }

        @media (max-width: 768px) {
          .panel-title { font-size: 2.5rem; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .vertical-grid { grid-template-columns: 1fr; gap: 2rem; }
        }
      `}</style>

      <div ref={containerRef} className="swipe-section-container">
        <div className="horizontal-wrap">
          <div ref={horizRef} className="horizontal-inner">

            {/* Panel 1: Hero */}
            <section className="panel-horizontal panel-1">
              <div className="panel-content">
                <div className="icon-badge">
                  <Mountain size={32} strokeWidth={2} />
                </div>
                <div className="eyebrow">
                  <Compass size={14} />
                  <span>Your Next Adventure</span>
                </div>
                <h2 className="panel-title">
                  Adventure Starts Here
                </h2>
                <p className="panel-description">
                  Hikee connects you to wild nature, passionate explorers, and the trails that await. Discover, share, explore.
                </p>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-number">2.5K+</div>
                    <div className="stat-label">Trails</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">15K+</div>
                    <div className="stat-label">Hikers</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">8</div>
                    <div className="stat-label">Countries</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Panel 2: Share */}
            <section className="panel-horizontal panel-2">
              <div className="panel-content">
                <div className="icon-badge">
                  <Users size={32} strokeWidth={2} />
                </div>
                <div className="eyebrow">
                  <span>Community</span>
                </div>
                <h2 className="panel-title">
                  Share Your Adventures
                </h2>
                <p className="panel-description">
                  Turn your hikes into inspiration. Post your routes, photos, tips, and hidden gems. Hikee is powered by a community of passionate explorers — like you.
                </p>
              </div>
            </section>

            {/* Panel 3: Save */}
            <section className="panel-horizontal panel-3">
              <div className="panel-content">
                <div className="icon-badge">
                  <Bookmark size={32} strokeWidth={2} />
                </div>
                <div className="eyebrow">
                  <span>Organization</span>
                </div>
                <h2 className="panel-title">
                  Save, Plan, Go
                </h2>
                <p className="panel-description">
                  Found a trail you love? Save it. Build your personal hiking list, plan your next adventure, and never lose track of the paths that inspire you.
                </p>
              </div>
            </section>

          </div>
        </div>

        {/* Vertical Panel: Discovery */}
        <section className="vertical-panel">
          <div className="vertical-content">
            <h2 className="panel-title">
              Discover Like Never Before
            </h2>
            <p className="panel-description" style={{ maxWidth: '800px' }}>
              From the Alps to the Atlantic, Hikee is your gateway to the most breathtaking hikes across France and Europe.
            </p>

            <div className="vertical-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <Mountain size={24} color="white" />
                </div>
                <h3 className="feature-title">Smart Search</h3>
                <p className="feature-description">
                  Find your ideal trail by region, difficulty, or atmosphere. Waterfalls, panoramas, or mysterious forests — we have the path for you.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Users size={24} color="white" />
                </div>
                <h3 className="feature-title">Local Guides</h3>
                <p className="feature-description">
                  Get tips from experts and passionate hikers. Each trail is enriched by the community with photos and recommendations.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Compass size={24} color="white" />
                </div>
                <h3 className="feature-title">GPS Navigation</h3>
                <p className="feature-description">
                  Track your progress in real-time with detailed maps and precise directions. Never lose your way.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default SwipeSection;
