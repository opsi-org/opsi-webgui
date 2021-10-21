#!/bin/bash
set -eu -o pipefail

REQUIREDPACKAGES="liborc-0.4-0:amd64 libatk1.0-0:amd64 libdrm2:amd64 gstreamer1.0-plugins-good:amd64 libpng16-16:amd64 gstreamer1.0-gl:amd64 libexpat1:amd64 libgstreamer-plugins-bad1.0-0:amd64 libgpg-error0:amd64 libpangoft2-1.0-0:amd64 libxau6:amd64 libsecret-1-0:amd64 libpcre2-8-0:amd64 libxdmcp6:amd64 libffi7:amd64 libopus0:amd64 libepoxy0:amd64 libatk-bridge2.0-0:amd64 gstreamer1.0-libav:amd64 libgraphite2-3:amd64 zlib1g:amd64 libgdk-pixbuf2.0-0:amd64 libxdamage1:amd64 libxext6:amd64 libgstreamer-plugins-base1.0-0:amd64 libpixman-1-0:amd64 libxrender1:amd64 libegl1:amd64 libfontconfig1:amd64 libcairo-gobject2:amd64 libblkid1:amd64 liblzma5:amd64 libsqlite3-0:amd64 libx11-xcb1:amd64 libkeyutils1:amd64 gstreamer1.0-plugins-ugly:amd64 libgcrypt20:amd64 libxinerama1:amd64 libwayland-client0:amd64 libbrotli1:amd64 libfreetype6:amd64 libenchant1c2a:amd64 libx11-6:amd64 libunistring2:amd64 libsystemd0:amd64 libharfbuzz-icu0:amd64 libxcb1:amd64 libgstreamer1.0-0:amd64 libxcomposite1:amd64 libbsd0:amd64 glib-networking:amd64 libkrb5-3:amd64 libxi6:amd64 libatspi2.0-0:amd64 libstdc++6:amd64 libgssapi-krb5-2:amd64 libsoup2.4-1:amd64 libdatrie1:amd64 ca-certificates libgudev-1.0-0:amd64 libevdev2:amd64 libpcre3:amd64 libpsl5:amd64 libgstreamer-gl1.0-0:amd64 libwayland-server0:amd64 libgcc-s1:amd64 libhyphen0:amd64 libharfbuzz0b:amd64 libxrandr2:amd64 libwoff1:amd64 libdbus-1-3:amd64 libxfixes3:amd64 gstreamer1.0-plugins-bad:amd64 libglib2.0-0:amd64 libwayland-cursor0:amd64 libselinux1:amd64 libwayland-egl1:amd64 libthai0:amd64 libidn2-0:amd64 libxkbcommon0:amd64 libk5crypto3:amd64 libuuid1:amd64 liblcms2-2:amd64 libgbm1:amd64 libopenjp2-7:amd64 libicu66:amd64 libkrb5support0:amd64 gstreamer1.0-plugins-base:amd64 libpangocairo-1.0-0:amd64 libtasn1-6:amd64 libgl1:amd64 libmount1:amd64 libxcb-shm0:amd64 libwebp6:amd64 libcom-err2:amd64 libwebpdemux2:amd64 libnotify4:amd64 liblz4-1:amd64 shared-mime-info libpango-1.0-0:amd64 libudev1:amd64 libfribidi0:amd64 libxslt1.1:amd64 libxml2:amd64 libglx0:amd64 libxcb-render0:amd64 libjpeg-turbo8:amd64 libglvnd0:amd64 libcairo2:amd64 gstreamer1.0-pulseaudio:amd64 libxcursor1:amd64 libc6:amd64 libgtk-3-0:amd64"

if ! which apt-get >/dev/null; then
    echo "This script only supports apt-get based distributions like Debian or Ubuntu."
    exit 1
fi

# Calling dpkg-query is slow, so call it only once and cache the results
TMPCHECKPACKAGES="$(mktemp)"
dpkg-query --show --showformat='${binary:Package} ${db:Status-Status}\n' > "${TMPCHECKPACKAGES}"
TOINSTALL=""
for PACKAGE in ${REQUIREDPACKAGES}; do
    if ! grep -qxF "${PACKAGE} installed" "${TMPCHECKPACKAGES}"; then
        TOINSTALL="${TOINSTALL} ${PACKAGE}"
    fi
done
rm -f "${TMPCHECKPACKAGES}"

if [[ -z "${TOINSTALL}" ]]; then
    echo "All required dependencies are already installed"
else
    echo "Need to install the following extra packages: ${TOINSTALL}"
    [[ ${#} -gt 0 ]] && [[ "${1}" == "--printonly" ]] && exit 0
    SUDO=""
    [[ ${UID} -ne 0 ]] && SUDO="sudo"
    AUTOINSTALL=""
    if [[ ${#} -gt 0 ]] && [[ "${1}" == "--autoinstall" ]]; then
        AUTOINSTALL="-y"
        export DEBIAN_FRONTEND="noninteractive"
        [[ ${UID} -ne 0 ]] && SUDO="sudo --preserve-env=DEBIAN_FRONTEND"
        ${SUDO} apt-get update
    fi
    set -x
    ${SUDO} apt-get install --no-install-recommends ${AUTOINSTALL} ${TOINSTALL}
fi
