import type { Metadata } from "next";
import "./globals.css";
import { assetUrl } from "@/lib/roulette/base-path";
export const metadata: Metadata = { title:"メシ決めルーレット", description:"ひとりでも、みんなでも。今日のごはんを迷わず決める。", icons:{icon:assetUrl("/favicon.svg")} };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="ja"><body>{children}</body></html>; }
