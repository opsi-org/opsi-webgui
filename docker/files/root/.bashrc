# ~/.bashrc: executed by bash(1) for non-login shells.

# --- Colorful ls and grep aliases ---
export LS_OPTIONS='--color=auto'
eval "$(dircolors -b)"
alias ls='ls --color=auto'
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'
alias ll='ls -l'

# --- Prompt color support detection ---
force_color_prompt=yes
if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
        color_prompt=yes
    else
        color_prompt=
    fi
fi

# --- Git branch in prompt ---
parse_git_branch() { git rev-parse --abbrev-ref HEAD 2>/dev/null; }

# --- Set prompt format: user:/path[branch] ---
if [ "$color_prompt" = yes ]; then
    PS1='\[\033[01;32m\]\u\[\033[00m\]:\[\033[01;34m\]\w\[\033[01;36m\][$(parse_git_branch)]\[\033[00m\]\$ '
else
    PS1='\u:\w[$(parse_git_branch)]\$ '
fi
unset color_prompt force_color_prompt

# --- Git completion ---
source /usr/share/bash-completion/completions/git