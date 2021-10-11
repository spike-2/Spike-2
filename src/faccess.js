/**
 * @author Joshua Maxwell
 * This file deals with the bot files and data regarding users
 */
fs = require("fs");
const { spikeLog } = require("./log.js");

const FILENAME = "../records.json";
const PACKAGEFILENAME = "../package.json";
let dat;

/**
 * writes new data to data file
 */
const updateFile = () => {
  fs.writeFile(FILENAME, JSON.stringify(dat), (err, t) => {
    if (err) return console.log(err);
    spikeLog(`${JSON.stringify(dat)} > ${FILENAME}`);
  });
};

/**
 * reads the file into memory
 * @returns success message
 */
const readIn = () => {
  dat = fs.readFileSync(FILENAME, { encoding: "utf8", flag: "r" });
  dat = JSON.parse(dat);
  console.log(dat);
  return "Data file loaded";
};

/**
 * Gets the contents of package.json
 * @returns package.json contents
 */
const getPackage = () => {
  let info = fs.readFileSync(PACKAGEFILENAME, { encoding: "utf8", flag: "r" });
  info = JSON.parse(info);
  return info;
};

let index = 1;
/**
 * adds a given number of Spike Bucks to a given user
 * @param {User} user
 * @param {Integer} amount
 */
const addBucks = (user, amount) => {
  if (dat[user.id])
    // if user exists
    dat[user.id].wallet += amount;
  // otherwise, create user
  else dat[user.id] = { name: `${user.username}`, wallet: amount };

  // occasionally update data file
  if (index % 5 === 0) updateFile();
  ++index;
};

/**
 * gets student data by id
 * @param {string} id
 * @returns student object
 */
const getStudent = (id) => dat[id];

/**
 * gets all user data (for gamble.js)
 * @returns all user data
 */
const getDat = () => dat;

/**
 * gets the contents of the consts.json file
 * @returns an object containing large text constants
 */
const getConsts = () => {
  const consts = fs.readFileSync("../consts.json", {
    encoding: "utf8",
    flag: "r",
  });
  return JSON.parse(consts);
};

module.exports = {
  getStudent,
  readIn,
  updateFile,
  addBucks,
  getDat,
  getConsts,
  getPackage,
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
