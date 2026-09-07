import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://rebelrx.tech',
  integrations: [
    starlight({
      title: 'RebelRx Tech',
      description: 'Practical guides for Linux, self-hosting, privacy, and evidence-aware health education.',
      logo: {
        src: './src/assets/rebelrxlogo.svg',
        alt: 'RebelRx',
        replacesTitle: true,
      },
      favicon: '/favicon.ico',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/rebelrx' },
      ],
      customCss: ['./src/styles/rebelrx.css'],
      lastUpdated: true,
      sidebar: [
        { label: 'Linux', items: [
          { label: 'Overview', link: '/linux/' },
          { label: 'Why Linux', link: '/linux/why-linux/' },
          { label: 'Artix Desktop Install', link: '/linux/artix-kde-openrc-install/' },
          { label: 'Devuan Server Install', link: '/linux/devuan-server-install/' },
        ]},
        { label: 'Homelab', items: [
          { label: 'Overview', link: '/homelab/' },
          { label: 'Docker Home Lab', link: '/homelab/docker-home-lab/' },
          { label: 'Tailscale VPN', link: '/homelab/tailscale/' },
          { label: 'Nginx Proxy Manager', link: '/homelab/nginx-proxy-manager/' },
          { label: 'NAS Mounting', link: '/homelab/nas-mounting/' },
          { label: 'Backup & Recovery', link: '/homelab/backup-and-recovery/' },
        ]},
        { label: 'Privacy', items: [
          { label: 'Overview', link: '/privacy/' },
          { label: 'Why Privacy Matters', link: '/privacy/why-privacy/' },
          { label: 'App Recommendations', link: '/privacy/app-recommendations/' },
          { label: 'Mobile Privacy', link: '/privacy/mobile/' },
          { label: 'Migration Guide', link: '/privacy/migration/' },
          { label: 'RebelRx Setup', link: '/privacy/my-setup/' },
        ]},
        { label: 'Health', items: [
          { label: 'Overview', link: '/health/' },
          { label: 'Wake Up', link: '/health/wake-up/' },
          { label: 'What You Can Do', link: '/health/what-you-can-do/' },
          { label: 'Non-Toxic Grocery Guide', collapsed: false, items: [
            { label: 'Overview', link: '/health/non-toxic-grocery-guide/' },
            { label: 'Quick Start', link: '/health/non-toxic-grocery-guide/quick-start/' },
            { label: 'Shopping Framework', link: '/health/non-toxic-grocery-guide/shopping-framework/' },
            { label: 'Produce', link: '/health/non-toxic-grocery-guide/produce/' },
            { label: 'Protein', link: '/health/non-toxic-grocery-guide/protein/' },
            { label: 'Fats & Oils', link: '/health/non-toxic-grocery-guide/fats-and-oils/' },
            { label: 'Dairy', link: '/health/non-toxic-grocery-guide/dairy/' },
            { label: 'Carbohydrates', link: '/health/non-toxic-grocery-guide/carbohydrates/' },
            { label: 'Pantry Staples', link: '/health/non-toxic-grocery-guide/pantry-staples/' },
            { label: 'Beverages', link: '/health/non-toxic-grocery-guide/beverages/' },
            { label: 'Packaged Foods', link: '/health/non-toxic-grocery-guide/packaged-foods/' },
            { label: 'Kitchen & Storage', link: '/health/non-toxic-grocery-guide/kitchen-and-storage/' },
            { label: 'Water Filtration', link: '/health/non-toxic-grocery-guide/water-filtration/' },
            { label: 'Full Guide', link: '/health/non-toxic-grocery-guide/full-guide/' },
          ]},
          { label: 'Medical Resources', link: '/health/medical-resources/' },
          { label: 'Trusted Practitioners', link: '/health/practitioners/' },
        ]},
        { label: 'About', link: '/about/' },
      ],
    }),
  ],
});
