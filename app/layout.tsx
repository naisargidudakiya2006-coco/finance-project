import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#4A154B",
          colorText: "#1A1D23",
          colorBackground: "#FFF7E8",
          colorDanger: "#F56040",
          colorInputBackground: "#FFFFFF",
          colorInputText: "#1A1D23",
        },
        elements: {
          card: "shadow-[0_30px_70px_rgba(74,21,75,0.16)] rounded-[2rem]",
          footerActionLink: "text-[#C13584] font-bold hover:text-[#4A154B]",
          formButtonPrimary: "bg-[#4A154B] hover:bg-[#C13584] text-white shadow-none",
          socialButtonsBlockButton: "border border-[#FFDC80] bg-white text-[#1A1D23]",
        },
      }}
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
