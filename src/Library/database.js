import { resolve, dirname as _dirname } from 'path';
import _fs, { existsSync, readFileSync } from 'fs';
const { promises: fs } = _fs;

class Database {
    /**
     * Create new Database
     * @param {String} filepath Path to specified json database
     * @param  {...any} args JSON.stringify arguments
     */
    constructor(filepath, ...args) {
        this.file = resolve(filepath);
        this.logger = console;

        this._load();

        this._jsonargs = args;
    }

    get data() {
        return this._data;
    }

    set data(value) {
        this._data = value;
        this._save().catch(this.logger.error); // Directly save on data set
    }

    /**
     * Load data from the file
     */
    _load() {
        try {
            this._data = existsSync(this.file) ? JSON.parse(readFileSync(this.file)) : {};
        } catch (e) {
            this.logger.error(e);
            this._data = {};
        }
    }

    async _save() {
        let dirname = _dirname(this.file);
        if (!existsSync(dirname)) await fs.mkdir(dirname, { recursive: true });

        let existingData = existsSync(this.file) ? JSON.parse(readFileSync(this.file)) : {};
        let mergedData = { ...existingData, ...this._data };

        await fs.writeFile(this.file, JSON.stringify(mergedData, ...this._jsonargs));
        return this.file;
    }
}

export default Database;