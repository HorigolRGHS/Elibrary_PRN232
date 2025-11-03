"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  // Static UI content (translations and auth removed)
  const titlePart1 = "Welcome to";
  const titleHighlight = "EMC Library";
  const titlePart2 = "";
  const subtitle = "";
  const ctaText = "";
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    // Reveal-on-scroll
    const revealEls = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    const BASE_DELAY = 240;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          let delay = parseInt(
            el.getAttribute("data-delay") || `${BASE_DELAY}`,
            10
          );

          const parent = el.parentElement;
          if (parent?.hasAttribute("data-stagger")) {
            const step = parseInt(
              parent.getAttribute("data-stagger") || "120",
              10
            );
            const siblings = Array.from(
              parent.querySelectorAll<HTMLElement>("[data-reveal]")
            );
            const index = siblings.indexOf(el);
            if (index >= 0) delay += index * step;
          }
          setTimeout(() => el.classList.add("show"), delay);
          io.unobserve(el);
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -30% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));

    // Parallax Y (book)
    const heroBook = bookRef.current;
    let ticking = false;
    const onScroll = () => {
      if (!heroBook || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY * 0.06;
        heroBook.style.transform = `translateY(${y}px)`;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Tilt
    const tiltEls = root.querySelectorAll<HTMLElement>(".tilt");
    const handleMove = (card: HTMLElement) => (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      const damp = 15;
      const rx = (-dy * damp).toFixed(2);
      const ry = (dx * damp).toFixed(2);
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    const handleLeave = (card: HTMLElement) => () => {
      card.style.transform = "rotateX(0) rotateY(0)";
    };
    tiltEls.forEach((card) => {
      card.addEventListener("mousemove", handleMove(card));
      card.addEventListener("mouseleave", handleLeave(card));
    });

    // Auto-demo
    let played = false;
    const cleanupFns: Array<() => void> = [];
    const runDemo = () => {
      if (played || !heroBook) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reduce.matches) return;

      played = true;
      heroBook.classList.add("demo-hover");
      const onEnter = () => {
        heroBook.classList.remove("demo-hover");
        heroBook.removeEventListener("mouseenter", onEnter);
      };
      heroBook.addEventListener("mouseenter", onEnter, { once: true });
      const timeout = setTimeout(() => {
        if (!heroBook.matches(":hover"))
          heroBook.classList.remove("demo-hover");
      }, 2000);
      cleanupFns.push(() => clearTimeout(timeout));
    };
    const ioBook = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!played && e.isIntersecting && e.intersectionRatio >= 0.25) {
            setTimeout(runDemo, 1200);
            ioBook.disconnect();
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 1], rootMargin: "-10% 0px -50% 0px" }
    );
    if (heroBook) ioBook.observe(heroBook);

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      ioBook.disconnect();
      tiltEls.forEach((card) => {
        card.removeEventListener("mousemove", handleMove(card));
        card.removeEventListener("mouseleave", handleLeave(card));
      });
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return (
    // full viewport width + top padding so header doesn't cover the hero
    <div
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden w-full pt-12"
    >
      {/* ===== BACKGROUND: bookMeow + BLUE WASH (no blur) ===== */}
      <div className="absolute inset-0 -z-50">
        <Image
          src="/image/bookMeow.webp"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-80 will-change-transform"
        />
        {/* lớp phủ xanh mát */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_20%,rgba(59,130,246,0.28),transparent_60%),radial-gradient(100%_70%_at_90%_100%,rgba(99,102,241,0.24),transparent_60%),linear-gradient(180deg,rgba(239,246,255,0.55)_0%,rgba(238,242,255,0.35)_38%,rgba(239,246,255,0.55)_100%)]" />
        {/* vignette nhẹ */}
        <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(85%_70%_at_50%_45%,black,transparent)]" />
      </div>

      {/* Floating books layer (cool tone) */}
      <div className="absolute inset-0 -z-40 pointer-events-none">
        <div className="absolute top-14 left-8 animate-float-slow">
          <div className="w-9 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-[2px] shadow-xl rotate-12 opacity-30" />
        </div>
        <div className="absolute top-32 right-16 animate-float-medium">
          <div className="w-7 h-9 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-[2px] shadow-lg -rotate-6 opacity-30" />
        </div>
        <div className="absolute bottom-24 left-1/4 animate-float-medium">
          <div className="w-8 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-[2px] shadow-lg rotate-3 opacity-25" />
        </div>
        <div className="absolute top-1/2 right-1/3 animate-float-slow">
          <div className="w-6 h-8 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-[2px] shadow-lg -rotate-12 opacity-25" />
        </div>
      </div>

      {/* Content container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 items-center gap-10 lg:gap-14">
          {/* LEFT: Content (nhỏ lại chút) */}
          <div className="text-center lg:text-left" data-reveal>
            <div className="max-w-xl lg:mr-6">
              <h1 className="font-display font-bold text-gray-900 leading-tight tracking-tight text-4xl md:text-5xl mb-4">
                {titlePart1}{" "}
                <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  {titleHighlight}
                </span>{" "}
                {titlePart2}
              </h1>

              <p className="text-lg md:text-xl text-gray-800/90 mb-8">
                {subtitle}
              </p>

              <div
                data-reveal
                data-delay="200"
                className="relative inline-flex"
              >
                <div
                  aria-hidden
                  className="absolute -inset-x-6 -bottom-4 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-xl"
                />
                {/* <Button
                  size="lg"
                  className="relative px-7 py-4 text-base md:text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href="/documents">
                    <svg
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7M14 7h5v5"
                      />
                    </svg>
                    {ctaText}
                  </Link>
                </Button> */}
              </div>
            </div>
          </div>

          {/* RIGHT: Book (nhỏ lại chút, giữ cơ chế) */}
          <div
            className="relative lg:pl-16 xl:pl-36 2xl:pl-56 lg:justify-self-end transform translate-y-4 lg:translate-y-6"
            data-reveal
            data-delay="260"
          >
            {/* halo xanh sau sách */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
            >
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-[conic-gradient(from_0deg,rgba(96,165,250,.45),rgba(99,102,241,.5),rgba(96,165,250,.45))] blur-2xl opacity-90 animate-[spin_18s_linear_infinite]" />
            </div>

            <div className="book-scene ml-auto mr-0">
              <div
                ref={bookRef}
                id="hero-book"
                className="book tilt rounded-xl shadow-2xl ring-1 ring-gray-900/10 will-change-transform"
                style={{ background: "transparent" }}
              >
                <div className="back" style={{ background: "#875b91" }} />
                <div className="page6" />
                <div className="page5" />
                <div className="page4" />
                <div className="page3" />
                <div className="page2" />
                <div className="page1" />
                <div
                  className="front"
                  style={{
                    // dùng ảnh local trong public/image
                    backgroundImage: `url('/image/Card.jpg')`, // hoặc '/image/Card.png' nếu bạn dùng PNG
                  }}
                ></div>
              </div>
            </div>

            <div className="absolute -bottom-3 right-6 w-40 h-8 rounded-full bg-gradient-to-r from-blue-500/30 to-indigo-500/30 blur-2xl pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        /* Reveal */
        [data-reveal] {
          opacity: 0;
          transform: translateY(18px) scale(0.985);
          filter: blur(3px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
            filter 0.7s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform, opacity, filter;
        }
        [data-reveal].show {
          opacity: 1;
          transform: none;
          filter: none;
        }
        .tilt {
          transition: transform 0.2s ease;
          transform-style: preserve-3d;
          will-change: transform;
        }

        /* Floating */
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float 6s ease-in-out infinite;
        }

        /* Book (hinge trái, giữ nguyên) */
        .book-scene {
          perspective: 1200px;
          perspective-origin: 100% 50%;
        }
        .book {
          transform-style: preserve-3d;
          position: relative;
          height: 370px; /* ↓ nhỏ hơn bản trước */
          width: 245px;
          cursor: pointer;
          backface-visibility: visible;
        }
        .book .front,
        .book .back,
        .book .page1,
        .book .page2,
        .book .page3,
        .book .page4,
        .book .page5,
        .book .page6 {
          transform-style: preserve-3d;
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          transform-origin: left center;
          transition: transform 0.6s ease-in-out, box-shadow 0.35s ease-in-out;
          border-top-right-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .book .front,
        .book .back {
          background: linear-gradient(
            135deg,
            #c7d2fe 0%,
            /* indigo-200 */ #93c5fd 100% /* blue-300 - đậm hơn chút */
          );
          color: #111827; /* slate-900 cho chữ rõ hơn */
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 1rem;
          box-shadow: inset 0 0 0 1px rgba(79, 70, 229, 0.18),
            /* viền indigo tinh tế */ 0 6px 18px rgba(30, 64, 175, 0.1); /* shadow nhẹ xanh */
        }

        .book .front {
          background-size: cover;
          background-position: center;
        }
        .book .page1 {
          display: none;
        }
        .book .page2 {
          background: #efefef;
        }
        .book .page3 {
          background: #f5f5f5;
        }
        .book .page4 {
          background: #f5f5f5;
        }
        .book .page5 {
          background: #fafafa;
        }
        .book .page6 {
          background: #fdfdfd;
        }

        /* HOVER mở */
        .book:hover .front {
          transform: rotateY(-160deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }
        .book:hover .page1 {
          transform: rotateY(-150deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }
        .book:hover .page2 {
          transform: rotateY(-30deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }
        .book:hover .page3 {
          transform: rotateY(-140deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }
        .book:hover .page4 {
          transform: rotateY(-40deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }
        .book:hover .page5 {
          transform: rotateY(-130deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }
        .book:hover .page6 {
          transform: rotateY(-50deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }
        .book:hover .back {
          transform: rotateY(-20deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }

        /* DEMO-HOVER (auto-open) */
        .book.demo-hover .front {
          transform: rotateY(-160deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }
        .book.demo-hover .page1 {
          transform: rotateY(-150deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }
        .book.demo-hover .page2 {
          transform: rotateY(-30deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }
        .book.demo-hover .page3 {
          transform: rotateY(-140deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }
        .book.demo-hover .page4 {
          transform: rotateY(-40deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }
        .book.demo-hover .page5 {
          transform: rotateY(-130deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }
        .book.demo-hover .page6 {
          transform: rotateY(-50deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }
        .book.demo-hover .back {
          transform: rotateY(-20deg) scale(1.04);
          box-shadow: 0 1em 3em rgba(0, 0, 0, 0.2);
        }

        /* Responsive size (nhỏ gọn nhưng vẫn upscale nhẹ ở màn lớn) */
        @media (min-width: 1280px) {
          .book {
            height: 390px;
            width: 255px;
          }
        }
        @media (min-width: 1536px) {
          .book {
            height: 410px;
            width: 270px;
          }
        }
      `}</style>
    </div>
  );
}
