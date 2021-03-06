import { DiagnosticAPI } from '@dojo/diagnostics/main';
import { SerializedDNode } from '@dojo/diagnostics/serializeDNode';

declare const browser: typeof chrome;
const b: typeof chrome = ((typeof browser !== 'undefined' && browser) ||
	(typeof chrome !== 'undefined' && chrome)) as any;

if (!b || !b.devtools) {
	throw new Error('Unable to resolve development tools API, unsupported environment!');
}

/**
 * The global variable in which the diagnostic APIs are being exposed.
 */
const DIAGNOSTIC_ROOT = '__dojo2_diagnostics__';

export interface SerializedPatchOperation {
	op: 'add' | 'remove' | 'replace' | 'test';
	path: { _segments: string[] };
	value: any;
}

interface DiagnosticOptions {
	args?: string[];
	call?: boolean;
}

function inspectedWindowDiagnostics<T>(
	api: keyof DiagnosticAPI,
	{ call = true, args = [] }: DiagnosticOptions = {}
): Promise<T> {
	const request = `${api}${call ? `(${args.join(',')})` : ''}`;
	return new Promise((resolve, reject) => {
		b.devtools.inspectedWindow.eval(`${DIAGNOSTIC_ROOT}.${request}`, (result, exceptionInfo) => {
			if (exceptionInfo) {
				reject(exceptionInfo);
			} else {
				resolve(result as T);
			}
		});
	});
}

export function getEventLog(): Promise<DiagnosticAPI['eventLog']> {
	return inspectedWindowDiagnostics('eventLog', { call: false });
}

export function getLastRender(projector: string): Promise<SerializedDNode> {
	return inspectedWindowDiagnostics('getProjectorLastRender', { args: [`'${projector}'`] });
}

export function getProjectors(): Promise<string[]> {
	return inspectedWindowDiagnostics('getProjectors');
}

export function getStores(): Promise<string[]> {
	return inspectedWindowDiagnostics('getStores');
}

export function getStoreTransactions(store: string): Promise<{ history: number; redo: number }> {
	return inspectedWindowDiagnostics('getStoreTransactionLengths', { args: [`'${store}'`] });
}

export function getStoreState(store: string): Promise<any> {
	return inspectedWindowDiagnostics('getStoreState', { args: [`'${store}'`] });
}

export function version(): Promise<DiagnosticAPI['version']> {
	return inspectedWindowDiagnostics('version', { call: false });
}

export function highlight(projector: string, path: string): Promise<void> {
	return inspectedWindowDiagnostics('highlight', { args: [`'${projector}'`, `'${path}'`] });
}

export function storeTravel(store: string, distance: number, invalidate = true): Promise<SerializedPatchOperation[]> {
	return inspectedWindowDiagnostics('storeTravel', {
		args: [`'${store}'`, `${distance}`, invalidate ? 'true' : 'false']
	});
}

export function unhighlight(): Promise<void> {
	return inspectedWindowDiagnostics(`unhighlight`);
}
