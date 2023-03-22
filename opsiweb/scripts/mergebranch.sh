#!/bin/bash
shopt -s extglob

# $1 is branchname existing in both repositories
# $2
# movedir="libmv"
# movedircommit="libpush"

# updateignore="gitig"
# updateremote="gitre"

#branch=$1
subrepoLocation="opsiweb/uib-components"
subrepoLocationNew="opsiweb/uib-components-old"
subrepoLocationFolder="uib-components"

# gitrepomain="opsiweb-ui"
gitreposub="opsiweb-ui-components"
giturlmain=$(git config --get remote.origin.url)
branch=$(git rev-parse --abbrev-ref HEAD)
echo ">> current branch: $branch"
### Checking out specific branch to merge
echo
echo ">> checking out current branch also in repo (if not already happened"
cd $subrepoLocation && git checkout $branch  && cd -


echo
echo ">> moving subrepo to new directory and move subrepo in folder named like suprepo in mainrepo (e.g. opsiweb/uib-components) so that location will be the same as before (after merging)"
mv $subrepoLocation $subrepoLocationNew
cd $subrepoLocationNew
mkdir -p $subrepoLocation
moving="mv -- !(.*|.git|$subrepoLocation) $subrepoLocation"
$($moving)
mv .config $subrepoLocation/.
mv .utils $subrepoLocation/.
mv .devcontainer $subrepoLocation/.
mv .docker $subrepoLocation/.
mv .gitignore $subrepoLocation/.
mv .gitlab $subrepoLocation/.
mv .gitlab-ci.yml $subrepoLocation/.
mv .npmignore $subrepoLocation/.
mv .vscode $subrepoLocation/.
cd -

echo
echo ">> commit moved data, so that main repo can easily merge (location will be the same as before)"
cd $subrepoLocationNew
git config --global --add safe.directory /workspace/$subrepoLocationNew
git add . && git commit -m "[chg] make ready for merging branch '$branch' to main-repository <opsiweb-ui>"
git push --set-upstream origin $branch
git push
cd -


cd $subrepoLocationNew
giturlsub=$(git config --get remote.origin.url)
cd -

### Adding new remote

echo
echo ">> update gitignore"

sed -i "/uib-components/d" .gitignore
echo "$subrepoLocationNew" >> .gitignore
git add .gitignore && git commit -m "[chg] update gitignore" && git push

echo
echo ">> adding subrepo as remote for main repo and merge the branch into the current one."
remoteadd="git remote add $gitreposub $giturlsub"
echo ">> '$remoteadd'"
$($remoteadd)
git fetch --all
git merge --allow-unrelated-histories $gitreposub/$branch

# remoteadd="git remote add $gitrepomain $giturlmain"
# $($remoteadd)

echo ""
echo "---> may need to resolve conflicts manually!"
echo "---> finish merge with 'git push' manually!"

#git checkout origin/newdesign
#git checkout newdesign
#git clone -b $(git rev-parse --abbrev-ref HEAD) git@gitlab.uib.gmbh:uib/opsiweb-ui-components.git opsiweb/uib-components && rm -r opsiweb/uib-components-old

#git push --set-upstream origin newdesign