import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { navLinks } from "../data/site";
import "./Navbar.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");
  const navRef = useRef(null);

  useGSAP(() => {
    const triggers = [];

    navLinks.forEach((link, idx) => {
      const sec = document.querySelector(link.href);
      if (!sec) return;

      const isLast = idx === navLinks.length - 1;

      triggers.push(
        ScrollTrigger.create({
          trigger: sec,
          start: isLast ? "top 75%" : "top center",
          end: "bottom center",
          onEnter: () => setActive(link.href),
          onEnterBack: () => setActive(link.href),
        })
      );
    });

    const lastHref = navLinks[navLinks.length - 1]?.href;
    const prevHref = navLinks[navLinks.length - 2]?.href;

    const checkBottom = () => {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 48;
      if (scrolledToBottom && lastHref) {
        setActive(lastHref);
      }
    };

    triggers.push(
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: "bottom bottom+=48",
        onEnter: () => lastHref && setActive(lastHref),
        onLeaveBack: () => {
          const contactEl = lastHref ? document.querySelector(lastHref) : null;
          if (contactEl) {
            const rect = contactEl.getBoundingClientRect();
            if (rect.top > window.innerHeight * 0.75 && prevHref) {
              setActive(prevHref);
            }
          }
        },
      })
    );

    window.addEventListener("scroll", checkBottom, { passive: true });
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("scroll", checkBottom);
      triggers.forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onClickOutside);
    };
  }, [open]);

  return (
    <nav ref={navRef} className="navbar" aria-label="Main">
      <a className="navbar-logo" href="#home" onClick={() => setOpen(false)}>
        Angelo Ang
      </a>
      <button
        className="navbar-toggle"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`navbar-bars${open ? " open" : ""}`} />
      </button>
      <ul className={`navbar-links${open ? " open" : ""}`}>
        {navLinks.map((l) => {
          const isCurrent = active === l.href;
          return (
            <li key={l.href}>
              <a
                href={l.href}
                className={isCurrent ? "active" : undefined}
                aria-current={isCurrent ? "location" : undefined}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
