import localFont from "next/font/local";

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
