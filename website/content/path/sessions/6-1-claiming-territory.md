---
editorial: true
title: Claiming Territory
subtitle: Cloud Machines, SSH, and Server Setup
hook: "A manually provisioned server access plan with a verified recovery path. Use a named account and SSH key."
read: 60
artifact: "A manually provisioned server access plan with a verified recovery path"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://nodejs.org/en/about/previous-releases
  - https://documentation.ubuntu.com/server/how-to/security/firewalls/
say:
  - "Access: Use a named account and SSH key."
  - "Boundary: Permit required traffic before enabling the firewall."
  - "Recovery: Keep console access and a tested second session."
---

## The hook

"Alright. Five units ago, you woke up in a terminal. You learned the filesystem, built web pages, mastered JavaScript, assembled a full MERN stack, and unlocked AI-powered development. You have built real things. But every single one of those things lives on your laptop. Today that changes. Today you are going to rent a real Linux machine in a data center, connect to it over the internet, lock it down like a fortress, and install Node.js on it. By the end of today, you will have a hardened cloud server running and waiting for your code. This is where deployment begins."

---

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Provision and Secure Cloud Infrastructure

Provision a virtual private server, establish secure remote access via SSH key authentication, and harden the server following security best practices.

**Enabling Objectives:**

- Compare hosting options (shared hosting, VPS, dedicated servers, serverless) and justify VPS selection for full stack deployment
- Provision a VPS instance on a cloud provider (DigitalOcean, Linode, or equivalent) with appropriate specifications
- Generate SSH key pairs using Ed25519, transfer public keys to the server, and authenticate without passwords
- Create a non-root user with sudo privileges and disable root SSH login and password authentication
- Configure UFW firewall rules to allow only SSH, HTTP, and HTTPS traffic

**You should be able to:**
- You will be able to set up a production-ready cloud server with SSH key authentication, a non-root sudo user, and firewall rules that follow security best practices.

---

**0:00 - 0:10 | Unit Intro and Context Setting**

This is the unit where the project leaves your laptop. By the end of it, a browser that is not yours can open your app on a name you bought, with a lock in the address bar.

Quick poll: "Who here has ever deployed anything to the real internet? Not localhost. Not a free tier. The actual internet with a real domain?" For most, this will be their first time. That changes today.

**0:10 - 0:25 | What Is a VPS and Why Do You Need One?**

A VPS (Virtual Private Server) is a virtual machine running on someone else's hardware. You get root access. You can install anything. You control everything. It is YOUR machine in the cloud.

Think of it this way:

- **Shared hosting** (like GoDaddy hosting): You are renting a room in a crowded hostel. You share the kitchen. You cannot paint the walls. There are rules.
- **VPS**: You are renting your own apartment. You have the keys. You can do whatever you want inside. The landlord (cloud provider) just keeps the building standing.
- **Dedicated server**: You bought the entire building. Expensive. Overkill for now.
- **Serverless** (Lambda, Vercel, etc.): Someone else owns the building and you just show up to cook one meal at a time. Convenient but you do not control anything.

Why VPS over free hosting?

- Full control over the environment
- Install any software you want
- No vendor lock-in
- Real production experience
- Runs 24/7 (not sleeping like free tiers)
- You learn actual server administration
- Looks incredible on a resume

Cloud providers offer different machine sizes, regions, storage, transfer allowances, support, and billing rules. Compare the current product documentation before choosing a plan. Do not assume a historical free-credit offer is available to your account. Set a spending alert and understand whether stopped machines, disks, snapshots, and reserved addresses continue to incur charges.

This walkthrough uses DigitalOcean's term **Droplet** for a virtual machine. You may use another provider if you can map the same operations: choose a supported operating system, add an SSH public key, configure network access, and locate the recovery console. The learning objectives do not depend on a referral promotion or a particular dashboard layout. Record the plan, region, and expected monthly cost from the provider at the time you provision it.

**0:25 - 0:45 | SSH Keys Explained**

SSH (Secure Shell) is how you remotely connect to a server. You type commands on your laptop, and they execute on the server. Like a portal to another machine.

**Password auth vs SSH keys:**

Password auth: You type a password every time. It works, but passwords can be guessed, brute-forced, or intercepted. Not great.

SSH keys: You generate a key pair. Two files:

- **Private key** (`~/.ssh/id_ed25519`): Stays on YOUR machine. Never share this. Ever. This is your identity.
- **Public key** (`~/.ssh/id_ed25519.pub`): Goes on the server. This is like a lock that only your private key can open.

When you connect, your machine proves it has the private key without ever sending it over the network. It is mathematically impossible to derive the private key from the public key. This is public key cryptography, and it is one of the most important inventions in computer science.

Analogy: The public key is a padlock. You can give padlocks to anyone. The private key is the only key that opens those padlocks. You keep the key. You distribute the padlocks.

**Why server hardening matters:**

Right now a fresh server is running as root with password authentication enabled. This is like leaving your front door wide open with a sign that says "FREE STUFF INSIDE."

Bots are constantly scanning the internet for servers with weak passwords. Within minutes of your server going live, automated scripts will try to brute-force your root password. This is not a hypothetical. You can check it yourself:

```bash
# SSH into your server first, then run:
cat /var/log/auth.log | grep "Failed password" | tail -20
```

The hardening checklist:
1. Create a non-root user with sudo privileges
2. Disable root SSH login
3. Disable password authentication (SSH keys only)
4. Set up a firewall (UFW)
5. Keep the system updated

---

![](diagram:session-6-1/fig1-model)

### Treat the first login as a controlled change

A virtual machine is a remote computer with an operating system, processes, storage, and a network boundary. Provisioning it does not automatically make your application secure or available. Record the provider, region, operating system release, public address, and recovery-console location. Keep credentials out of that record. Confirm that you can reach the provider console before changing SSH or firewall settings, because that console may be the only route back after a mistake.

Create a named administrative account and verify its key-based login in a second terminal. Leave the original session open while testing. Only after the new account works should you disable an older access path. This sequence matters more than memorizing a hardening command: each change preserves a recovery route until its replacement is proven. A successful command exit does not demonstrate that a new login works.

### Read the network boundary explicitly

A host firewall and a provider firewall may both filter traffic. Allowing a port in one does not open it in the other. Write down which service owns each permitted port. SSH is administrative access; HTTP and HTTPS are public web entry points. The database and application process usually do not need direct public exposure when a reverse proxy handles traffic. Bind internal services to loopback where appropriate and verify their listening addresses.

Before enabling a restrictive firewall, allow the actual SSH port you use. Test from a second connection and retain console access. Do not assume a tutorial's port, username, or distribution matches your machine. When a command fails, inspect the current service and firewall configuration instead of repeatedly applying a copied sequence. Infrastructure work becomes safer when every step has an observable postcondition.

### Runtime installation remains a manual prerequisite

Choose an Active LTS or Maintenance LTS Node.js release supported by your application's dependencies. Record the exact version used locally and on the server. This curriculum uses existing tools for its browser checkpoints; it does not install language toolchains on your machine. Follow the official installation instructions yourself and verify node --version and npm --version afterward. [Node.js release policy](https://nodejs.org/en/about/previous-releases).

Avoid executing an unexplained remote installer as root. Read the provider's instructions, understand the repository or package source being added, and verify the resulting version. A development machine's global packages are not a deployment manifest. Commit the application lockfile and install its dependencies reproducibly in the deployment workflow. The operating system and runtime still need their own update policy.

### Plan capacity and recovery before traffic

A small server can be enough for a learning application, but memory, disk, and network limits still exist. Check available resources before running a database, build process, and application together. A frontend build can briefly consume more memory than the running server. If the machine becomes unresponsive during builds, investigate resource pressure rather than assuming SSH itself is broken.

Keep application data separate from disposable build output. Decide what must be backed up, how often, where backups live, and how you would restore one. A backup you have never restored is an untested hypothesis. For this session, a written restore plan and a disposable-file recovery drill establish the habit without touching real user data. The finished artifact should let another developer understand how to access, identify, and recover the machine.

## The demonstration

**0:45 - 0:55 | Demo: DigitalOcean Signup and Droplet Creation**

Walk through the signup process live:

1. Go to [digitalocean.com](https://www.digitalocean.com)
2. Sign up with GitHub (easiest)
3. Enter a payment method (required even with free credits)
4. Review current billing and any offer eligibility directly with the provider

Step-by-step droplet creation:

1. Click "Create" > "Droplets"
2. **Region:** Choose the closest to you (e.g., New York, San Francisco, London)
3. **Image:** a supported Ubuntu LTS release compatible with your chosen packages; verify the release-specific setup instructions
4. **Size:** Basic > Regular > $6/mo (1 GB RAM, 1 vCPU, 25 GB SSD, 1000 GB transfer)
   - The $4/mo plan has only 512 MB RAM. MongoDB will struggle. Spend the extra $2.
5. **Authentication:** We will set up SSH keys in a moment. For now, note that password auth exists but SSH keys are better.
6. **Hostname:** Give it a name like `my-mern-server` or `project2-server`
7. Click "Create Droplet"

It takes about 55 seconds. When it is done, you get an IP address. That IP address is YOUR server.

**Important concept:** That IP address (e.g., `164.92.105.23`) is where your server lives on the internet. Right now, if you go to that IP in a browser, nothing will load because we have not set up a web server yet. But the machine is running and waiting for you.

**0:55 - 1:10 | Demo: Generating SSH Keys and Connecting**

**Step 1: Check if you already have SSH keys**

```bash
ls -la ~/.ssh/
```

If you see `id_ed25519` and `id_ed25519.pub` (or `id_rsa` and `id_rsa.pub`), you already have keys. You can use those or generate new ones.

**Step 2: Generate a new SSH key pair**

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

- `-t ed25519`: Use the Ed25519 algorithm (modern, fast, secure)
- `-C "your_email@example.com"`: A comment/label for the key

When prompted:
- **File location:** Press Enter for the default (`~/.ssh/id_ed25519`)
- **Passphrase:** Optional but recommended. It encrypts your private key so even if someone steals the file, they cannot use it without the passphrase.

**Step 3: View your public key**

```bash
cat ~/.ssh/id_ed25519.pub
```

This outputs something like:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHGkjhJKLMNOPqrstuvwxyz1234567890abcdef your_email@example.com
```

**Step 4: Add your public key to the server**

If you created the droplet with password auth, you can copy your key to the server:

```bash
ssh-copy-id root@YOUR_DROPLET_IP
```

This will ask for your root password (the one DigitalOcean emailed you or you set during creation), then automatically add your public key to the server's `~/.ssh/authorized_keys` file.

**Step 5: Connect via SSH**

```bash
ssh root@YOUR_DROPLET_IP
```

If your key is set up correctly, you will connect without being asked for a password. You are now ON the server. Every command you type runs on that remote machine.

To disconnect:

```bash
exit
```

**1:10 - 1:30 | Demo: Server Hardening**

SSH into your server as root:

```bash
ssh root@YOUR_DROPLET_IP
```

**Step 1: Update the system**

```bash
apt update && apt upgrade -y
```

This updates the package list and upgrades all installed packages. Always do this first on a new server.

**Step 2: Create a new user**

```bash
adduser deploy
```

You will be prompted to set a password and fill in optional info (you can press Enter to skip the optional fields). Use a strong password.

**Step 3: Give the user sudo privileges**

```bash
usermod -aG sudo deploy
```

This adds the `deploy` user to the `sudo` group, which means they can run commands as root by prefixing them with `sudo`.

**Step 4: Copy SSH keys to the new user**

```bash
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

This copies the `authorized_keys` file from root's home directory to the new user's home directory, and sets the correct ownership. Now you can SSH in as `deploy` using the same SSH key.

**Step 5: Test the new user (open a NEW terminal window)**

```bash
ssh deploy@YOUR_DROPLET_IP
```

You should connect without a password (your SSH key works). Test sudo:

```bash
sudo whoami
```

It should output `root`. Your user has sudo powers.

**Step 6: Lock down SSH**

Now we disable root login and password auth. Do this ONLY after confirming you can SSH in as your new user.

```bash
sudo nano /etc/ssh/sshd_config
```

Find and change these lines (some may be commented out with `#`):

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter` in nano).

Restart the SSH service:

```bash
sudo systemctl restart sshd
```

**WARNING:** If you mess this up and lock yourself out, you can use DigitalOcean's web console (Recovery > Launch Recovery Console) to fix it. But let's not mess it up.

**Step 7: Set up UFW firewall**

UFW (Uncomplicated Firewall) is Ubuntu's built-in firewall tool. It blocks all incoming traffic except what you explicitly allow.

```bash
# Allow SSH (ALWAYS do this first or you will lock yourself out)
sudo ufw allow OpenSSH

# Allow HTTP (port 80) for web traffic
sudo ufw allow 80/tcp

# Allow HTTPS (port 443) for secure web traffic
sudo ufw allow 443/tcp

# Enable the firewall
sudo ufw enable

# Check the status
sudo ufw status verbose
```

Expected output:

```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
OpenSSH (v6)               ALLOW       Anywhere (v6)
80/tcp (v6)                ALLOW       Anywhere (v6)
443/tcp (v6)               ALLOW       Anywhere (v6)
```

**Step 8: Install Node.js**

We will use NodeSource to install a specific version of Node.js (not the ancient one from Ubuntu's default repos).

```bash
# Install curl if not already installed
sudo apt install -y curl

# Download and run the NodeSource setup script for a supported Node.js LTS
# MANUAL PREREQUISITE: install a supported Node.js LTS using its official instructions

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

Verify that the installed versions match the supported LTS runtime and package-manager versions you selected manually.

Test it:

```bash
node -e "console.log('Hello from the cloud! Node.js is alive.')"
```

---

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-6-1
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
function mayDisableOldAccess(state) {
  return state.newLoginVerified && state.consoleAvailable && state.firewallAllowsSSH;
}
check(!mayDisableOldAccess({newLoginVerified: false, consoleAvailable: true, firewallAllowsSSH: true}), 'Preserve recovery before proof');
check(mayDisableOldAccess({newLoginVerified: true, consoleAvailable: true, firewallAllowsSSH: true}), 'All access prerequisites verified');
console.log('ok: checkpoint-6-1');
```

## Where it breaks

![](diagram:session-6-1/fig2-diagnosis)

### Locked out

The new key is not in `authorized_keys` yet, and you already disabled password login, or you replaced the only key that worked. The next SSH attempt is refused, and the cloud console is now the only door. Before you turn off the old way in, open a second terminal and log in with the new key. Leave the first session open until that succeeds. If you do lock yourself out, the provider's web console or a recovery mode is the path back, not another SSH attempt with the same key.

### Wrong host

`ssh` warns that the host key has changed, or you reach a machine that is not the one you provisioned. That warning is the client telling you the server at this address is not the server it remembered. Do not type `yes` to clear it until you know why it changed. A rebuild replaces the host key. A typo in the IP, or a record that still points at the old box, connects you to something else entirely. Check the provider's page for the address and the key fingerprint, then decide.

### Unsupported runtime

The deploy script installs whatever `node` the default image has, and it is not the version your app runs on. A native addon fails, or a syntax error cites a feature your laptop has and the server does not. Pick a current LTS yourself, install that, and write the version down in the runbook. `node -v` on the server should match the version you tested. "Latest" is not a version. It is a moving target that will change under a working app.

## Your turn

> **Exercise 1: Spin Up Your Cloud Machine**
>
> 1. Sign up for DigitalOcean (review current pricing and billing directly with the provider)
> 2. Create a droplet with these settings:
>    - Region: closest to you
>    - Image: Ubuntu 24.04 LTS
>    - Plan: Basic, Regular, $6/mo (1 GB RAM)
>    - Authentication: Password (we will switch to SSH keys shortly)
>    - Hostname: `yourname-server`
> 3. Write down your droplet's IP address. You will need it for the rest of this unit.
>
> **Deliverable:** A running droplet with an IP address you can share in chat.

> **Exercise 2: Generate Keys and SSH In**
>
> 1. Generate an SSH key pair (if you do not have one):
>    ```bash
>    ssh-keygen -t ed25519 -C "your_email@example.com"
>    ```
> 2. Copy your public key to your droplet:
>    ```bash
>    ssh-copy-id root@YOUR_DROPLET_IP
>    ```
> 3. SSH into your server:
>    ```bash
>    ssh root@YOUR_DROPLET_IP
>    ```
> 4. Run these commands on the server to prove you are connected:
>    ```bash
>    hostname
>    whoami
>    uname -a
>    df -h
>    free -m
>    ```
> 5. Take a screenshot of your terminal showing you are connected to the remote server.
> 6. Type `exit` to disconnect.
>
> **Deliverable:** Screenshot showing successful SSH connection with the output of the commands above.

---

## The quest

> **Exercise 3: Harden Your Server**
>
> Complete the following on your server:
>
> 1. Create a `deploy` user with sudo privileges
> 2. Copy your SSH keys to the new user
> 3. Disable root login in `/etc/ssh/sshd_config`
> 4. Disable password authentication
> 5. Set up UFW firewall allowing SSH, HTTP, and HTTPS
> 6. Install a supported Node.js LTS
> 7. Run this verification script:
>
> ```bash
> echo "=== Server Hardening Verification ==="
> echo "Current user: $(whoami)"
> echo "Sudo access: $(sudo whoami)"
> echo "Node version: $(node --version)"
> echo "NPM version: $(npm --version)"
> echo "UFW status:"
> sudo ufw status
> echo "Root login disabled:"
> grep "PermitRootLogin" /etc/ssh/sshd_config
> echo "Password auth disabled:"
> grep "PasswordAuthentication" /etc/ssh/sshd_config
> echo "=== Verification Complete ==="
> ```
>
> **Deliverable:** Screenshot of the verification script output.

**Wrap-Up (Last 5 min of Practice block)**

What you accomplished today:
- Learned what a VPS is and why it matters
- Created a DigitalOcean droplet (your cloud machine)
- Generated SSH keys and connected to your server securely
- Created a non-root user with sudo privileges
- Hardened the server (disabled root login, disabled password auth, set up firewall)
- Installed Node.js on the server

Your server is now secure, running, and ready for software. In the next session, we install Nginx and PM2 to actually serve your app to the world.

---

### Review the artifact

Your deliverable is **A manually provisioned server access plan with a verified recovery path**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-6-1/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Ensure you have a credit/debit card ready for cloud provider signup (free credits available). Confirm your MERN app from Unit 4 (Project 2) runs on localhost. Review basic terminal commands (cd, ls, mkdir, nano).
**Materials:** DigitalOcean referral link (shared in Discord), terminal application, web browser

---

**HW 6.1: Server Setup and Exploration**

1. **Complete all in-class exercises** if you did not finish during class.

2. **Install Git on your server:**
   ```bash
   sudo apt install -y git
   git --version
   ```

3. **Clone your MERN project to the server:**
   ```bash
   cd /home/deploy
   git clone https://github.com/YOUR_USERNAME/your-mern-project.git
   cd your-mern-project
   ```
   (Use the backend/server directory if your project is split into separate repos)

4. **Install project dependencies on the server:**
   ```bash
   npm install
   ```

5. **Research task:** Read the DigitalOcean tutorial "Initial Server Setup with Ubuntu 24.04" (search for it). Write down 2 things from the tutorial that this session did not cover.

6. **Stretch goal:** Try running your Node.js/Express backend on the server:
   ```bash
   node server.js
   ```
   It will probably fail because MongoDB is not set up yet. That is fine. Note the error message. We will fix it in Session 6.4.

**Submission:** Push a screenshot of your cloned project on the server and your 2 findings from the DigitalOcean tutorial to your homework repo.

---

### Manual verification and further reading

- [Official reference 1](https://nodejs.org/en/about/previous-releases)
- [Official reference 2](https://documentation.ubuntu.com/server/how-to/security/firewalls/)
