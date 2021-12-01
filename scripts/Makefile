updateSpike:
	cp ../records.json /tmp/records.json.bak
	git checkout .
	git checkout main
	git pull
	npm ci
	cp /tmp/records.json.bak ../records.json
	rm /tmp/records.json.bak
