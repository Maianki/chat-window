const moment = require("moment");

let formatMessage = (username, message) => {
  return {
    username,
    message,
    time: moment().format("h:mm a"),
  };
};

module.exports = formatMessage;
