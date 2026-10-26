import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./About.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function About() {
  const sectionRef = useRef(null);
  const ctaLinkRef = useRef(null);
  const [imgFailed, setImgFailed] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const mediaWrap = sectionRef.current.querySelector(".about-media-wrap");
        const items = gsap.utils.toArray(
          sectionRef.current.querySelectorAll(".about-item")
        );

        if (mediaWrap) {
          gsap.set(mediaWrap, {
            opacity: 0,
            scale: 0.92,
            clipPath: "inset(8% 8% 8% 8% round 20px)",
          });
        }
        gsap.set(items, { opacity: 0, y: 24 });

        const playReveal = () => {
          const tl = gsap.timeline({
            defaults: { ease: "power3.out", overwrite: "auto" },
          });
          if (mediaWrap) {
            tl.to(
              mediaWrap,
              {
                opacity: 1,
                scale: 1,
                clipPath: "inset(0% 0% 0% 0% round 20px)",
                duration: 0.55,
              },
              0
            );
          }
          tl.to(
            items,
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.08,
            },
            0.15
          );
        };

        const hideReveal = (toY) => {
          if (mediaWrap) {
            gsap.to(mediaWrap, {
              opacity: 0,
              scale: 0.95,
              duration: 0.35,
              ease: "power2.in",
              overwrite: "auto",
            });
          }
          gsap.to(items, {
            opacity: 0,
            y: toY,
            duration: 0.35,
            stagger: 0.04,
            ease: "power2.in",
            overwrite: "auto",
          });
        };

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 82%",
          end: "bottom 15%",
          onEnter: () => playReveal(),
          onEnterBack: () => playReveal(),
          onLeave: () => hideReveal(-20),
          onLeaveBack: () => hideReveal(20),
        });

        const link = ctaLinkRef.current;
        const arrow = link?.querySelector(".about-cta-arrow");
        let cleanupArrow;
        if (link && arrow) {
          const qx = gsap.quickTo(arrow, "x", { duration: 0.25, ease: "power2.out" });
          const enter = () => qx(4);
          const leave = () => qx(0);
          link.addEventListener("mouseenter", enter);
          link.addEventListener("mouseleave", leave);
          link.addEventListener("focus", enter);
          link.addEventListener("blur", leave);
          cleanupArrow = () => {
            link.removeEventListener("mouseenter", enter);
            link.removeEventListener("mouseleave", leave);
            link.removeEventListener("focus", enter);
            link.removeEventListener("blur", leave);
          };
        }

        ScrollTrigger.refresh();

        return () => {
          cleanupArrow?.();
        };
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="section about" id="about">
      <div className={`about-inner${imgFailed ? " no-image" : ""}`}>
        {!imgFailed && (
          <div className="about-media-wrap">
            <div className="about-media">
              <img
                className="about-img"
                src="/about.jpg"
                alt="Angelo Ang in formal attire outdoors"
                width="960"
                height="960"
                loading="lazy"
                onLoad={() => ScrollTrigger.refresh()}
                onError={() => setImgFailed(true)}
              />
            </div>
          </div>
        )}
        <div className="about-copy">
          <span className="label about-item">About</span>
          <h2 className="headline about-title about-item">About me</h2>
          <div className="about-text">
            <p className="about-item">
              I&rsquo;m an aspiring full-stack developer based in Davao, Philippines, building
              modern web applications with <span className="about-highlight">Node.js</span> and{" "}
              <span className="about-highlight">React</span>.
            </p>
            <p className="about-item">
              Alongside web development, I&rsquo;ve trained machine learning models in Python for
              computer vision apps—from real-time hand sign recognition to mobile waste
              classification.
            </p>
            <p className="about-item">
              Right now, I&rsquo;m focused on <span className="about-highlight">GSAP</span> and{" "}
              <span className="about-highlight">ScrollTrigger</span> to craft expressive,
              interactive interfaces and shipping complete end-to-end projects.
            </p>
          </div>
          <a ref={ctaLinkRef} className="about-cta about-item" href="#contact">
            <span>Let&rsquo;s talk</span>
            <span className="about-cta-arrow" aria-hidden="true">
              &rarr;
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
