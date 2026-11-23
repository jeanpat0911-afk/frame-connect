import "./globals.css";
export const metadata={title:"FRAME — Creative network",description:"Rencontre mannequins, photographes et créatifs."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>}

/* FRAME — ANIMATIONS FIX */

@keyframes frameFadeIn {
  from {
    opacity: 0;
    transform: translateY(35px);
    filter: blur(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes frameScaleIn {
  from {
    opacity: 0;
    transform: scale(.94);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes frameGlow {
  0%, 100% {
    opacity: .35;
    transform: scale(1);
  }
  50% {
    opacity: .8;
    transform: scale(1.15);
  }
}

.frame-home .frame-nav {
  animation: frameFadeIn .8s ease both;
}

.frame-home .hero-content {
  animation: frameFadeIn 1s .2s ease both;
}

.frame-home .hero h1 {
  animation: frameFadeIn 1s .4s ease both;
}

.frame-home .hero-description {
  animation: frameFadeIn .9s .7s ease both;
}

.frame-home .hero-actions {
  animation: frameFadeIn .9s .9s ease both;
}

.frame-home .hero-glow {
  animation: frameGlow 7s ease-in-out infinite;
}

.frame-home .about-section,
.frame-home .discover-section,
.frame-home .join-section {
  animation: frameFadeIn 1s ease both;
}

.frame-home .talent-card {
  animation: frameScaleIn .7s ease both;
}

.frame-home .talent-card:nth-child(2) {
  animation-delay: .12s;
}

.frame-home .talent-card:nth-child(3) {
  animation-delay: .24s;
}

.frame-home .talent-card:nth-child(4) {
  animation-delay: .36s;
}

.frame-home .talent-card:hover {
  transform: translateY(-9px);
}

.frame-home .talent-image img {
  transition: transform .7s ease;
}

.frame-home .talent-card:hover img {
  transform: scale(1.08);
}

.frame-home button,
.frame-home a {
  transition: all .3s ease;
}

.frame-home button:hover {
  filter: brightness(1.2);
}

.frame-home .frame-marquee-track {
  animation: frameMarquee 25s linear infinite;
}

@keyframes frameMarquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

