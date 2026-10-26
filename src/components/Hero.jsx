import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./Hero.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Hero() {
  const root = useRef(null);
  const scrollCueRef = useRef(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".hero-glow", {
          scale: 1.25,
          opacity: 0.9,
          duration: 4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        // Staggered entrance under ~1.2s (~1.03s total)
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(".hero-avatar-wrap", { y: 18, opacity: 0, duration: 0.4 }, 0)
          .from(".hero-eyebrow", { y: 14, opacity: 0, duration: 0.35 }, 0.1)
          .from(
            ".hero-line-inner",
            { yPercent: 108, duration: 0.55, stagger: 0.08, ease: "power4.out" },
            0.2
          )
          .from(".hero-tagline", { y: 16, opacity: 0, duration: 0.4 }, 0.42)
          .from(
            ".hero-btn-wrap",
            { y: 16, opacity: 0, duration: 0.4, stagger: 0.08 },
            0.52
          )
          .from(
            scrollCueRef.current,
            { y: 10, opacity: 0, duration: 0.35 },
            0.65
          );

        gsap.to(".hero-scroll-arrow", {
          y: 4,
          duration: 0.9,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      const cue = scrollCueRef.current;
      let cueHidden = false;
      const onScroll = () => {
        if (!cue) return;
        const shouldHide = window.scrollY > 40;
        if (shouldHide === cueHidden) return;
        cueHidden = shouldHide;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        gsap.to(cue, {
          opacity: shouldHide ? 0 : 1,
          y: shouldHide ? 8 : 0,
          duration: reduced ? 0 : 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      ScrollTrigger.refresh();

      return () => {
        window.removeEventListener("scroll", onScroll);
      };
    },
    { scope: root }
  );

  return (
    <section ref={root} className="hero" id="home">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-avatar-wrap">
          <div className="hero-avatar">
            {avatarFailed ? (
              <span
                className="hero-avatar-fallback"
                role="img"
                aria-label="Angelo Ang initial"
              >
                A
              </span>
            ) : (
              <img
                src="/avatar.jpg"
                alt="Portrait of Angelo Ang, full-stack learner from Davao, Philippines"
                width="148"
                height="148"
                loading="eager"
                fetchPriority="high"
                onLoad={() => ScrollTrigger.refresh()}
                onError={() => setAvatarFailed(true)}
              />
            )}
          </div>
        </div>

        <p className="hero-eyebrow">
          <span className="label">Full-stack learner · Davao, PH</span>
        </p>

        <h1 className="headline hero-title">
          <span className="hero-line">
            <span className="hero-line-inner">I build things</span>
          </span>
          <span className="hero-line">
            <span className="hero-line-inner">
              that <span className="hero-accent">move.</span>
            </span>
          </span>
        </h1>

        <p className="hero-tagline">
          Full-stack learner building with Node.js and React, now adding motion with GSAP.
        </p>

        <div className="hero-actions">
          <span className="hero-btn-wrap">
            <a className="btn" href="#projects">
              View projects
            </a>
          </span>
          <span className="hero-btn-wrap">
            <a className="btn btn-outline" href="#contact">
              Contact me
            </a>
          </span>
        </div>
      </div>

      <div ref={scrollCueRef} className="hero-scroll-cue" aria-hidden="true">
        <span className="hero-scroll-text">Scroll</span>
        <svg
          className="hero-scroll-arrow"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
