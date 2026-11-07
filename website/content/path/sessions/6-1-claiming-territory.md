---
editorial: true
title: Claiming Territory
subtitle: Cloud Machines, SSH, and Server Setup
hook: "Everything you have built runs on your laptop. Today you rent a Linux machine in a data center, reach it with the key you already own, close every door but three, and leave it waiting for the guild hall."
read: 65
artifact: "A hardened Ubuntu 24.04 droplet with a deploy user, key-only SSH, UFW, Node 24, and the hall repos cloned, plus docs/server.md describing how to reach and recover it"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://docs.digitalocean.com/products/droplets/how-to/create/
  - https://docs.digitalocean.com/products/droplets/how-to/connect-with-ssh/
  - https://man.openbsd.org/sshd_config
  - https://documentation.ubuntu.com/server/how-to/security/firewalls/
  - https://github.com/nodesource/distributions
  - https://nodejs.org/en/about/previous-releases
say:
  - "Prove the new door opens before you lock the old one."
  - "sshd -T shows the config that is actually running, not the file you edited."
  - "Allow OpenSSH, then enable the firewall, never the other way round."
---

## The hook

The guild hall works. Bran sends Sera a letter, Ivo gets a 403, the pack refuses to go negative, and the AI feature you rebuilt in Unit 5 is merged on `main`. All of it runs on one machine, and that machine goes to sleep when you close the lid. Nobody else can open the hall, because the hall's address is `localhost`, and `localhost` means "this computer". Today you rent a second computer that never sleeps, in a building you will never visit, and you make it yours: a named account, a key instead of a password, a firewall with exactly three openings, and the same Node 24 your laptop runs.

By the end of the session you can type `ssh deploy@YOUR_DROPLET_IP` from your laptop and land in a shell on that machine without a password. Root cannot log in over the network. Passwords do not work over the network. `node --version` prints a 24 on both machines. Both hall repos are on GitHub and cloned onto the server, and `node server.js` fails there for the one reason you expect: there is no `.env` yet. That failure is the handoff to the rest of the unit.

> *You walk out past the last farm and plant a stake in the ground. Nothing is built yet. But the ground is yours, and you know the way back.*

## The idea

A VPS, a virtual private server, is a slice of a real machine in a data center, sold by the month and reachable over the internet. DigitalOcean calls the slice a droplet. You get an Ubuntu install, a public IPv4 address, root, and nothing else. No desktop, no editor, no Node. Every change you make is a command typed over SSH, and that is why Unit 1 made you live in the terminal first: on this machine the terminal is the only room.

The contrast with the places you have deployed before is the point. GitHub Pages, where the landing page and the memory game live, serves files and runs nothing. A droplet runs a process you start, keeps it running after you disconnect, and lets a browser on the other side of the planet reach it on port 80 and 443. Railway, which you will meet at the end of the unit, does the same job with the machine hidden; this unit shows you the machine first so the hidden one is not magic.

SSH, the secure shell, is a terminal session over the network. You already own the half of it that matters: in Unit 1 you generated `~/.ssh/id_ed25519` and `~/.ssh/id_ed25519.pub` and registered the public half with GitHub. The same pair works for a server. You paste the public key into the droplet when you create it, the private key never leaves your laptop, and the server lets in whoever can prove possession of the private key. A password can be guessed by a script a thousand times a minute. A 256-bit key cannot be guessed at all, so once key login works you switch password login off and the scripts hit a wall.

The order of operations is the whole lesson. Every hardening step closes a door, and some of those doors are the one you came in through. So you never close a door until you have walked through the new one in a second terminal and seen a prompt. First session stays open. Second session proves the new login. Only then does the first session run the command that disables the old way in. If you get that order right you will never need the provider's recovery console; if you get it wrong the console is the only way back, so you also write down where it is before you start.

What a sketch on a napkin should hold: a droplet with one public address. A named user, `deploy`, with `sudo`. Your ed25519 key in that user's `authorized_keys`. `sshd` configured so root and passwords are refused over the network, and verified with `sshd -T`, not with `grep`. UFW allowing `OpenSSH`, `80/tcp`, and `443/tcp`, enabled after the SSH rule exists. Node 24 from NodeSource. Git. Two clones under `/home/deploy`. The figure shows the three boundaries in that order: access, boundary, recovery.

![](diagram:session-6-1/fig1-model)

### What you are renting

Create a droplet with the Ubuntu 24.04 LTS image, the smallest Basic plan with 1 GB of memory, and the region nearest you. The 512 MB plan is cheaper and will run out of memory the first time Vite builds the client. Prices change; read the current number on the create page and write it in your notes rather than trusting a figure from a session. You need a payment method on the account, even for a trial credit, and you should set a billing alert while the console is open.

The hostname is `yourname-server`, with your own name. It is only a label the shell prints at the prompt, but it is the label you will read a hundred times, so make it one you recognize. When the droplet finishes booting, the console shows a public IPv4 address. That address is the server for the rest of the unit; this session writes it as `YOUR_DROPLET_IP`, and the example output uses `203.0.113.10`, a documentation address that belongs to nobody.

The create form has an authentication section with two choices, SSH key or password. Choose SSH key, click the button to add a new key, and paste the one line from `cat ~/.ssh/id_ed25519.pub`. That is the whole reason to generate the key before you open the form: the droplet is born with your public key in root's `authorized_keys`, root never has a password, and there is nothing to copy across later. The old two-step path, password first and keys afterwards, works, but it leaves a password on the machine during exactly the minutes when the scanning bots find a new address. One path.

### The order that keeps you out of the recovery console

Here is the sequence, said once in prose before you see the commands. You log in as root with the key. You update packages. You create `deploy`, give it `sudo`, and copy root's `~/.ssh` into `/home/deploy` with the ownership fixed, so the same key opens the new account. In a second terminal you log in as `deploy` and run `sudo whoami`; it prints `root`. Only now, with the root session still open, do you edit `sshd` so root login and password login are refused, test the file, restart the service, and reconfirm in a third attempt that `deploy` still gets in. Then you allow `OpenSSH` in UFW and enable it. Then Node, git, and the clones.

Each step has a visible postcondition: a prompt, the word `root`, two lines from `sshd -T`, a `Status: active` table, a version string. If the postcondition does not appear, stop and read, because the next step assumes it. A command that returned without complaint has not proven anything. The second terminal is the proof.

### What `sshd` actually reads

The main file is `/etc/ssh/sshd_config`. Its first real line on Ubuntu 24.04 is `Include /etc/ssh/sshd_config.d/*.conf`, and for most keywords the first value `sshd` sees wins. The drop-in directory is read first. DigitalOcean's image lets cloud-init write `/etc/ssh/sshd_config.d/50-cloud-init.conf` during the first boot, and depending on the image that file can carry `PasswordAuthentication yes`. If it does, the `PasswordAuthentication no` you carefully write into the main file is never used, and `grep` on the main file will cheerfully tell you passwords are off while they are on.

So the edit has two parts. Set the three lines in the main file, and look at the drop-in and remove it if it contradicts you. Then ask the daemon, not the file: `sudo sshd -T` prints the effective configuration after every include and default has been applied, in lowercase. The two lines you want to see are `permitrootlogin no` and `passwordauthentication no`. That command is your evidence for the rest of the path, and the checkpoint below models why.

The service on Ubuntu is `ssh`, not `sshd`. `sudo sshd -t` tests the configuration and prints nothing when it is valid; `sudo systemctl restart ssh` applies it. The restart does not drop the session you are in, because an established connection keeps the process that is already serving it. New connections use the new rules.

### The firewall is a list, and the list is read before you enable it

UFW is the Ubuntu front for the kernel's packet filter. `ufw allow OpenSSH` adds a rule by application name, which the OpenSSH package registered as port 22; `ufw allow 80/tcp` and `ufw allow 443/tcp` add the two web ports. Nothing is enforced until `ufw enable`. When you run it, the tool warns that the command may disrupt existing SSH connections and asks `y` or `n`. You answer `y`, and your session survives, because the `OpenSSH` rule was added first. Enable with an empty list and the server is still there, with every port closed, including the one you are talking on.

Port 4100, where the hall will listen, is not in the list. That is deliberate. The API will sit behind Nginx on the loopback address, and Nginx will be the only process the outside can reach. A port that is not allowed is not a bug; it is the shape of the next session.

### Node, from NodeSource, not from Ubuntu's archive

`apt install nodejs` with no extra repository gives you the Node that was current when Ubuntu 24.04 was frozen, an 18 line that is out of support, and the hall's dependencies were installed and tested under 24. NodeSource publishes an apt repository per major version. The setup script adds their repository and signing key, and then `apt install -y nodejs` installs the 24 line from there. Node 24 is the Active LTS at the time of writing; the release schedule page in the docs list tells you when that changes. Read the script before you run it if you like, it is a shell file you downloaded to disk, and then run it with `sudo -E bash`. The version you must see afterwards starts with `v24`. Write that number next to the one on your laptop. "Latest" is not a version.

## The demonstration

One droplet, start to finish, from a laptop that has already done Unit 1. The commands marked laptop run in your own terminal. The commands marked server run inside an SSH session. The prompt tells you which: your laptop prompt is the one from your dotfiles, and the server prompt says `root@yourname-server` or `deploy@yourname-server`. Where you are at the start of today:

```text
laptop      ~/projects/hall-api and ~/projects/hall-client · nothing running
server A    not yet · becomes ssh root@YOUR_DROPLET_IP, the first terminal, once the droplet exists
server B    not yet · becomes ssh deploy@YOUR_DROPLET_IP, the second terminal that proves each step
browser     DigitalOcean console · the create form, then the droplet's Access tab
```

Before the console, the key. On the laptop:

```bash
# laptop
ls -la ~/.ssh
cat ~/.ssh/id_ed25519.pub
```

The listing shows `id_ed25519` and `id_ed25519.pub` from Unit 1. If it does not, generate the pair the way 1-4 did, `ssh-keygen -t ed25519 -C "you@example.com"`, and press Enter for the default path. `cat` prints one line beginning `ssh-ed25519 AAAA` and ending with your comment. Copy that whole line.

In the DigitalOcean console: Create, Droplets. Region nearest you. Image Ubuntu 24.04 (LTS) x64. Size Basic, Regular, the 1 GB option. Authentication SSH Key, New SSH Key, paste the line, name it after the laptop. Hostname `yourname-server`. Create. About a minute later the droplet has an address. Write it in your notes as the server IP. Also find, on the droplet's page, the Access tab with the recovery console button. Do not use it. Know where it is.

First login, from the laptop:

```bash
# laptop
ssh root@203.0.113.10
```

```text
The authenticity of host '203.0.113.10 (203.0.113.10)' can't be established.
ED25519 key fingerprint is SHA256:3kq1x9m0dH7Yq2JrVbXk8tN5p3cF0e1LwZ6yA4uRs9o.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '203.0.113.10' (ED25519) to the list of known hosts.
root@yourname-server:~#
```

That question appears exactly once per address. Your laptop has never spoken to this machine and is asking you to vouch for its host key. On a brand-new droplet, `yes` is right. The next time you see that question for the same address, something changed, and the Wrong host diagnosis below is for you.

On the server, as root:

```bash
# server A, the root session
apt update && apt upgrade -y
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

`adduser` asks for a password and some optional fields; set a real password, because `sudo` will ask for it, and press Enter through the rest. `usermod -aG sudo deploy` puts the account in the group that may use `sudo`. The `rsync` line copies root's `.ssh` directory, which holds the `authorized_keys` cloud-init wrote from the key you pasted, into the new home with the new owner. That is how the same laptop key opens both accounts.

Now the second terminal. Open a new terminal window on the laptop and leave the root session alone:

```bash
# laptop, a second terminal window: it becomes server B
ssh deploy@203.0.113.10
sudo whoami
```

```text
[sudo] password for deploy:
root
```

The prompt reads `deploy@yourname-server:~$`, and `sudo whoami` prints `root`. That line is the one that allows the next step. Back in the root session, lock the daemon down:

```bash
# server A, the root session
cat /etc/ssh/sshd_config.d/50-cloud-init.conf
nano /etc/ssh/sshd_config
```

If the drop-in exists and contains `PasswordAuthentication yes`, remember it. In the main file, find the three keywords, uncomment them, and set them:

```text
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Save with Ctrl-O, Enter, Ctrl-X. Then remove the drop-in if it contradicted you, test, restart, and ask the daemon what it believes:

```bash
# server A, the root session
rm -f /etc/ssh/sshd_config.d/50-cloud-init.conf
sshd -t
systemctl restart ssh
sshd -T | grep -E '^(permitrootlogin|passwordauthentication)'
```

```text
permitrootlogin no
passwordauthentication no
```

`sshd -t` prints nothing when the file is valid. If it prints a line with a filename and a line number, fix that line before you restart; a daemon that fails to restart over a typo is the other way to lock yourself out. In the second terminal, type `exit`, then `ssh deploy@203.0.113.10` again. A prompt, with no password question, is the proof that the new rules admit you. Try `ssh root@203.0.113.10` from a third terminal and read `Permission denied (publickey)`. That refusal is correct, and you are allowed to be pleased by it.

The firewall, from the `deploy` session:

```bash
# server B, the deploy session
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

```text
Command may disrupt existing ssh connections. Proceed with operation (y|n)? y
Firewall is active and enabled on system startup
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp (OpenSSH)           ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
22/tcp (OpenSSH (v6))      ALLOW IN    Anywhere (v6)
80/tcp (v6)                ALLOW IN    Anywhere (v6)
443/tcp (v6)               ALLOW IN    Anywhere (v6)
```

Default deny incoming, three openings. Your session is still alive because the first rule was `OpenSSH`. Now Node and git:

```bash
# server B, the deploy session
curl -fsSL https://deb.nodesource.com/setup_24.x -o nodesource_setup.sh
sudo -E bash nodesource_setup.sh
sudo apt install -y nodejs git
node --version
npm --version
git --version
```

```text
v24.11.0
11.6.1
git version 2.43.0
```

Your patch numbers will differ; the `v24` is what matters, and it must match the major version on your laptop. If `node --version` prints `v18`, the NodeSource step did not run and apt installed Ubuntu's own package; the Unsupported runtime diagnosis below is the fix.

Now the repos. This is the step older notes skipped: 4-15 ended with a commit, not a push, and the AI feature from Unit 5 was merged on a branch on your laptop. Both repos have to be on GitHub before the server can have them. On the laptop:

```bash
# laptop
cd ~/projects/hall-api
git status
git check-ignore .env
gh repo create hall-api --public --source=. --push
cd ~/projects/hall-client
git status
gh repo create hall-client --public --source=. --push
```

`git status` should say the working tree is clean on `main`; commit anything that is not. `git check-ignore .env` prints `.env`, which proves the secrets file will not travel. `gh repo create` with `--source=. --push` is the command from 2-5, and it prints the new repository's URL. Public is fine here; the hall has no secrets in code, which is exactly what the `.gitignore` line is for. If you prefer private repositories, the server needs its own way to authenticate, either `gh auth login` on the droplet or a deploy key from the GitHub docs, and the clone lines below use the SSH form instead.

Back on the server, as `deploy`:

```bash
# server B, the deploy session
cd ~
git clone https://github.com/YOUR_GITHUB_USER/hall-api.git
git clone https://github.com/YOUR_GITHUB_USER/hall-client.git
cd ~/hall-api
npm install
node server.js
```

```text
/home/deploy/hall-api/server.js:7
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
                               ^

Error: JWT_SECRET is required
```

That is the right failure. The guard you wrote in 4-12 refuses to listen without a secret, and this machine has no `.env`. Try `node --env-file=.env server.js` and Node tells you the file does not exist. Do not create it today. The database it would point at does not exist on this machine either, and 6-4 builds both the file and the database in one sitting. Note the error text in your docs and move on.

A small model you can run here. It does not open a socket or edit a file. It models two rules from this session: how `sshd` picks a value when a drop-in and the main file disagree, and the order gate that decides when you may close the old door. It proves that you can state those rules. It does not prove your droplet is hardened; `sshd -T` and the second terminal prove that.

```js run=checkpoint-6-1
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function effective(files) {
  const seen = {};
  files.forEach(function (file) {
    Object.keys(file.values).forEach(function (key) {
      if (!(key in seen)) seen[key] = file.values[key];
    });
  });
  return seen;
}

const dropIn = { name: '50-cloud-init.conf', values: { PasswordAuthentication: 'yes' } };
const main = { name: 'sshd_config', values: { PasswordAuthentication: 'no', PermitRootLogin: 'no' } };

const withDropIn = effective([dropIn, main]);
check(withDropIn.PasswordAuthentication === 'yes', 'an included drop-in that comes first wins over the main file');

const withoutDropIn = effective([main]);
check(withoutDropIn.PasswordAuthentication === 'no' && withoutDropIn.PermitRootLogin === 'no', 'remove the drop-in and the main file is the effective config');

function mayDisableOldAccess(state) {
  return state.newLoginVerified && state.consoleAvailable && state.firewallAllowsSSH;
}
check(!mayDisableOldAccess({ newLoginVerified: false, consoleAvailable: true, firewallAllowsSSH: true }), 'Preserve recovery before proof');
check(mayDisableOldAccess({ newLoginVerified: true, consoleAvailable: true, firewallAllowsSSH: true }), 'All access prerequisites verified');

function enableFirewall(rules) {
  if (rules.indexOf('OpenSSH') === -1) throw new Error('the session you are typing in would be cut');
  return 'active';
}
let cut = false;
try { enableFirewall(['80/tcp', '443/tcp']); } catch (error) { cut = true; }
check(cut === true, 'enabling with no OpenSSH rule cuts your own session');
check(enableFirewall(['OpenSSH', '80/tcp', '443/tcp']) === 'active', 'allow OpenSSH first, then enable');

console.log('ok: checkpoint-6-1');
```

## Where it breaks

![](diagram:session-6-1/fig2-diagnosis)

### Locked out

`ssh deploy@YOUR_DROPLET_IP` answers `Permission denied (publickey)` and the root session you had open is gone too. The cause is order: password login was switched off, or the daemon was restarted with a broken file, before a second terminal had proven that the key opens the `deploy` account. A variant is the `rsync` step that was skipped, so `/home/deploy/.ssh/authorized_keys` does not exist and `deploy` has no key at all.

The fix is the recovery console on the droplet's Access page, which gives you a terminal that does not go through `sshd`. Log in there as root if root has a password, or reset the root password from the same page, then repair: run the `rsync` line, `sshd -t`, `systemctl restart ssh`, and try the key from your laptop again before closing the console. Then reread the order in the idea section, because the console is a fire exit, not a door.

### Wrong host

The laptop prints a block of `@` characters, `WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!`, and refuses to connect. Your `~/.ssh/known_hosts` remembers a host key for that address, and the machine answering now has a different one. Two causes, and they deserve different responses. You rebuilt or destroyed and recreated the droplet, so a new machine sits on the old address with a new key; that is expected. Or you typed a neighbour's address, or a record still points at a box you no longer own, and you are about to type your key into a stranger.

Check the address against the console before you do anything. If it is your rebuilt droplet, remove the stale line with `ssh-keygen -R 203.0.113.10` and connect again, answering the first-time question. If it is not your droplet, you have a typo or a stale DNS record, and no amount of `yes` will make that machine yours.

### Unsupported runtime

`node --version` on the server prints `v18.19.1`, or `npm install` in `hall-api` fails with a message about an unsupported engine, or `node --env-file=.env` is reported as a bad option. The server has Ubuntu's archived Node, because `apt install nodejs` ran without the NodeSource repository in place. The hall was built on 24 and `--env-file` arrived in 20.6, so the gap is not cosmetic.

Run the NodeSource setup script again and read its output for the line that says the repository was configured, then `sudo apt install -y nodejs`. If apt still reports the old version, `apt-cache policy nodejs` shows which repository is winning; the NodeSource entry should be at the top. Write the version that finally prints into `docs/server.md` beside the laptop's.

## Your turn

Do the demonstration on your own droplet. Each step has one line you should see.

1. On the laptop, `cat ~/.ssh/id_ed25519.pub`. You see one line beginning `ssh-ed25519`. Create the droplet with that key pasted in, Ubuntu 24.04, 1 GB, hostname `yourname-server`. Write the IP in your notes and find the recovery console button.
2. `ssh root@YOUR_DROPLET_IP`. Answer `yes` to the first-time host question. You see `root@yourname-server:~#`.
3. As root: `apt update && apt upgrade -y`, `adduser deploy`, `usermod -aG sudo deploy`, `rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy`. No errors from `rsync`.
4. In a second terminal: `ssh deploy@YOUR_DROPLET_IP` and `sudo whoami`. You see `root`. Leave both terminals open.
5. In the root terminal: edit `/etc/ssh/sshd_config` for `PermitRootLogin no`, `PasswordAuthentication no`, `PubkeyAuthentication yes`; `rm -f /etc/ssh/sshd_config.d/50-cloud-init.conf`; `sshd -t`; `systemctl restart ssh`. Then `sshd -T | grep -E '^(permitrootlogin|passwordauthentication)'` prints two lines ending in `no`.
6. In the second terminal, `exit` and reconnect as `deploy`. You get a prompt with no password question. From a third terminal, `ssh root@YOUR_DROPLET_IP` prints `Permission denied (publickey)`. Now close the root terminal.
7. As `deploy`: `sudo ufw allow OpenSSH`, `sudo ufw allow 80/tcp`, `sudo ufw allow 443/tcp`, `sudo ufw enable` and answer `y`, `sudo ufw status verbose`. You see `Status: active` and three ALLOW IN rules.
8. `curl -fsSL https://deb.nodesource.com/setup_24.x -o nodesource_setup.sh`, `sudo -E bash nodesource_setup.sh`, `sudo apt install -y nodejs git`, `node --version`. You see `v24.` and some patch number.
9. On the laptop, in `~/projects/hall-api`: `git status` clean, `git check-ignore .env` prints `.env`, `gh repo create hall-api --public --source=. --push`. Same for `hall-client`. Both print a GitHub URL.
10. On the server as `deploy`: clone both repos into `/home/deploy`, `cd ~/hall-api && npm install && node server.js`. You see `Error: JWT_SECRET is required`. That is the expected final line of the session.

If step 4 does not print `root`, do not go to step 5. Nothing after step 4 is safe until step 4 is true.

## The quest

![](diagram:session-6-1/fig3-evidence)

Write `docs/server.md` in `~/projects/hall-api` on your laptop, commit it, and push. It is the access plan another developer, or you in three months, would need to reach and recover this machine. No secrets, no private keys, no passwords. One page.

- Provider, region, plan, and the monthly price you read on the create page, with the date you read it.
- The public IP, the hostname, and the user you log in as. The exact `ssh` command.
- Where the recovery console is, in words, and what you would do there if the key stopped working.
- The two lines `sshd -T` printed for `permitrootlogin` and `passwordauthentication`.
- The `ufw status verbose` table, pasted.
- `node --version` on the server and on the laptop, side by side.
- The two clone URLs and the error `node server.js` printed in `hall-api`.
- One sentence on the order rule: which terminal was open while which door was closed.

Evidence: the committed `docs/server.md`, a screenshot named `6-1-sshd-T.png` of the two `sshd -T` lines, and a screenshot named `6-1-ufw.png` of the firewall table.

## Side quests

The named account and the sudo group are authentication and authorization in their smallest form, and a drop-in that silently re-enables passwords is the textbook security misconfiguration, so the two library sheets for this session read like a second look at your own `sshd -T` output.

## Before next session

Leave the droplet running; it is the one machine on the path that stays up between sessions from now on. Nothing is listening on it yet except `sshd`, and that is correct. Close every SSH session with `exit` when you are done. On the laptop nothing is running. State at close:

```text
laptop      ~/projects/hall-api and ~/projects/hall-client · both pushed to GitHub · nothing running
server A    ssh deploy@YOUR_DROPLET_IP · /home/deploy/hall-api and hall-client cloned · only sshd listening · closed with exit
server B    closed with exit · not needed until 6-2
browser     DigitalOcean console · droplet running · nothing else open
```

Next session installs Nginx on this server, puts a page on port 80 that a browser anywhere can open at `http://YOUR_DROPLET_IP`, and then stands Nginx in front of a Node process on a loopback port, which is the shape the hall will use. Read the Nginx beginner's guide in next session's docs list once before you arrive, just the part about `server` and `location` blocks. Bring the IP and the `deploy` login; the session starts with `ssh deploy@YOUR_DROPLET_IP`.
