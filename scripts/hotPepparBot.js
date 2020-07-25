const http = require('http');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  'd3h5mjgqac7vqk',
  'cizedaqmsfeopj',
  'b76c8390159bfa23be1ac2bb1bf4a9640eefd9acb50e52f042f0b14546c8863b',
  {
    //host: 'ホスト名',
  host: 'localhost',
  dialect: 'postgres'
  });

const Logs = sequelize.define('messagelogs', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: Sequelize.TEXT,
  user_name: Sequelize.TEXT,
  message: Sequelize.TEXT
  },
  {
    freezeTableName: true // stick to the table name we defined
  }
);

sequelize.sync({force: false, alter: true});
console.log("start");

module.exports = (robot) => {
  robot.hear(/(.*)$/, async (res) => {
    console.log("rec");
    let newLog = new Logs({
      user_id: res.message.user.id,
      user_name: res.message.user.displayName,
      message: res.match[0].slice(6)
    });
    await newLog.save();
  });

  robot.respond(/PRINT$/i, (res) => {
    Logs.findAll().then(function(result) {
      let allMessages = result.map(function(e) {
        let timeStamp = e.createdAt.toLocaleDateString() + " " + e.createdAt.toLocaleTimeString();
        return e.user_name + "[" + timeStamp + "]:" + e.message;
      });
      res.send(allMessages.join('\n'));
    });
  });

  robot.respond(/CLEAR$/i, async (res) => {
    await Logs.destroy({ where:{} });
  });

  robot.respond(/店$/i, async (res) => {
    const url = 'http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=6275a5671c376b6a&order=4&address=東京&count=5&format=json'
    let restaurantData;
    http.get(url, function(httpResult) {
      let body = '';
      httpResult.on('data', function(chunk) {
        body += chunk;
      });
      httpResult.on('end', function(res) {
        restaurantData = JSON.parse(body);
        console.log(restaurantData.results.shop[0]);
      });
    });
  });
  
}
