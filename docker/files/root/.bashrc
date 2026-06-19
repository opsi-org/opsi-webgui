# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# Git branch helper function
parse_git_branch() {
    git branch 2>/dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ [\1]/'
}

# Colored PS1: user@host (green), path (blue), git branch (yellow)
export PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[33m\]$(parse_git_branch)\[\033[00m\]\$ '