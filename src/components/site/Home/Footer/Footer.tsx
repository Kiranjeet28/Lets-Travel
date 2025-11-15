import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaXTwitter,
  FaGithub,
} from "react-icons/fa6";
import { IoBrowsers, IoLink } from "react-icons/io5";

const contactInfo = [
  { icon: Phone, text: "+91 9358XXXXX" },
  { icon: Mail, text: "kiranjeetkour@gmail.com" },
  { icon: MapPin, text: "123 Travel Street, City, Country" },
];

const companyLinks = [
  "About Us",
  "Services",
  "Privacy Policy",
  "Terms & Conditions",
  "Contact Us",
];

const top10Links: { name: string; link: string }[] = [
  { name: "Travel Agencies", link: "/agency" },
  { name: "Hotels", link: "/hotels" },
  { name: "DMC", link: "/dMC" },
  { name: "Influencers", link: "/influencers" },
];

const socialIcons = [
  {
    href: "https://www.linkedin.com/in/kiranjeet28",
    icon: FaLinkedin,
  },
  {
    href: "https://portfolokiranjeet28.vercel.app",
    icon: IoLink,
  },
  {
    href: "https://github.com/kiranjeet28",
    icon: FaGithub,
  },
  {
    href: "https://www.instagram.com/k_jeet_x",
    icon: FaInstagram,
  },
];

function Footer() {
  return (
    <div className="bg-colorAll pt-4 sm:pt-10 lg:pt-12 mt-20">
      <footer className="mx-auto max-w-screen-2xl px-4 md:px-8">
        <div className="mb-16 grid grid-cols-2 gap-12 pt-10 md:grid-cols-4 lg:grid-cols-5 lg:gap-8 lg:pt-5">
          <div className="col-span-full lg:col-span-2">
            <div className="mb-4 lg:-mt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xl font-bold text-black md:text-2xl"
                aria-label="logo"
              >
                <svg
                  width="95"
                  height="94"
                  viewBox="0 0 95 94"
                  className="h-auto w-5 text-black"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M96 0V47L48 94H0V47L48 0H96Z" />
                </svg>
                <Link href="/"><Image src="/logo.png" height={50} width={50} alt="Logo" /></Link>
              </Link>
            </div>

            <p className="mb-6 cursor-default sm:pr-8 font-semibold">
              Experience the Extraordinary:Let Travel Experts, Hotels, and
              Agencies at Your Fingertips
            </p>

           
          </div>

          {/* Company Links */}
          <div>
            <div className="mb-4 font-bold uppercase tracking-widest text-xl md:text-2xl">
              Company
            </div>
            <nav className="flex flex-col gap-4">
              {companyLinks?.map((link, index) => (
                <div key={index}>
                  <Link href="#" className="cool-link-black font-medium">
                    {link}
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          {/* Top 10 Links */}
          <div>
            <div className="mb-4 font-bold uppercase tracking-widest text-xl md:text-2xl">
              Lets Travel
            </div>
            <nav className="flex flex-col gap-4">
              {top10Links?.map((item, index) => (
                <div key={index}>
                  <Link
                    href={item.link}
                    className="cool-link-black font-medium"
                  >
                    {item.name}
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          {/* Social Icons */}
          <div>
            <div className="mb-4 font-bold uppercase tracking-widest text-xl md:text-2xl">
              Follow us
            </div>
            <nav className="flex items-center justify-start gap-5">
              {socialIcons?.map((item, index) => (
                <Link
                  href={item.href}
                  key={index}
                  className="hover:scale-150 transition-all duration-300 cursor-pointer"
                >
                  <item.icon className="w-5 h-5" />
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="cursor-default select-none border-t py-8 text-center text-sm font-semibold">
          All rights Reserved © Kiranjeet Kour 2024
        </div>
      </footer>
    </div>
  );
}

export default Footer;
