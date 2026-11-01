import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DemoToggle } from "@/components/demo/Demo";
import { DemoBanner } from "@/components/demo/DemoBanner";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Фасады Сысолы — МДФ фасады на заказ в Сыктывкаре",
    template: "%s — Фасады Сысолы",
  },
  description:
    "Производство МДФ фасадов: покраска, фрезеровка, радиусные фасады, фасады в плёнке. Каталог с 3D-просмотром, любые цвета RAL и NCS.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <DemoBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <DemoToggle />
      </body>
    </html>
  );
}
