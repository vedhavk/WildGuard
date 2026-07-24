import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Wild Guard — Wildlife Detection & Alert System",
  description:
    "Upload wildlife images for AI-powered detection. Get real-time alerts when wild animals are spotted in your area.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
