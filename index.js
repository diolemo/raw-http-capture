'use strict';

const net = require('net');
const process = require('process');
const tls = require('tls');
const commandLineArgs = require('command-line-args');
const getUsage = require('command-line-usage');
const usage = require('./usage.js');
 
const optionDefinitions = [
  { name: 'ssl', alias: 's', type: Boolean, defaultValue: false },
  { name: 'server-port', alias: 'l', type: Number, defaultValue: 12345 },
  { name: 'server-host', alias: 'h', type: String, defaultValue: '0.0.0.0' },
  { name: 'client-port', alias: 'p', type: Number, defaultValue: 0 },
  { name: 'client-host', type: String, defaultOption: true },  
  { name: 'help', type: Boolean, defaultValue: false },
]

const options = commandLineArgs(optionDefinitions);

if (options['help'] || !options['client-host']) {
	console.log(getUsage(usage));
	return;
}

if (options['client-port'] == 0) {
	options['client-port'] = options['ssl'] ? 443 : 80;
}	

var rewrite_host_header = function(line) {
	var addCR = line.endsWith('\r');
	return 'Host: ' + options['client-host'] + 
		(options['client-port'] == 80 ? '' : (':' + options['client-port'])) + 
		(addCR ? '\r' : '');
};

var firstWrite = true;	
var server = net.createServer((serverSocket) => {

	var clientSocket;
	var setupHandlers = function() {

		var clientDataStarted = false;
		var serverDataStarted = false;

		var onClientData = function(data) {

			if (!clientDataStarted) {
				if (!firstWrite) 
					process.stdout.write('\n');
				clientDataStarted = true;
				firstWrite = false;
			}

			var str = data.toString();
			process.stdout.write(str);
			serverSocket.write(str);

		};

		var onServerData = function(data) {

			if (!serverDataStarted) {
				if (!firstWrite) 
					process.stdout.write('\n');
				serverDataStarted = true;
				firstWrite = false;
			}

			var lines = data.toString().split('\n');

			for (let i = 0; i < lines.length; i++) {
				if (/^host:/i.test(lines[i])) {
					lines[i] = rewrite_host_header(lines[i]);
					break;
				}
			}

			var str = lines.join('\n');
			process.stdout.write(str);
			clientSocket.write(str);

		};

		serverSocket.on('data', function(data) {
			onServerData(data);
		});

		serverSocket.on('end', function() {
			serverSocket.end();
			clientSocket.end();
		});

		clientSocket.on('data', function(data) {
			onClientData(data);
		});

		clientSocket.on('end', function() {
			serverSocket.end();
			clientSocket.end();
		});

	};

	if (options['ssl']) {
		
		clientSocket = tls.connect({ 
			host: options['client-host'],
			port: options['client-port'],
		}, function() {
			setupHandlers();
		});

	} else {

		clientSocket = net.connect({
			port: options['client-port'],
			host: options['client-host'],
		}, function() {
			setupHandlers();
		});

	}

});

server.listen(options['server-port'], options['server-host']);


