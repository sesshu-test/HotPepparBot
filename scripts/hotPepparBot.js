const http = require('http');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  'データベース名',
  'cizedaqmsfeopj',
  'パスワード',
  {
  //host: 'ホスト名',
  host: 'ec2-35-173-94-156.compute-1.amazonaws.com',
  dialect: 'postgres'
  });

const Logs = sequelize.define('searchhistory', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  word: Sequelize.TEXT
  },
  {
    freezeTableName: true // stick to the table name we defined
  }
);

sequelize.sync({force: false, alter: true});
console.log("start");

module.exports = (robot) => {

  robot.respond(/ご飯　(.*)$/i, async (res) => {
    let location = res.match[1];
    let url = `http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=xxxxxxx&format=json&order=4&count=3&address=${location}`
    let restaurantData;
    let restaurantInfo = [];
    http.get(url, function(httpResult) {
      let body = '';
      httpResult.on('data', function(chunk) {
        body += chunk;
      });
      httpResult.on('end', function(res) {
        restaurantData = JSON.parse(body);
        for(let i = 0; i < 3; i++){
          restaurantInfo[i] = `${restaurantData.results.shop[i].name}　　　 ${restaurantData.results.shop[i].urls.pc}`;
        }
      });
    });
    let sendInfo = function(){
      res.send(`${location}で人気のお店3つです! \n\n ${restaurantInfo[0]} \n\n ${restaurantInfo[1]} \n\n ${restaurantInfo[2]}`);
    };
    setTimeout(sendInfo, 1000);
    let newSearch = new Logs({
      word: res.match[1]
    });
    await newSearch.save();
  });

  robot.respond(/履歴$/i, (res) => {
    Logs.findAll().then(function(result) {
      let allWords = result.map(function(e) {
        let timeStamp = e.createdAt.toLocaleDateString() + " "　+ e.createdAt.toLocaleTimeString();
        return `${e.word} [${timeStamp}]`;
      });
      if(allWords.length > 0){
        res.send("以下のワードで検索しています\n\n" + allWords.join('\n'));
      }else{
        res.send("検索履歴はありません");
      }
    });
  });

  robot.respond(/消去$/i, async (res) => {
    res.send("検索履歴を消去しました");
    await Logs.destroy({ where:{} });
  });

  robot.respond(/ヘルプ$/i, (res) => {
    res.send('ご飯　地名：その地名が住所に含まれる飲食店を、HotPepparグルメの人気順で表示する\n履歴：検索履歴を表示する\n消去：検索履歴を消去する');
  });
}
