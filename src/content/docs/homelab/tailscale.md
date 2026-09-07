---
title: "🔒 Tailscale VPN (Devuan + Non-systemd)"
description: >-
  Secure remote access to your homelab with Tailscale on non-systemd Linux — Devuan sysvinit setup, subnet routing, exit nodes, and ACLs without opening a single port.
---
A practical guide to reaching your homelab from anywhere **without opening a single port** to the internet.

Most Tailscale guides assume systemd. This one covers **Devuan (sysvinit)** for your server — where Tailscale ships no init support at all — plus the OpenRC setup for Artix desktops.

---

## ⚠️ Core Principle

> Exposure is the enemy. Access should be private by default, and granted deliberately.

Port forwarding exposes services to the entire internet and hopes your login pages hold. A mesh VPN inverts that: nothing is reachable unless the device is **yours and authenticated**.

---

## 🧭 What Tailscale Is

Tailscale builds a private mesh network (a "tailnet") between your devices using **WireGuard**, the modern, audited VPN protocol built into the Linux kernel.

- Every device gets a stable private IP (`100.x.y.z`)
- Devices connect **directly to each other** (peer-to-peer) whenever possible
- Traffic is end-to-end encrypted between your devices
- Works through NAT and firewalls with zero router configuration

> Your server, laptop, and phone behave as if they're on the same LAN — from anywhere.

---

## ⚖️ The Honest Tradeoff

Tailscale is not fully self-hosted by default. Understand what you're trusting:

| Component | Status |
| :--- | :--- |
| Clients (`tailscaled`) | Open source |
| Encryption (WireGuard) | Open source, end-to-end |
| Coordination server | **Hosted by Tailscale Inc. (closed source)** |

The coordination server only exchanges public keys and connection metadata — it **cannot decrypt your traffic**. But it does see which devices exist and when they connect.

:::tip[Full sovereignty option: Headscale]
[Headscale](https://github.com/juanfont/headscale) is an open-source, self-hostable
replacement for Tailscale's coordination server. The official Tailscale clients
connect to it directly.

Recommended path: start with hosted Tailscale to learn the model, migrate to
Headscale once your tailnet is stable. The client-side commands in this guide
are identical either way.
:::
---

## ⚙️ Requirements

- A Devuan server (see the [Devuan Server Install Guide](/linux/devuan-server-install/))
- A free Tailscale account → <https://login.tailscale.com/start>
  - Sign-in is via an identity provider. To keep Big Tech out of the loop, use **Passkey** sign-up or a GitHub account rather than a Google/Microsoft login.

The free plan provides access to nearly all of Tailscale's offerings, covers unlimited user devices and 6 users — more than enough for a homelab.

---

## 📦 Install on Devuan (Server)

### 1. Add the Tailscale Repository

Tailscale's `.deb` repository is keyed by **Debian** codename — the same mapping trick used in the [Docker Homelab guide](/homelab/docker-home-lab/).

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg

# Devuan ships its own codename; Tailscale's Debian repo needs the Debian base:
#   Devuan 5  "Daedalus"  → bookworm
#   Devuan 6  "Excalibur" → trixie
DEBIAN_CODENAME=trixie   # set to match your Devuan release's Debian base

curl -fsSL https://pkgs.tailscale.com/stable/debian/${DEBIAN_CODENAME}.noarmor.gpg | \
  sudo tee /usr/share/keyrings/tailscale-archive-keyring.gpg > /dev/null

echo \
  "deb [signed-by=/usr/share/keyrings/tailscale-archive-keyring.gpg] \
  https://pkgs.tailscale.com/stable/debian \
  ${DEBIAN_CODENAME} main" | \
  sudo tee /etc/apt/sources.list.d/tailscale.list > /dev/null

sudo apt update
sudo apt install -y tailscale
```

:::note[Expect a harmless error]
The package's post-install step tries to talk to systemd and will complain.
Ignore it — the binaries (`/usr/sbin/tailscaled` and `/usr/bin/tailscale`)
install correctly. We supply the init script ourselves in the next step.
:::
---

### 2. Create the sysvinit Script

Tailscale provides no init script for sysvinit. Create one:

```bash
sudo nano /etc/init.d/tailscaled
```

Paste the following:

```bash
#!/bin/sh
### BEGIN INIT INFO
# Provides:          tailscaled
# Required-Start:    $local_fs $network $syslog
# Required-Stop:     $local_fs $network $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Tailscale node agent
# Description:       Tailscale mesh VPN daemon
### END INIT INFO

PATH=/sbin:/bin:/usr/sbin:/usr/bin
DAEMON=/usr/sbin/tailscaled
PIDFILE=/var/run/tailscaled.pid
NAME=tailscaled
DESC="Tailscale daemon"

DAEMON_ARGS="--state=/var/lib/tailscale/tailscaled.state --socket=/run/tailscale/tailscaled.sock --port=41641"

test -x $DAEMON || exit 0

. /lib/lsb/init-functions

case "$1" in
  start)
    log_daemon_msg "Starting $DESC" "$NAME"
    mkdir -p /run/tailscale /var/lib/tailscale
    start-stop-daemon --start --quiet --background \
      --make-pidfile --pidfile $PIDFILE \
      --exec $DAEMON -- $DAEMON_ARGS
    log_end_msg $?
    ;;
  stop)
    log_daemon_msg "Stopping $DESC" "$NAME"
    start-stop-daemon --stop --quiet --oknodo --retry 10 --pidfile $PIDFILE
    $DAEMON --cleanup
    rm -f $PIDFILE
    log_end_msg $?
    ;;
  restart|force-reload)
    $0 stop
    sleep 1
    $0 start
    ;;
  status)
    status_of_proc -p $PIDFILE $DAEMON $NAME
    ;;
  *)
    echo "Usage: /etc/init.d/$NAME {start|stop|restart|status}"
    exit 1
    ;;
esac

exit 0
```

Make it executable and register it with the default runlevels:

```bash
sudo chmod +x /etc/init.d/tailscaled
sudo update-rc.d tailscaled defaults
sudo /etc/init.d/tailscaled start
```

Verify it's running:

```bash
sudo /etc/init.d/tailscaled status
```

---

### 3. Join Your Tailnet

```bash
sudo tailscale up
```

Follow the printed URL in a browser to authenticate the machine.

> You only do this once. The daemon stores its authenticated state in
> `/var/lib/tailscale/` and reconnects automatically on every boot.

Confirm the node is up and note its address:

```bash
tailscale status
tailscale ip -4
```

---

## 🖥️ Install on Artix (Desktop / Laptop)

Artix packages the init scripts separately per init system:

```bash
sudo pacman -S tailscale tailscale-openrc
sudo rc-update add tailscaled default
sudo rc-service tailscaled start
sudo tailscale up
```

(For runit or s6, install `tailscale-runit` or `tailscale-s6` instead.)

This matches the post-install section of the [Artix Desktop Install Guide](/linux/artix-kde-openrc-install/).

---

## 📱 Other Devices

Install the Tailscale app on your phone or tablet and sign in to the same account:

- Android → F-Droid or Play Store
- iOS → App Store

Every device that joins can now reach every other device on its `100.x.y.z` address.

---

## 🌐 MagicDNS (Names Instead of IPs)

In the Tailscale admin console → **DNS**, enable **MagicDNS**.

Now instead of memorizing addresses:

```bash
ssh user@100.xx.xx.xx
```

You use machine names:

```bash
ssh user@machinename
```

Rename machines in the admin console (**Machines** → the `…` menu) to keep names clean and predictable.

---

## 🔑 Disable Key Expiry on Servers

By default, every node's keys expire after ~6 months, and the node **drops off your tailnet until you re-authenticate it interactively**.

Fine for laptops. Frustrating for headless servers.

In the admin console → **Machines** → your server → `…` → **Disable key expiry**.

---

## 🏠 Subnet Router (Reach Your Whole LAN)

Some devices can't run Tailscale — a NAS, printers, IoT appliances, IPMI interfaces. A **subnet router** lets one Tailscale node bridge your whole LAN.

### 1. Enable IP Forwarding (on the Devuan server)

```bash
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 2. Advertise Your LAN Subnet

```bash
sudo tailscale up --advertise-routes=192.168.1.0/24
```

(Replace with your actual LAN subnet.)

### 3. Approve the Route

Admin console → **Machines** → your server → **Edit route settings** → approve the subnet.

Now your phone on cellular can reach `192.168.1.x` devices as if you were home — NAS web UI, printer, everything.

> One subnet router replaces installing Tailscale on every device you own.

---

## 🚪 Exit Node (Optional)

An exit node routes **all** of a device's internet traffic through your home connection — useful on hotel or airport Wi-Fi.

On the server:

```bash
sudo tailscale up --advertise-routes=192.168.1.0/24 --advertise-exit-node
```

Approve it in the admin console (same place as routes). Then on your laptop or phone, select the server as your exit node when on untrusted networks.

:::tip
`tailscale up` flags are not additive — each run replaces the previous
configuration. Always pass the full set of flags you want active.
:::
---

## 🐳 Accessing Homelab Services

With Tailscale up, your [Docker services](/homelab/docker-home-lab/) are reachable with **zero exposed ports**:

```text
http://homemachine:8096    → Jellyfin
http://homemachine:2283    → Immich
http://homemachine:81      → Nginx Proxy Manager admin
```

The clean pattern:

- Docker services bind to the host (or to the Tailscale IP only)
- Nginx Proxy Manager routes internal hostnames
- Tailscale is the **only** path in
- Router port forwarding: **none**

> If a port isn't forwarded, the entire internet's scanners can't even see it.

---

## 🛡️ ACLs (Lock Down Who Reaches What)

By default, every device on your tailnet can reach every other device. For a single-user homelab that's acceptable — but tighten it as you grow.

In the admin console → **Access Controls**, ACLs are defined as JSON. A simple example: tag your servers, then restrict phones/laptops to specific services:

```json
{
  "tagOwners": {
    "tag:server": ["autogroup:admin"]
  },
  "acls": [
    {
      "action": "accept",
      "src": ["autogroup:member"],
      "dst": ["tag:server:8096,2283,443"]
    }
  ]
}
```

:::caution[SSH check mode and automation]
Tailscale SSH rules support `"action": "check"`, which forces periodic
browser re-authentication. Strong protection for interactive human sessions —
but any **automation** (CI runners, deploy scripts, cron jobs) using that
rule will hang silently waiting for a browser that never comes.

Keep `check` for humans. Use a separate `accept` rule — tightly scoped to a
low-privilege user — for anything unattended.
:::
---

## 🔐 Security Best Practices

- Protect your Tailscale login with strong 2FA; it is now the key to your entire infrastructure
- Remove old devices from the admin console when you retire hardware
- Use tags and ACLs once more than one person joins your tailnet
- Keep clients updated: `apt upgrade` / `pacman -Syu` covers it

---

## 🧰 Troubleshooting

```bash
tailscale status        # who's connected, and how (direct vs relayed)
tailscale netcheck      # NAT type, nearest DERP relay, port mapping info
tailscale ping machinename   # verify connectivity + path to a node
```

Common issues:

- **`failed to connect to local tailscaled`** → the daemon isn't running. `sudo /etc/init.d/tailscaled start` (Devuan) or `sudo rc-service tailscaled start` (Artix).
- **Connections show `relay` instead of `direct`** → traffic is bouncing through Tailscale's DERP relays. Still encrypted, just slower. Allowing UDP 41641 outbound usually restores direct paths.
- **Subnet routes not working** → route not approved in the admin console, or IP forwarding not enabled. Check both.
- **Node vanished from the tailnet** → key expiry. Re-authenticate with `sudo tailscale up`, then disable expiry so it doesn't recur.

---

## 🧠 Final Thought

Every forwarded port is a standing invitation to the entire internet.

A private mesh flips the model:

> Nothing is exposed. Everything is reachable by you and only you.
