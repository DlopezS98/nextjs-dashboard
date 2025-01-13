import '@/app/ui/global.css';
import { montserrat } from './ui/fonts';
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${montserrat.className} antialiased`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
