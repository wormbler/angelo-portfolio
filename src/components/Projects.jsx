import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import projects from "../data/projects";
import ProjectCard from "./ProjectCard";
import "./Projects.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Projects() {
  const sectionRef = useRef(null);
  const stRef = useRef(null);
  const activeIdxRef = useRef(0);
  const swipeStartRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActive = (idx) => {
    activeIdxRef.current = idx;
    setActiveIndex(idx);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const slides = gsap.utils.toArray(
        sectionRef.current.querySelectorAll(".project-slide")
      );
      const total = slides.length;
      if (total <= 1) return;

      // Desktop with sufficient height: scroll-pinned slideshow
      mm.add(
        "(min-width: 820px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.set(slides, {
            opacity: 0,
            x: 0,
            xPercent: 60,
            scale: 0.88,
            rotationY: -12,
            transformPerspective: 1200,
          });
          gsap.set(slides[0], {
            opacity: 1,
            x: 0,
            xPercent: 0,
            scale: 1,
            rotationY: 0,
          });
          updateActive(0);

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              pin: true,
              scrub: 0.35,
              start: "top top",
              end: () =>
                `+=${Math.max(window.innerHeight, sectionRef.current.offsetHeight) * ((total - 1) * 0.75)}`,
              invalidateOnRefresh: false,
              onUpdate: (self) => {
                const idx = Math.min(
                  total - 1,
                  Math.round(self.progress * (total - 1))
                );
                updateActive(idx);
              },
            },
          });

          stRef.current = tl.scrollTrigger;

          for (let i = 0; i < total - 1; i++) {
            const current = slides[i];
            const next = slides[i + 1];
            const label = `slide-${i}`;

            tl.addLabel(label)
              .to(
                current,
                {
                  opacity: 0,
                  x: 0,
                  xPercent: -60,
                  scale: 0.88,
                  rotationY: 12,
                  duration: 1,
                  ease: "none",
                },
                label
              )
              .to(
                next,
                {
                  opacity: 1,
                  x: 0,
                  xPercent: 0,
                  scale: 1,
                  rotationY: 0,
                  duration: 1,
                  ease: "none",
                },
                label
              );
          }

          ScrollTrigger.refresh();

          return () => {
            stRef.current = null;
          };
        }
      );

      // Mobile / tablet or short viewports: unpinned interactive carousel so full card height is always reachable
      mm.add(
        "(max-width: 819px) and (prefers-reduced-motion: no-preference), (max-height: 619px) and (prefers-reduced-motion: no-preference)",
        () => {
          stRef.current = null;
          const currentIdx = activeIdxRef.current;
          slides.forEach((slide, i) => {
            gsap.set(slide, {
              opacity: i === currentIdx ? 1 : 0,
              x: 0,
              xPercent: i === currentIdx ? 0 : i < currentIdx ? -45 : 45,
              scale: i === currentIdx ? 1 : 0.94,
              rotationY: 0,
              transformPerspective: 1000,
            });
          });
          ScrollTrigger.refresh();
        }
      );
    },
    { scope: sectionRef }
  );

  useEffect(() => {
    let rafId = 0;
    const handleResizeOrOrientation = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    };

    window.addEventListener("resize", handleResizeOrOrientation);
    window.addEventListener("orientationchange", handleResizeOrOrientation);
    ScrollTrigger.refresh();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResizeOrOrientation);
      window.removeEventListener("orientationchange", handleResizeOrOrientation);
    };
  }, []);

  const goToSlide = (index) => {
    const total = projects.length;
    const clamped = Math.max(0, Math.min(total - 1, index));
    const st = stRef.current;

    if (st) {
      const ratio = total > 1 ? clamped / (total - 1) : 0;
      const targetScroll = st.start + ratio * (st.end - st.start);
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
      return;
    }

    const prevIdx = activeIdxRef.current;
    if (clamped === prevIdx) return;

    const slides = sectionRef.current?.querySelectorAll(".project-slide");
    if (!slides || !slides.length) return;

    const dir = clamped > prevIdx ? 1 : -1;
    updateActive(clamped);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      slides.forEach((s, i) => {
        gsap.set(s, { opacity: i === clamped ? 1 : 0, xPercent: 0, scale: 1 });
      });
      ScrollTrigger.refresh();
      return;
    }

    gsap.to(slides[prevIdx], {
      opacity: 0,
      x: 0,
      xPercent: -45 * dir,
      scale: 0.94,
      rotationY: 0,
      duration: 0.38,
      ease: "power2.out",
      overwrite: "auto",
    });

    gsap.fromTo(
      slides[clamped],
      {
        opacity: 0,
        x: 0,
        xPercent: 45 * dir,
        scale: 0.94,
        rotationY: 0,
      },
      {
        opacity: 1,
        x: 0,
        xPercent: 0,
        scale: 1,
        rotationY: 0,
        duration: 0.42,
        ease: "power2.out",
        overwrite: "auto",
        onComplete: () => ScrollTrigger.refresh(),
      }
    );
  };

  const handleTouchStart = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e) => {
    if (!swipeStartRef.current) return;
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const dx = touch.clientX - swipeStartRef.current.x;
    const dy = touch.clientY - swipeStartRef.current.y;
    swipeStartRef.current = null;

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0 && activeIdxRef.current < projects.length - 1) {
        goToSlide(activeIdxRef.current + 1);
      } else if (dx > 0 && activeIdxRef.current > 0) {
        goToSlide(activeIdxRef.current - 1);
      }
    }
  };

  return (
    <section ref={sectionRef} className="section projects" id="projects">
      <div className="projects-header">
        <div className="projects-heading">
          <span className="label">Work</span>
          <h2 className="headline projects-title">Selected projects</h2>
        </div>

        <div className="projects-controls" aria-label="Project slideshow controls">
          <span className="projects-counter" aria-live="polite">
            <span className="projects-counter-current">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <span className="projects-counter-sep"> / </span>
            <span>{String(projects.length).padStart(2, "0")}</span>
          </span>

          <div className="projects-dots" role="tablist" aria-label="Select project slide">
            {projects.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={activeIndex === i}
                aria-label={`Go to slide ${i + 1}: ${p.title}`}
                className={`projects-dot${activeIndex === i ? " active" : ""}`}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>

          <div className="projects-arrows">
            <button
              type="button"
              className="projects-arrow"
              aria-label="Previous project"
              disabled={activeIndex === 0}
              onClick={() => goToSlide(Math.max(0, activeIndex - 1))}
            >
              &larr;
            </button>
            <button
              type="button"
              className="projects-arrow"
              aria-label="Next project"
              disabled={activeIndex === projects.length - 1}
              onClick={() => goToSlide(Math.min(projects.length - 1, activeIndex + 1))}
            >
              &rarr;
            </button>
          </div>
        </div>
      </div>

      <div
        className="projects-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handleTouchStart}
        onPointerUp={handleTouchEnd}
      >
        {projects.map((p, i) => (
          <div
            key={p.id}
            className={`project-slide${activeIndex === i ? " is-active" : ""}`}
            aria-hidden={activeIndex !== i}
          >
            <ProjectCard project={p} index={i} total={projects.length} />
          </div>
        ))}
      </div>
    </section>
  );
}
