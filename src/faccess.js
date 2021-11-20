/**
 * @author Joshua Maxwell
 * This file deals with the bot files and data regarding users
 */
fs = require("fs");

let files = {
  records: {
    name: "Records",
    filename: "../records.json",
    data: null,
  },
  package: {
    name: "Package",
    filename: "../package.json",
    data: null,
  },
  errors: {
    name: "Errors",
    filename: "../errors.json",
    data: null,
  },
  consts: {
    name: "Constants",
    filename: "../consts.json",
    data: null,
  },
};

/**
 * writes new data to data file
 */
const updateFile = () => {
  fs.writeFile(
    files.records.filename,
    JSON.stringify(files.records.data),
    (err, t) => {
      if (err) return console.log(err);
      console.log(
        `${JSON.stringify(files.records.data)} > ${files.records.filename}`
      );
    }
  );
};

/**
 * reads the file into memory
 * @returns success message
 */
const readIn = () => {
  console.log(files);
  Object.keys(files).forEach((key, index) => {
    try {
      files[key].data = fs.readFileSync(files[key].filename, {
        encoding: "utf8",
        flag: "r",
      });
      files[key].data = JSON.parse(files[key].data);
    } catch (e) {
      console.error(`${files[key].filename} doesn't exist or isn't readable.`);
      if (key == "records") {
        console.error(`Using empty object for records instead.`);
        files[key].data = {};
        updateFile();
      } else {
        console.error(`Exiting...`);
        process.exit(1);
      }
    }
    if (key == "records") {
      console.log(files[key].data);
    }
    console.log(`${files[key].name} loaded`);
  });
};

/**
 * Gets the contents of package.json
 * @returns package.json contents
 */
const getPackage = () => {
  return files.package.data;
};

let index = 1;
/**
 * adds a given number of Spike Bucks to a given user
 * @param {User} user
 * @param {Integer} amount
 */
const addBucks = (user, amount) => {
  if (files.records.data[user.id])
    // if user exists
    files.records.data[user.id].wallet += amount;
  // otherwise, create user
  else
    files.records.data[user.id] = { name: `${user.username}`, wallet: amount };

  // occasionally update data file
  if (index % 5 === 0) updateFile();
  ++index;
};

/**
 * gets student data by id
 * @param {string} id
 * @returns student object
 */
const getStudent = (id) => files.records.data[id];

/**
 * gets all user data (for gamble.js)
 * @returns all user data
 */
const getDat = () => files.records.data;

/**
 * gets the contents of the consts.json file
 * @returns an object containing large text constants
 */
const getConsts = () => {
  return files.consts.data;
};

const getErrs = () => {
  return files.errors.data;
};

module.exports = {
  getStudent,
  readIn,
  updateFile,
  addBucks,
  getDat,
  getConsts,
  getPackage,
  getErrs,
};

/**
 * This whole thing is going to function a lot differently than Java Spike
 *
 * In this version, everything will be stored in one place: a json file.
 * If you want to get or modify student data, you will need to go
 * through this module.
 *
 * Cleaner, simpler code. Yay abstraction!
 * This also mean creating yet another file system :(
 */
