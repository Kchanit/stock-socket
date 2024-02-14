import "./globals.css";
import { Space_Mono as FontSans } from "next/font/google";

// export const fontSans = FontSans({
//   subsets: ["latin"],
//   variable: "--font-sans",
//   weight: ["400", "700"],
// });

export const metadata = {
  title: "Stock Ticker",
  description: "Stock Ticker",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head></head>
      <body className="min-h-screen bg-background antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
