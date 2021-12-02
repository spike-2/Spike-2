testing:
	sed -i 's/PREFIX = "\$$"/PREFIX = "%"/g' src/main.js
	rm -f plugins/itsServiceNotes/lastCheckTime.txt

resetTesting:
	sed -i 's/PREFIX = "%"/PREFIX = "\$$"/g' src/main.js

update:
	cp records.json /tmp/records.json.bak
	git checkout .
	git checkout main
	git pull
	npm ci
	cp /tmp/records.json.bak records.json
	rm /tmp/records.json.bak

clean:
	cp records.json /tmp/records.json.bak
	git reset --hard
	git clean -fdx -e ".env" -e ".env.testing"
	git checkout main
	git pull
	npm ci
	cp /tmp/records.json.bak records.json
	rm /tmp/records.json.bak