import ReaderStream from '../readers/stream';
import Provider from './provider';

import type { Readable } from 'stream';
import type { Task } from '../managers/tasks';
import type { Entry, EntryItem, ReaderOptions } from '../types';

export default class ProviderAsync extends Provider<Promise<EntryItem[]>> {
	protected _reader: ReaderStream = new ReaderStream(this._settings);

	public read(task: Task): Promise<EntryItem[]> {
		const root = this._getRootDirectory(task);
		const options = this._getReaderOptions(task);

		const entries: EntryItem[] = [];

		return new Promise((resolve, reject) => {
			const stream = this.api(root, task, options);

			stream.once('error', reject);
			stream.on('data', (entry: Entry) => entries.push(options.transform(entry)));
			stream.once('end', () => resolve(entries));
		});
	}

	public api(root: string, task: Task, options: ReaderOptions): Readable {
		if (task.dynamic) {
			return this._reader.dynamic(root, options);
		}

		return this._reader.static(task.patterns, options);
	}
}
