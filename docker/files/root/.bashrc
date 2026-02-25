# Force interactive behavior for docker
if [ -z "$PS1" ]; then
    export PS1='\u@\h:\w$(parse_git_branch)\$ '
fi

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# Git branch helper function
parse_git_branch() {
    git branch 2>/dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}

# Minimal PS1 prompt: user@host:path (git-branch)$
export PS1='\u@\h:\w$(parse_git_branch)\$ '