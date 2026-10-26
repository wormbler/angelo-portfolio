import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { site } from "../data/site";
import "./Footer.css";

gsap.registerPlugin(useGSAP);

const YEAR = new Date().getFullYear();

export default function Footer() {
  const footerRef = useRef(null);
  const topLinkRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const link = topLinkRef.current;
        const arrow = link?.querySelector(".footer-top-arrow");
        if (!link || !arrow) return;

        const qy = gsap.quickTo(arrow, "y", { duration: 0.25, ease: "power2.out" });
        const enter = () => qy(-3);
        const leave = () => qy(0);

        link.addEventListener("mouseenter", enter);
        link.addEventListener("mouseleave", leave);
        link.addEventListener("focus", enter);
        link.addEventListener("blur", leave);

        return () => {
          link.removeEventListener("mouseenter", enter);
          link.removeEventListener("mouseleave", leave);
          link.removeEventListener("focus", enter);
          link.removeEventListener("blur", leave);
        };
      });
    },
    { scope: footerRef }
  );

  const handleBackToTop = (e) => {
    e.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return (
    <footer ref={footerRef} className="footer">
      <div className="footer-inner">
        <a
          ref={topLinkRef}
          href="#home"
          className="footer-top"
          onClick={handleBackToTop}
        >
          <span>Back to top</span>
          <span className="footer-top-arrow" aria-hidden="true">
            &uarr;
          </span>
        </a>
        <p className="footer-copy">
          &copy; {YEAR} {site.name}
        </p>
      </div>
    </footer>
  );
}
