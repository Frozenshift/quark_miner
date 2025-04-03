import pino from 'pino';

const transports = pino.transport({
	targets: [
		{
			target: 'pino-pretty',
			options: {
				level: 'info',
			},
		},
	],
});

export const logger = pino(transports);