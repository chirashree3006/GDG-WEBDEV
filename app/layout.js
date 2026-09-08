import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SubmissionsProvider } from "@/components/SubmissionsProvider";
import { productSans } from "./fonts";
import "./globals.css";

export const metadata = {
  title: "Organization Name | Recruitment Portal",
  description: "Recruitment portal for Organization Name",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={productSans.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SubmissionsProvider>
            {children}
            <Toaster />
          </SubmissionsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
