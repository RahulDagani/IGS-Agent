import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from "@/context/AuthContext";
import RootLayoutClient from '@/components/RootLayoutClient';

import { GoogleOAuthProvider } from '@react-oauth/google';


const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
                 <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
        
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider>
              <RootLayoutClient>
                {children}
              </RootLayoutClient>
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
         </GoogleOAuthProvider>
      </body>
    </html>
  );
}