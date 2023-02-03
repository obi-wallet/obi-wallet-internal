SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd ${SCRIPT_DIR}/..;

# Load environment variables
export $(grep -v '^#' apps/loop-mobile/.env | xargs)

# Create empty local.properties file
touch apps/loop-mobile/android/local.properties

# Create apps/loop-mobile/ios/Mobile/AppCenter-Config.plist
tee apps/loop-mobile/ios/Mobile/AppCenter-Config.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "https://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
    <key>AppSecret</key>
    <string>${IOS_APP_CENTER_SECRET}</string>
    </dict>
</plist>
EOF

# Create apps/loop-mobile/android/app/src/main/assets/appcenter-config.json
tee apps/loop-mobile/android/app/src/main/assets/appcenter-config.json <<EOF
{
  "app_secret": "${ANDROID_APP_CENTER_SECRET}"
}
EOF

# Load environment variables
export $(grep -v '^#' apps/obi-mobile/.env | xargs)

# Create empty local.properties file
touch apps/obi-mobile/android/local.properties

# Create apps/obi-mobile/ios/Mobile/AppCenter-Config.plist
tee apps/obi-mobile/ios/Mobile/AppCenter-Config.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "https://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
    <key>AppSecret</key>
    <string>${IOS_APP_CENTER_SECRET}</string>
    </dict>
</plist>
EOF

# Create apps/obi-mobile/android/app/src/main/assets/appcenter-config.json
tee apps/obi-mobile/android/app/src/main/assets/appcenter-config.json <<EOF
{
  "app_secret": "${ANDROID_APP_CENTER_SECRET}"
}
EOF

# Create empty React Cosmos userdeps file
touch libs/mobile/cosmos.userdeps.js

# Build provider
bash scripts/build-provider.sh
