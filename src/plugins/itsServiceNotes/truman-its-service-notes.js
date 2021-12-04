/**
 * A Node module to get new Truman ITS Service Notes.
 * 2021 Brandon Ingli
 * https://portfolio.brandoningli.com
 */

const https = require("https");
const fs = require("fs");

const LASTCHECKFILENAME = "plugins/itsServiceNotes/lastCheckTime.txt";
const TIMEOUT_MS = 10000;

/**
 * Strips HTML tags, carriage returns, decodes common HTML entities, and trims.
 * @param {string} input HTML to be unescaped
 * @returns {string} Unescaped string
 */
function unescapeHTML(input) {
  function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
      nbsp: " ",
      amp: "&",
      quot: '"',
      lt: "<",
      gt: ">",
    };
    return encodedString
      .replace(translate_re, function (match, entity) {
        return translate[entity];
      })
      .replace(/&#(\d+);/gi, function (match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
      });
  }

  input = input.replace(/(<([^>]+)>)/gi, "");
  input = input.replace(/\r/gi, "");
  input = decodeEntities(input);
  input = input.replace(/\s\n/gi, "\n");
  return input.trim();
}

/**
 * Reads the last check time from from the filesystem.
 * On error, setLastCheckTime() is called and the current time is returned.
 * @returns {Date} Date of last check time, or current time on read error
 */
function getLastCheckTime() {
  try {
    const data = fs.readFileSync(LASTCHECKFILENAME, "utf8");
    // return new Date("2010-01-01 00:00:00"); // To test, uncomment this and comment line below
    return new Date().setTime(data);
  } catch (err) {
    setLastCheckTime();
    return new Date();
  }
}

/**
 * Write the current time to the filesystem to indicate the last check time.
 * @returns {bool} true if set was successful, false otherwise
 */
function setLastCheckTime() {
  try {
    const data = fs.writeFileSync(LASTCHECKFILENAME, String(Date.now()));
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Generates a Promise for an api call to get current service notes.
 * This is done so the call can be await-ed later.
 * @returns {Promise} Promise for api call
 */
function getServiceNotesPromise(abortcontrol) {
  return new Promise((resolve, reject) => {
    https.get(
      {
        host: "api.truman.edu",
        path: "/its/service-notes",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: abortcontrol.signal,
      },
      (response) => {
        let chunks_of_data = [];

        response.on("data", (fragments) => {
          chunks_of_data.push(fragments);
        });

        response.on("end", () => {
          let response_body = Buffer.concat(chunks_of_data).toString("utf8");
          resolve(response_body.toString());
        });

        response.on("error", (error) => {
          reject(error);
        });
      }
    );
  });
}

/**
 * Gets an array of active service notes.
 * @returns {object[]} Array of service notes straight from the API, possibly empty
 */
async function getActiveServiceNotes() {
  try {
    let abortcontrol = new AbortController();
    let returner;
    let failed = false;
    let response_body;
    var timeout;

    let https_promise = getServiceNotesPromise(abortcontrol);
    await Promise.any([
      new Promise((resolve, reject) => {
        timeout = setTimeout(() => {
          failed = true;
          resolve();
        }, TIMEOUT_MS);
      }),
      new Promise(async (resolve, reject) => {
        response_body = await https_promise;
        resolve();
      }),
    ]);
    if (failed) {
      abortcontrol.abort();
      throw "Timeout";
    } else {
      clearTimeout(timeout);
    }

    let response_obj = JSON.parse(response_body);

    try {
      returner = response_obj._embedded.service_notes;
    } catch {
      returner = [];
    }

    return returner;
  } catch (e) {
    throw e;
  }
}

/**
 * Get the service notes that are active and have been updated since the last check.
 * @returns {object[]} Array of reformatted service notes, possibly empty. Each note has the format
 * {
 *  "updated": Date,
 *  "title": string,
 *  "content": string
 * }
 */
async function getNewServiceNotes() {
  try {
    var notes = await getActiveServiceNotes();
  } catch (e) {
    throw e;
  }
  let lastCheckTime = getLastCheckTime();
  let newNotes = [];

  for (const note of notes) {
    let entryDate = new Date(note.EntryDate + " UTC");
    if (entryDate.valueOf() > lastCheckTime.valueOf()) {
      newNotes.push({
        updated: entryDate,
        title: note.ShortDesc,
        content: unescapeHTML(note.LongDesc),
      });
    }
  }

  setLastCheckTime();

  return newNotes;
}

/**
 * Gets a fake service note, following the format of getNewServiceNotes, for testing purposes.
 * @returns {Object[]} Array of a fake service note. Like real ones from getNewServiceNotes, it has the format
 * {
 *  "updated": Date,
 *  "title": string,
 *  "content": string
 * }
 */
async function mockNewServiceNotes() {
  return [
    {
      updated: new Date("2020-03-11, 18:01:00 CDT"),
      title: "Important Update to University's COVID-19 Response",
      content:
        "As you are aware, our University has been closely monitoring the COVID-19 outbreak for some time. With the continued, rapidly changing landscape of the outbreak and our primary focus on the health, safety, and well-being of everyone on our campus, the COVID-19 Response Team* determined today that we are suspending in-person classes for the week of March 15-21.\n\nStudents are not to return to campus during this week.",
    },
  ];
}

/**
 * Main function when this module is called directly.
 * Gets new service notes and prints them to the console.
 */
async function main() {
  try {
    // let notes = await mockNewServiceNotes();
    let notes = await getNewServiceNotes();
    for (const note of notes) {
      spikeKit.logger.info(note.title);
      spikeKit.logger.info(note.updated);
      spikeKit.logger.info(note.content);
      spikeKit.logger.info("\n#####\n");
    }
    if (notes.length == 0) {
      spikeKit.logger.info("No new notes.");
    }
    return;
  } catch (e) {
    spikeKit.logger.error(e);
    return;
  }
}

module.exports = {
  getActiveServiceNotes,
  getNewServiceNotes,
  mockNewServiceNotes,
};

if (require.main === module) {
  main();
}
