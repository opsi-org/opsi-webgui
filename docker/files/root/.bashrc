# ~/.bashrc: executed by bash(1) for non-login shells.

# --- Colorful ls and grep aliases ---
export LS_OPTIONS='--color=auto'
eval "$(dircolors -b)"
alias ls='ls --color=auto'
alias grep='grep --color=auto
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'
alias ll='ls -l'

# shorten long paths
export PROMPT_DIRTRIM=2

# --- Prompt color support detection ---
force_color_prompt=yes
if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
        color_prompt=yes
    else
        color_prompt=
    fi
fi

# --- Git branch in prompt (quiet when not a repo) ---
parse_git_branch() { git rev-parse --abbrev-ref HEAD 2>/dev/null || echo ""; }

# --- Set prompt format: user:path (branch) with distinct colors ---
# user: green (1;32), path: yellow (1;33), branch: magenta (1;35)
if [ "$color_prompt" = yes ]; then
    PS1='\[\e[1;32m\]\u\[\e[0m\]:\[\e[1;33m\]\w\[\e[0m\]$( [ -n "$(parse_git_branch)" ] && echo " \[\e[1;35m\]($(parse_git_branch))\[\e[0m\]" )\$ '
else
    PS1='\u:\w$( [ -n "$(parse_git_branch)" ] && echo " [$(parse_git_branch)]" )\$ '
fi
unset color_prompt force_color_prompt

# --- Git completion ---
source /usr/share/bash-completion/completions/git
