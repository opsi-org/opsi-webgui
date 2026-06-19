#!/bin/bash
# post_create.sh - Runs ONCE when the container is first created
# Keep this focused on INSTALLING things. Service startup is in post_start.sh.
set -e

echo "[post_create] Running as $(whoami)"

# Install uv
echo "[post_create] Installing uv..."
curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sudo sh
echo 'eval "$(uv generate-shell-completion bash)"' >> ~/.bashrc

# Setup bash config (colored prompt with git branch, useful aliases)
cat >> ~/.bashrc << 'EOF'

# Git branch in prompt
parse_git_branch() {
    git branch 2>/dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ [\1]/'
}
export PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[33m\]$(parse_git_branch)\[\033[00m\]\$ '

# Useful aliases
alias logs='sudo tail -f /var/log/opsi/opsiconfd/stderr.log'
alias status='sudo supervisorctl status'
EOF

# Pre-populate bash history with useful commands
cat > ~/.bash_history << 'EOF'
sudo tail -f /var/log/opsi/opsiconfd/stderr.log
sudo supervisorctl status
sudo supervisorctl restart opsiconfd
sudo supervisorctl stop opsiconfd
sudo supervisorctl start opsiconfd
curl -sk https://localhost:4447/admin/healthy
curl -sk -u adminuser:adminuser https://localhost:4447/addons/webgui/api/user/opsiserver
cd /workspace/frontend && pnpm install && pnpm dev
cd /workspace/frontend && pnpm dev
/workspace/scripts/restore-backup.sh
EOF

# Ensure workspace ownership
sudo chown -R $DEV_USER:$DEV_USER /workspace

# Clone or update opsiconfd
OPSICONFD_DIR=/workspace/docker/opsiconfd
if [ ! -d "$OPSICONFD_DIR/.git" ]; then
    echo "[post_create] Cloning opsiconfd..."
    git clone git@gitlab.uib.gmbh:uib/opsiconfd.git "$OPSICONFD_DIR" || \
        echo "[WARN] Could not clone opsiconfd - clone manually if needed"
else
    echo "[post_create] Pulling latest opsiconfd changes..."
    cd "$OPSICONFD_DIR"
    git pull --ff-only 2>/dev/null || true
fi

# Create opsiconfd venv and sync dependencies (reuses existing venv if present)
if [ -d "$OPSICONFD_DIR" ]; then
    echo "[post_create] Syncing opsiconfd dependencies..."
    cd "$OPSICONFD_DIR"
    # Remove broken venv (e.g., from host mount with different Python path)
    if [ -d .venv ] && ! .venv/bin/python --version >/dev/null 2>&1; then
        echo "[post_create] Removing broken venv (incompatible Python path)..."
        rm -rf .venv
    fi
    uv sync
    # Symlink static directory
    rm -f "$OPSICONFD_DIR/static"
    ln -sf "$OPSICONFD_DIR/opsiconfd_data/static" "$OPSICONFD_DIR/static"
fi

# Copy license if available locally
if [ -f /workspace/docker/test.opsilic ]; then
    echo "[post_create] Installing test license..."
    sudo mkdir -p /etc/opsi/licenses
    sudo cp /workspace/docker/test.opsilic /etc/opsi/licenses/test.opsilic
fi

# Install frontend dependencies (--force avoids interactive prompt)
echo "[post_create] Installing frontend dependencies..."
cd /workspace/frontend
pnpm install --force 2>/dev/null || echo "[WARN] pnpm install failed - run manually: cd /workspace/frontend && pnpm install"

echo "[post_create] Done."
