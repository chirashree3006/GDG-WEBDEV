import localFont from "next/font/local";

// Product Sans is Google's brand typeface, used across GDG-branded material.
// The .ttf files already shipped in public/assets/fonts were never wired up
// to a @font-face anywhere in the app -- every page fell back to whatever
// Google Font (Inter, DM Sans, Space Grotesk...) that particular page
// happened to import, inconsistently. This makes it the site's one sans
// font, applied globally via tailwind.config.js's `fontFamily.sans`.
export const productSans = localFont({
  src: [
    {
      path: "../public/assets/fonts/ProductSansRegular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Product Sans Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Product Sans Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/assets/fonts/Product Sans Bold Italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-product-sans",
  display: "swap",
});
