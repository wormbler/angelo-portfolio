import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { site } from "../data/site";
import "./Contact.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Contact() {
  const sectionRef = useRef(null);
  const badgeRef = useRef(null);
  const copyTl = useRef(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray(
          sectionRef.current.querySelectorAll(".contact-item")
        );
        gsap.set(items, { opacity: 0, y: 36 });

        const show = (from) =>
          gsap.fromTo(
            items,
            from,
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              stagger: 0.1,
              ease: "power3.out",
              overwrite: "auto",
              onComplete: () => gsap.set(items, { clearProps: "transform" }),
            }
          );

        const hide = (to) =>
          gsap.to(items, {
            ...to,
            opacity: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: "power2.in",
            overwrite: "auto",
          });

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 85%",
          end: "bottom 10%",
          onEnter: () => show({ y: 36, opacity: 0 }),
          onEnterBack: () => show({ y: -36, opacity: 0 }),
          onLeave: () => hide({ y: -28 }),
          onLeaveBack: () => hide({ y: 28 }),
        });

        // Hover and focus micro-interactions for buttons and arrow links
        const liftButtons = gsap.utils.toArray(
          sectionRef.current.querySelectorAll(".contact-lift")
        );
        const cleanups = [];

        liftButtons.forEach((btn) => {
          const qy = gsap.quickTo(btn, "y", { duration: 0.25, ease: "power2.out" });
          const qs = gsap.quickTo(btn, "scale", { duration: 0.25, ease: "power2.out" });
          const enter = () => {
            qy(-3);
            qs(1.02);
          };
          const leave = () => {
            qy(0);
            qs(1);
          };
          btn.addEventListener("mouseenter", enter);
          btn.addEventListener("mouseleave", leave);
          btn.addEventListener("focus", enter);
          btn.addEventListener("blur", leave);
          cleanups.push(() => {
            btn.removeEventListener("mouseenter", enter);
            btn.removeEventListener("mouseleave", leave);
            btn.removeEventListener("focus", enter);
            btn.removeEventListener("blur", leave);
          });
        });

        const arrowLinks = gsap.utils.toArray(
          sectionRef.current.querySelectorAll(".contact-link")
        );
        arrowLinks.forEach((link) => {
          const arrow = link.querySelector(".contact-arrow");
          if (!arrow) return;
          const qx = gsap.quickTo(arrow, "x", { duration: 0.25, ease: "power2.out" });
          const enter = () => qx(4);
          const leave = () => qx(0);
          link.addEventListener("mouseenter", enter);
          link.addEventListener("mouseleave", leave);
          link.addEventListener("focus", enter);
          link.addEventListener("blur", leave);
          cleanups.push(() => {
            link.removeEventListener("mouseenter", enter);
            link.removeEventListener("mouseleave", leave);
            link.removeEventListener("focus", enter);
            link.removeEventListener("blur", leave);
          });
        });

        ScrollTrigger.refresh();

        return () => {
          cleanups.forEach((fn) => fn());
        };
      });

      return () => {
        copyTl.current?.kill();
      };
    },
    { scope: sectionRef }
  );

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(site.email);
      } else {
        const ta = document.createElement("textarea");
        ta.value = site.email;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
    } catch {
      // Fallback if clipboard permission denied
    }

    setCopied(true);
    copyTl.current?.kill();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const badge = badgeRef.current;
    if (!badge) return;

    if (reduced) {
      gsap.set(badge, { opacity: 1, y: 0 });
      copyTl.current = gsap.delayedCall(2, () => {
        gsap.set(badge, { opacity: 0 });
        setCopied(false);
      });
    } else {
      const tl = gsap.timeline({
        onComplete: () => setCopied(false),
      });
      tl.fromTo(
        badge,
        { opacity: 0, y: 6, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "back.out(2)" }
      )
        .to(badge, { duration: 1.5 })
        .to(badge, { opacity: 0, y: -6, scale: 0.95, duration: 0.25, ease: "power2.in" });
      copyTl.current = tl;
    }
  };

  return (
    <section ref={sectionRef} className="section contact" id="contact">
      <div className="contact-inner">
        <span className="label contact-item">Contact</span>
        <h2 className="headline contact-title contact-item">
          Let&rsquo;s build something together.
        </h2>
        <p className="contact-sub contact-item">{site.contactCopy}</p>

        <div className="contact-actions contact-item">
          <div className="contact-email-group">
            <a
              className="btn contact-email-btn contact-lift"
              href={`mailto:${site.email}`}
              aria-label={`Send email to ${site.email}`}
            >
              {site.email}
            </a>
            <button
              type="button"
              className="contact-copy-btn contact-lift"
              aria-label="Copy email address"
              onClick={handleCopyEmail}
            >
              {copied ? (
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
            <span
              ref={badgeRef}
              className="contact-copied"
              role="status"
              aria-live="polite"
            >
              {copied ? "Copied!" : ""}
            </span>
          </div>

          <div className="contact-socials">
            <a
              className="contact-link"
              href={site.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub profile"
            >
              <span>GitHub</span>
              <span className="contact-arrow" aria-hidden="true">
                &rarr;
              </span>
            </a>
            <a
              className="contact-link"
              href={site.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn profile"
            >
              <span>LinkedIn</span>
              <span className="contact-arrow" aria-hidden="true">
                &rarr;
              </span>
            </a>
          </div>
        </div>

        <p className="contact-meta contact-item">{site.locationLine}</p>
      </div>
    </section>
  );
}
