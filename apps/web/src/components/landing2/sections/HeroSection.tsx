"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EditorialHighlight, EditorialTitle } from "../common/EditorialTitle";

const heroDoctorImage =
  "https://res.cloudinary.com/dc3qprub3/image/upload/f_auto,q_auto,w_1200/v1784275372/hero-doc_ducwcu.png";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-start overflow-hidden bg-[#f3f1ef] pt-[96px] md:pt-[112px] xl:pt-[230px]">
      <div
        className="absolute left-1/2 top-[50vh] z-0 block w-screen max-w-none -translate-x-1/2 md:hidden"
        aria-hidden="true"
      >
        <motion.img
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          src={heroDoctorImage}
          alt=""
          className="h-auto w-full select-none"
          draggable={false}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: 34 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="absolute bottom-[-132px] right-[-170px] z-0 hidden w-[420px] md:bottom-auto md:right-[7vw] md:top-[36vh] md:block md:w-[500px] xl:right-[9vw] xl:top-[24vh] xl:w-[740px]"
        aria-hidden="true"
      >
        <img
          src={heroDoctorImage}
          alt=""
          className="h-auto w-full select-none"
          draggable={false}
        />
      </motion.div>

      <div className="relative z-10 flex w-full flex-1 flex-col px-4 text-left md:px-[8.4vw] md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <EditorialTitle
            as="h1"
            align="left"
            size="hero"
            className="max-w-[310px] !text-[31px] !leading-[0.88] !tracking-normal md:max-w-[520px] md:!text-[46px] md:!tracking-[-0.055em] xl:max-w-[760px] xl:!text-[80px]"
            lines={[
              <EditorialHighlight key="hero-line-1">Healthcare,</EditorialHighlight>,
              <>
                <span className="md:hidden">connected around</span>
                <span className="hidden md:inline">connected</span>
              </>,
              <>
                <span className="md:hidden">you</span>
                <span className="hidden md:inline">around you</span>
              </>,
            ]}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-6 max-w-[255px] text-[11px] font-normal leading-[1.12] text-[#171923] md:mt-6 md:max-w-[420px] md:text-[15px] md:leading-[1.28] xl:mt-10 xl:max-w-[610px] xl:text-[20px]"
        >
          Patients, doctors, ambulances, pharmacies, diagnostics and health
          record - one integrated platform
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-10 flex flex-col items-center gap-4 md:mt-9 md:flex-row md:justify-start xl:mt-12 xl:gap-5"
        >
          <Link
            href="/register"
            className="rounded-full bg-[#ff9500] px-5 py-2 text-[12px] font-semibold text-[#050608] shadow-[inset_10px_9px_20.6px_0_#fff9f4,-4px_-4px_5px_0_rgba(255,255,255,0.25),5px_5px_7px_0_rgba(0,0,0,0.42)] transition-all hover:translate-y-[-1px] hover:brightness-105 active:translate-y-0 md:px-3 md:py-1.5 xl:px-5 xl:py-2.5 xl:text-[15px]"
          >
            Get Started
          </Link>
          <a
            href="#services"
            className="rounded-full bg-white px-4 py-2 text-[11px] font-medium text-[#050608] shadow-[inset_10px_9px_20.6px_0_#d2d2d2,-4px_-4px_5px_0_rgba(255,255,255,0.25),5px_5px_7px_0_rgba(0,0,0,0.42)] transition-all hover:translate-y-[-1px] hover:brightness-105 active:translate-y-0 md:px-3 md:py-1.5 md:text-[12px] xl:px-5 xl:py-2.5 xl:text-[15px]"
          >
            Explore Services
          </a>
        </motion.div>
      </div>
    </section>
  );
}
