# ~/.bashrc: executed by bash(1) for non-login shells.

# Note: PS1 and umask are already set in /etc/profile. You should not
# need this unless you want different defaults for root.
# PS1='${debian_chroot:+($debian_chroot)}\h:\w\$ '
# umask 022

# You may uncomment the following lines if you want `ls' to be colorized:
export LS_OPTIONS='--color=auto'
eval "`dircolors -b`"
alias ls='ls --color=auto'
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'
#
# Some more alias to avoid making mistakes:
# alias rm='rm -i'
# alias cp='cp -i'
# alias mv='mv -i'
alias ll='ls -l'
#alias npm-uib='/usr/bin/dry --dry-save-package-json-to package-merged.json --dry-keep-package-json'
alias ls='ls --color=auto'

function npm-uib(){ /usr/bin/dry --dry-save-package-json-to package-merged.json --dry-keep-package-json "$@"; }
export -f npm-uib
# UI_COMPONENT_MODULE = "[submodule \"ui-components\"]
# 	path = opsiweb/components
# 	url = ../opsiweb-ui-components.git
# 	branch = $@
# "
# function gitall(){ echo ""; git submodule foreach "git $@"; echo ""; echo "Entering Main-Repository (opsiweb-ui)"; git "$@"; }
# function gitallcheckout(){ echo "[submodule \"ui-components\"]
#         path = opsiweb/components
#         url = ../opsiweb-ui-components.git
#         branch = $@
# " > .gitmodules; git submodule foreach "git checkout -B $@"; git checkout -B "$@"; }
function gitall(){ echo ""; cd opsiweb/uib-components; git "$@"; echo ""; cd -; echo "Entering Main-Repository (opsiweb-ui)"; git "$@"; }
function gitallcheckout(){ cd opsiweb/uib-components; git checkout -B "$@"; cd -; git checkout -B "$@"; }


# alias gitbr "branch --format='%(HEAD) %(color:yellow)%(refname:short)%(color:reset) - %(contents:subject) %(color:green)(%(committerdate:relative)) [%(authorname)]' --sort=-committerdate"
# alias gitcheckout = "!f(){ echo \"$1\"  && git submodule foreach 'echo \"$1\"' };f"

force_color_prompt=yes
if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
	# We have color support; assume it's compliant with Ecma-48
	# (ISO/IEC-6429). (Lack of such support is extremely rare, and such
	# a case would tend to support setf rather than setaf.)
	color_prompt=yes
    else
	color_prompt=
    fi
fi

if [ "$color_prompt" = yes ]; then
    PS1='\[\033[01;32m\]\u\[\033[00m\]:\[\033[01;34m\][\w]\[\033[00m\]\$ '
else
    PS1='\u:[\w]\$ '
fi
unset color_prompt force_color_prompt

source /usr/share/bash-completion/completions/git

parse_git_branch() {
     git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}
export PS1="\u@\h \[\033[32m\]\w\[\033[33m\]\$(parse_git_branch)\[\033[00m\] $ "
