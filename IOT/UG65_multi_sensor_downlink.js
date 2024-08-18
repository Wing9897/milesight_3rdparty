const https = require('https');
const crypto = require('crypto');  
const inquirer = require('inquirer');
const XLSX = require('xlsx');
const cryptkey = '1111111111111111';
const iv =  '2222222222222222';


let ip1 = ''
let pass = ''
let deEUI = "";
let apiToken = "";
let hexcmd = "";
let updatedData;
let excelfile = "data.xlsx";



function hexToBuffer(hex) {
  return Buffer.from(hex, 'hex');
}

// Convert a Buffer to a Base64 string
function bufferToBase64(buffer) {
  return buffer.toString('base64');
}

async function input0() {
  const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
  });
  return new Promise((resolve, reject) => {
      readline.question('Enter the excel file path: ', (efile) => {
        excelfile = efile; 
		try{
			const workbook = XLSX.readFile(efile);
			const worksheet = workbook.Sheets[workbook.SheetNames[0]];
			const columnAValues = XLSX.utils.sheet_to_json(worksheet, { header: 1 }).map(row => row[0]);
			updatedData = columnAValues.map(item => {
			  if (typeof item === 'string') {
				return item.replace(/\n/g, '');
			  }
			  return item;
			});	
		}catch{
			console.log("找不到excel文件,請在此程式相同路徑下建立.xlsx及在第一行列輸入EUI,已中止程序........");
			process.exit();
		}
        readline.close();
        resolve();
      });
  });
}


async function input1() {
  const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
  });
  return new Promise((resolve, reject) => {
    readline.question('Enter the ip address: ', (address1) => {
      ip1 = address1;
      readline.question('Enter the gateway password: ', (pas1) => {
        pass = pas1; // Assign the value of `pas1` to the `pass` variable
        readline.close();
        resolve();
      });
    });
  });
}

async function inquir() {
  return new Promise((resolve, reject) => {
    inquirer.prompt([
      {
        type: 'list',
        name: 'reptile',
        message: 'What is the version of gateway?',
        choices: ['Firmware version 60.0.0.42-r4 and before', 'Firmware version 60.0.0.42-r5 and later'],
      },
    ]).then((answers) => {
      switch (answers.reptile) {
        case 'Firmware version 60.0.0.42-r4 and before':
          resolve(0);
        case 'Firmware version 60.0.0.42-r5 and later':
          resolve(1);
        default:
          resolve(0);
      }
    }).catch((error) => {
      reject(error);
    });
  });
}

function encrypt(text) {
  try {
    var cipher = crypto.createCipheriv('aes-128-cbc', cryptkey, iv);
    var crypted = cipher.update(text, 'utf8', 'base64');
    crypted += cipher.final('base64');
    return crypted;
  } catch (err) {
    console.error('encrypt error', err);
    return null;
  }
}


async function request_token(login_hander){
	const login_options = {
	  hostname: ip1,
	  port: 8080,
	  path: '/api/internal/login',
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json'
	  },
	  rejectUnauthorized: false
	};

	const req = https.request(login_options, (res) => {
	  //console.log(`code: ${res.statusCode}`);
	  res.on('data', (chunk) => {
		//console.log(`body: ${chunk}`);
		const obj = JSON.parse(chunk);
		apiToken = obj['jwt'];
		//console.log(`token: ${apiToken}`);
	  });
	});

	req.on('error', (e) => {
	  console.error(`error: ${e.message}`);
	});

	req.write(JSON.stringify(login_hander));
	req.end();	
}

async function main1() {
  let mode = 0;
  await input0();
  await input1();
  console.log("Sensor EUI list")
  console.log(updatedData)
  let result = await inquir();
  let tokenn = "";
  let login = {};
  if (result === 1) {
    login = {
      "username": 'apiuser',
      "password": `${encrypt(pass)}`,
    };
  } else {
    login = {
      "username": 'apiuser',
      "password": `password`,
    };
  }
  console.log(`confirmed username and password is --> ${JSON.stringify(login)}`);
  await request_token(login);
  await main2();
}


async function input2() {
  const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
  });
	return new Promise((resolve, reject) => {
		readline.question('Enter the hex command: ', (hexcmd1) => {
			value1 = hexToBuffer(hexcmd1)
			value2 = bufferToBase64(value1);
			hexcmd = value2;
			readline.close();
			resolve({"confirmed" : true,"fPort" : 85,"data": `${hexcmd}`});
		});				
	});
}

async function main2() {
	data1 = await input2();
	for (let i = 0; i < updatedData.length; i++) {
		const options = {
		  hostname: ip1,
		  port: 8080,
		  path: `/api/devices/${updatedData[i]}/queue`,
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiToken}`
		  },
		  rejectUnauthorized: false
		};

		const req = https.request(options, (res) => {
		  console.log(`code: ${res.statusCode}`);

		  res.on('data', (chunk) => {
			console.log(`body: ${chunk}`);
		  });

		});

		req.on('error', (e) => {
		  console.error(`error: ${e.message}`);
		});
		req.write(JSON.stringify(data1));
		req.end();
		console.log(`send item : ${i}`)
	}	
	
}


main1()