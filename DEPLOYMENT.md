When you get your server, SSH in and run these commands:

```bash
# General system updates
sudo apt update -y
sudo apt upgrade -y

# Install common deps
sudo apt install \
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
sudo apt update -y

# Install docker
sudo apt install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io

# Add group 'docker'
sudo groupadd docker

# Add self to docker group
sudo usermod -aG docker $USER

# Apply group changes without relogin
sudo newgrp docker

# Chown docker directory
sudo chown "$USER":"$USER" /home/"$USER"/.docker -R
sudo chmod g+rwx "$HOME/.docker" -R

# Set docker to run on startup
sudo systemctl enable docker.service
sudo systemctl enable containerd.service

# Install docker compose
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Give the binary executable permissions
chmod +x /usr/local/bin/docker-compose

# Symlink it to /usr/bin
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# Check the version
docker-compose --version

# Add docker-compose file to execute the bot
cat >~/docker-compose.yaml <<EOL
version: '3.7'
services:
    discord-crossposter:
        image: ghcr.io/luludiscord/discord-crossposter/lulu/discord-crossposter:latest
        container_name: discord-crossposter
        restart: always
        environment:
            DISCORD_CROSSPOSTER_SERVICE_DISCORD_TOKEN: "my-auth-token" # Discord authentication token for a bot account
            DISCORD_CROSSPOSTER_SERVICE_CROSSPOST_CHANNEL_IDS: "233232322,3232322322,344344334" # A list of channel ids separated by commas
            DISCORD_CROSSPOSTER_SERVICE_CROSSPOST_INTEGRATIONS_ONLY: "true" # Set to true to only cross-post messages sent from bots/webhooks
            DISCORD_CROSSPOSTER_SERVICE_METRICS_SERVER_HOST: "127.0.0.1" # Optional, default is 0.0.0.0
            DISCORD_CROSSPOSTER_SERVICE_METRICS_SERVER_PORT: "3000" # Optional, default is 9090
            DISCORD_CROSSPOSTER_SERVICE_METRICS_SERVER_TRUST_PROXY: "true" # Optional, default is false
            DISCORD_CROSSPOSTER_SERVICE_ACTIVITY_ROLES_ASSOCIATIONS: "803776603976630272->88689a701e9283d4@806669244620079125" # Optional, the format is guildId->activityId@roleId
EOL

# Add helper functions to shell
cat >~/.bashrc <<EOL
function restart {
    (
        cd ~
        docker-compose down
        docker-compose up -d
    )
}

function logs {
    (
        cd ~
        docker-compose logs -t -f --tail=100
    )
}
EOL

# Apply changes from above
source ~/.bashrc

# Run the bot
cd ~ && docker-compose up -d
```
