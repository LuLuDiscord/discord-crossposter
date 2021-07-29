When you get your server, SSH in and run these commands:

```bash
# General system updates
sudo apt-get update -y
sudo apt-get upgrade -y

# Install common deps
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add docker gpg key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add stable docker source
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update sources with new docker source
sudo apt-get update -y
# Install docker
sudo apt-get install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io

# Set docker to run on startup
sudo systemctl enable docker
```

This will install docker and set it to run on machine boot, making sure your application is running even if you had physical downtime.

Next, run:

```
docker login ghcr.io
```

You will need to enter your GitHub username and password, this will login to the GitHub container package registry and save your session token on the machine.

Copy paste the command below, and edit the environment fields according to [the example](.env.example) to fulfill your requirements.

```bash
cat >~/docker-compose.yaml <<EOL
version: '3.7'
services:
    discord-crossposter:
        image: ghcr.io/discord-crossposter/lulu/discord-crossposter:latest
        container_name: discord-crossposter
        hostname: discord-crossposter
        restart: always
        environment:
            DISCORD_CROSSPOSTER_SERVICE_DISCORD_TOKEN="<your token>"
            DISCORD_CROSSPOSTER_SERVICE_CROSSPOST_CHANNEL_IDS="<channelid1>,<channelid2>"
            DISCORD_CROSSPOSTER_SERVICE_CROSSPOST_INTEGRATIONS_ONLY="true"
EOL
```

Next, run the command, which will add a docker-compose config to your home directory. You can now navigate there, and start the process:

```bash
cd ~
docker-compose up -d
```
