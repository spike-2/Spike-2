const spikeLog = (str) => {
  fs = require("fs");
  const FILENAME = "../spikeLog.txt";

  const time = new Date();
  fs.appendFile(FILENAME, `${time} ~~ ${str}\n`, (err, t) => {
    if (err) return console.log(err);
  });
};

module.exports = { spikeLog };
