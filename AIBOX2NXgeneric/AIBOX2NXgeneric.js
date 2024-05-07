const express = require('express');
const multer = require('multer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, 'config.json');
if (!fs.existsSync(configPath)) {
  console.log('找不到文件: config.json');
  console.log('關閉程式...');
  process.exit(1);
}
const configData = fs.readFileSync(configPath, 'utf-8');
const config = JSON.parse(configData);

console.log(config);
let host = config.connection.host;
let authorization = `${config.connection.ac}:${config.connection.password}`

const app = express();
const upload = multer();


app.post('/', upload.any(), (req, res) => {
  try{
	  let data1 = JSON.parse(req.body.alarm_info);
	  let data2 = data1.additional.device_id;
	  console.log(data1);
	  console.log(data2);
	  http_send_nx(data2);
  }catch{
	  console.log("error");
  }
  console.log('\n\n\n\n\n\n\n');	
  res.send('Form data received');
});


function http_send_nx(caption_data){
  const options = {
    hostname: host,
    port: config.connection.nx_server,
  path: `/api/createEvent?${config.api_type}=milesight_AIBOX${caption_data}`,
    method: 'GET',
    headers: { 'Authorization': 'Basic ' + Buffer.from(authorization).toString('base64') }
	};
	
	try{
		const req = http.request(options, (res) => {
		  let data = '';
		  res.on('data', (chunk) => {
			data += chunk;
		  });
		  res.on('end', () => {
			console.log(data);
		  });
		});
		req.on('error', (error) => {
		  console.error(`we have some error here \n ${error}`);
		});
		req.end();		
	}catch{
		console.log('error!!!!');
	}

}

app.listen(config.connection.integration_server_port, () => {
  console.log(`Server is running on port ${config.connection.integration_server_port}`);
});
