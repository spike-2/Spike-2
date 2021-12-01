cp ../records.json /tmp/records.json.bak
git reset --hard
git clean -fd
git pull
npm ci
cp /tmp/records.json.bak ../records.json
rm /tmp/records.json.bak
