
import "./globals.css";

export const metadata = {
  title: "FRAME — Creative Network",
  description: "Rencontre mannequins, photographes et créatifs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

