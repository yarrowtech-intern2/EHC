"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-start overflow-hidden bg-[#eeedfa] pt-[142px] sm:pt-[156px] xl:pt-[230px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: 34 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="absolute bottom-[-88px] right-[-92px] z-0 w-[290px] cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.025] hover:brightness-110 sm:bottom-[-112px] sm:right-[-120px] sm:w-[370px] md:bottom-auto md:right-[-132px] md:top-[39vh] md:w-[540px] xl:right-[-160px] xl:top-[30vh] xl:w-[820px]"
        aria-hidden="true"
      >
        <img
          src="/assets/greenPlus.png"
          alt=""
          className="h-auto w-full select-none"
          draggable={false}
        />
      </motion.div>

      <div className="relative z-10 w-full px-5 text-center md:px-[8.4vw] md:text-left">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-[430px] text-[38px] font-normal leading-[0.94] text-[#050608] sm:text-[42px] md:mx-0 xl:max-w-[650px] xl:text-[64px]"
        >
          <span className="relative inline-block leading-none">
            <span className="relative z-10">Healthcare,</span>
            <span
              className="absolute -left-2 -right-2 -top-1 bottom-[-1px] origin-left rotate-[-2.5deg] bg-[#aaa6ff] xl:-left-3 xl:-right-4 xl:-top-2 xl:bottom-0"
              aria-hidden="true"
            />
          </span>{" "}
          connected
          <br />
          arounnd you
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mx-auto mt-7 max-w-[420px] text-[15px] font-normal leading-[1.28] text-[#171923] md:mx-0 xl:mt-10 xl:max-w-[610px] xl:text-[20px]"
        >
          Patients, doctors, ambulances, pharmacies, diagnostics and health
          record - one integrated platform
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3 md:justify-start xl:mt-12 xl:gap-5"
        >
          <Link
            href="/register"
            className="rounded-full bg-[#ff9500] px-3 py-1.5 text-[12px] font-semibold text-[#050608] shadow-[inset_10px_9px_20.6px_0_#fff9f4,-4px_-4px_5px_0_rgba(255,255,255,0.25),5px_5px_7px_0_rgba(0,0,0,0.42)] transition-all hover:translate-y-[-1px] hover:brightness-105 active:translate-y-0 xl:px-5 xl:py-2.5 xl:text-[15px]"
          >
            Get Started
          </Link>
          <a
            href="#services"
            className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#050608] shadow-[inset_10px_9px_20.6px_0_#d2d2d2,-4px_-4px_5px_0_rgba(255,255,255,0.25),5px_5px_7px_0_rgba(0,0,0,0.42)] transition-all hover:translate-y-[-1px] hover:brightness-105 active:translate-y-0 xl:px-5 xl:py-2.5 xl:text-[15px]"
          >
            Explore Services
          </a>
        </motion.div>
      </div>
    </section>
  );
}
