import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'BeChill - Connexion Privy',
  description: 'Connexion Web3 via Privy pour démonstration',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
