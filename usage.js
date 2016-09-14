module.exports = [
	{
		header: 'raw-http-capture',
		content: 'Dump raw HTTP requests/responses to the console.',
	},
	{
		header: 'Usage',
		content: '$ raw-http-capture [<options>] <client-host>',
	},
	{
		header: 'Options',
		optionList: [
			{
				name: 'ssl',
				alias: 's',
				description: 'Enable SSL connection on client.',
			},
			{
				name: 'server-port',
				alias: 'l',
				typeLabel: '12345',
				description: 'Port to listen on.',
			},
			{
				name: 'ssl',
				alias: 'h',
				typeLabel: '0.0.0.0',
				description: 'Host to listen on.',
			},
			{
				name: 'client-port',
				alias: 'p',
				typeLabel: '80',
				description: 'The port to connect to.',
			},
			{
				name: 'help',
				description: 'Print this usage guide.',
			}
		]
	}
];