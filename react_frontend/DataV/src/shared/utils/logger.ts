interface LogData {
	level: 'info' | 'warn' | 'error';
	message: string;
	detail?: unknown;
	timestamp?: string;
}

export class Logger {
	static format(data: LogData) {
		return {
			...data,
			timeStamp: new Date().toISOString(),
		};
	}

	static info(message: string, detail?: unknown) {
		const log = this.format({ level: 'info', message, detail });
		console.info('[INFO]', log);
	}

	static warn(message: string, detail?: unknown) {
		const log = this.format({ level: 'warn', message, detail });
		console.warn('WARN', log);
	}

	static error(message: string, detail?: unknown) {
		const log = this.format({ level: 'error', message, detail });
		console.error('[ERROR]', log);
		// this.report(log);
	}

	// static report(data:LogData){
	// 	fetch("/api/log/report",{
	// 		method:"POST",
	// 		headers:{"Content-Type":"application/json"},
	// 		body:JSON.stringify(data),
	// 	}).catch(()=>{});
	// }
}
