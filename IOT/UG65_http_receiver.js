const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3003;
ip = "0.0.0.0";

// 設置body-parser來解析POST請求的JSON資料
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', (req, res) => {
	const data = req.body || {}; // 确保data是对象
	const clientIP = req.ip || 'Unknow'; // 取得客戶端的IP地址
	const devEUI = data.devEUI || 'Unknow'; // 默认为'未知'
	const rxInfo = data.rxInfo && data.rxInfo[0] ? data.rxInfo[0] : {}; // 确保rxInfo存在
	const formattedRxTime = rxInfo.time ? new Date(rxInfo.time).toLocaleString() : 'Unknow'; // 转换为本地时间
	const rssi = rxInfo.rssi !== undefined ? rxInfo.rssi : 'Unknow'; // 默认为'未知'
	const loRaSNR = rxInfo.loRaSNR !== undefined ? rxInfo.loRaSNR : 'Unknow'; // 默认为'未知'
	const dataPayload = data.data || 'Unknow'; // 默认为'无数据'
	const formattedTime = data.time ? new Date(data.time).toLocaleString() : 'Unknow'; // 转换为本地时间

	try {
		console.log(`${clientIP}\t${devEUI}\t${formattedRxTime}\t${rssi} dB\t${loRaSNR}\t\t${dataPayload}\t\t${formattedTime}`);
	} catch (error) {
		console.error("错误:", error);
	}

	res.send('已收到POST請求');
});


// 啟動伺服器
app.listen(port, ip,() => {
  console.log(`\n＊＊＊＊＊http伺服器正在監聽port: ${port}＊＊＊＊＊\n`);
  console.log(`Client IP\t\tdevice EUI\tReceive Time\t\trssi\tloRaSNR\t\tdataPayload\t\tformattedTime`);
});