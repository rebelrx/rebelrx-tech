import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://rebelrx.tech',
  integrations: [
    starlight({
      title: 'RebelRx Tech',
      description:
        'Practical guides for Linux, self-hosting, privacy, and evidence-aware health education.',

      components: {
        Footer: './src/components/RebelFooter.astro',
      },

      logo: {
        src: './src/assets/rebelrxlogo.svg',
        alt: 'RebelRx',
        replacesTitle: true,
      },

      favicon: '/favicon.ico',

      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/rebelrx',
        },
      ],

      customCss: ['./src/styles/rebelrx.css'],
      lastUpdated: true,

      sidebar: [
        {
          label: 'Linux',
          items: [
            { label: 'Overview', link: '/linux/' },
            { label: 'Why Linux', link: '/linux/why-linux/' },
            {
              label: 'Desktop Installation',
              collapsed: false,
              items: [
                {
                  label: 'Artix KDE + OpenRC',
                  link: '/linux/artix-kde-openrc-install/',
                },
                {
                  label: 'Fedora KDE',
                  link: '/linux/fedora-kde-install/',
                },
              ],
            },
            {
              label: 'Server Installation',
              collapsed: false,
              items: [
                {
                  label: 'Devuan Server',
                  link: '/linux/devuan-server-install/',
                },
                {
                  label: 'Debian Server',
                  link: '/linux/debian-server-install/',
                },
              ],
            },
            {
              label: 'Post-Install Baseline',
              link: '/linux/post-install-baseline/',
            },
          ],
        },

        {
          label: 'Homelab',
          items: [
            { label: 'Overview', link: '/homelab/' },

            {
              label: 'Core Infrastructure',
              collapsed: false,
              items: [
                {
                  label: 'Docker Home Lab',
                  link: '/homelab/docker-home-lab/',
                },
                {
                  label: 'Docker Infrastructure Standards',
                  link: '/homelab/docker-infrastructure-standards/',
                },
                {
                  label: 'NAS Mounting',
                  link: '/homelab/nas-mounting/',
                },
                {
                  label: 'Nginx Proxy Manager',
                  link: '/homelab/nginx-proxy-manager/',
                },
              ],
            },

            {
              label: 'Networking & Access',
              collapsed: false,
              items: [
                {
                  label: 'Tailscale VPN',
                  link: '/homelab/tailscale/',
                },
                {
                  label: 'DNS & Network Privacy',
                  link: '/homelab/dns-and-network-privacy/',
                },
              ],
            },

            {
              label: 'Operations',
              collapsed: false,
              items: [
                {
                  label: 'Monitoring & Management',
                  link: '/homelab/monitoring-and-management/',
                },
                {
                  label: 'Git-Managed Homelab',
                  link: '/homelab/git-managed-homelab/',
                },
                {
                  label: 'Backup & Recovery',
                  link: '/homelab/backup-and-recovery/',
                },
                {
                  label: 'Disaster Recovery',
                  link: '/homelab/disaster-recovery/',
                },
              ],
            },

            {
              label: 'AI',
              collapsed: false,
              items: [
                {
                  label: 'Self-Hosted AI',
                  link: '/homelab/self-hosted-ai/',
                },
              ],
            },
          ],
        },

        {
          label: 'Privacy',
          items: [
            { label: 'Overview', link: '/privacy/' },
            {
              label: 'Why Privacy Matters',
              link: '/privacy/why-privacy/',
            },
            {
              label: 'App Recommendations',
              link: '/privacy/app-recommendations/',
            },
            {
              label: 'Mobile Privacy',
              link: '/privacy/mobile/',
            },
            {
              label: 'Migration Guide',
              link: '/privacy/migration/',
            },
            {
              label: 'RebelRx Setup',
              link: '/privacy/my-setup/',
            },
          ],
        },

        {
          label: 'Health',
          items: [
            { label: 'Overview', link: '/health/' },
            { label: 'Wake Up', link: '/health/wake-up/' },
            {
              label: 'What You Can Do',
              link: '/health/what-you-can-do/',
            },
            {
              label: 'Non-Toxic Grocery Guide',
              collapsed: false,
              items: [
                {
                  label: 'Overview',
                  link: '/health/non-toxic-grocery-guide/',
                },
                {
                  label: 'Quick Start',
                  link: '/health/non-toxic-grocery-guide/quick-start/',
                },
                {
                  label: 'Shopping Framework',
                  link: '/health/non-toxic-grocery-guide/shopping-framework/',
                },
                {
                  label: 'Produce',
                  link: '/health/non-toxic-grocery-guide/produce/',
                },
                {
                  label: 'Protein',
                  link: '/health/non-toxic-grocery-guide/protein/',
                },
                {
                  label: 'Fats & Oils',
                  link: '/health/non-toxic-grocery-guide/fats-and-oils/',
                },
                {
                  label: 'Dairy',
                  link: '/health/non-toxic-grocery-guide/dairy/',
                },
                {
                  label: 'Carbohydrates',
                  link: '/health/non-toxic-grocery-guide/carbohydrates/',
                },
                {
                  label: 'Pantry Staples',
                  link: '/health/non-toxic-grocery-guide/pantry-staples/',
                },
                {
                  label: 'Beverages',
                  link: '/health/non-toxic-grocery-guide/beverages/',
                },
                {
                  label: 'Packaged Foods',
                  link: '/health/non-toxic-grocery-guide/packaged-foods/',
                },
                {
                  label: 'Kitchen & Storage',
                  link: '/health/non-toxic-grocery-guide/kitchen-and-storage/',
                },
                {
                  label: 'Water Filtration',
                  link: '/health/non-toxic-grocery-guide/water-filtration/',
                },
                {
                  label: 'Full Guide',
                  link: '/health/non-toxic-grocery-guide/full-guide/',
                },
              ],
            },
            {
              label: 'Medical Resources',
              link: '/health/medical-resources/',
            },
            {
              label: 'Trusted Practitioners',
              link: '/health/practitioners/',
            },
          ],
        },

        {
          label: 'About',
          link: '/about/',
        },
      ],
    }),
  ],
});