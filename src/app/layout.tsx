// // app/layout.tsx
// import { Providers } from '../redux/provider';
// import type { Metadata } from 'next';
// import { Poppins } from 'next/font/google';
// import './globals.css';

// const poppins = Poppins({
//   subsets: ['latin'],
//   weight: ['400', '500', '600', '700'],
//   variable: '--font-poppins',
// });

// export const metadata: Metadata = {
//   title: 'SkillSense.AI',
//   description: 'AI-powered career path assistant',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning className={poppins.variable}>
//       <body className="font-sans">
//         <Providers>
//           {children}
//         </Providers>
//       </body>
//     </html>
//   );
// }

// app/layout.tsx
import { Providers } from '../redux/provider';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

// Import Clerk components and provider
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'SkillSense.AI',
  description: 'AI-powered career path assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. Wrap your entire application with ClerkProvider

      <html lang="en" suppressHydrationWarning className={poppins.variable}>
        <body className="font-sans">
          {/*
            2. Optional: You can place Clerk's auth buttons directly in the layout
               if you want them visible globally, e.g., in a header.
               However, it's often cleaner to put these in a specific component
               like your TopNavbar or a dedicated auth page.
               I'll include a simplified header here for demonstration,
               but you'll likely want to integrate UserButton into your TopNavbar.
          */}

            {/* <header className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 shadow-md">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50">Sign Up</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </header> */}


          <Providers>
            {children}
          </Providers>
        </body>
      </html>

  );
}