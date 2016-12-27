import { password, session } from '../pw/pw';
import { IncorrectPassword } from '../errors/errors';

const crypto = require('crypto');
const fs = require('mz/fs');

const CRYPTO_CIPHER_TYPE = 'aes-256-ctr';
const MAX_FAKE_ENTRIES = 200;

const hash = key => crypto.createHash('sha256').update(key).digest('hex');

/**
 * Create a new empty Locker at the specified location.
 */
export function create(filename, pw) {
    const skey = session();

    return password(pw).then(key => {
        return {
            locker: new Locker(filename, key, skey),
            session: skey,
        };
    });
}

/**
 * Read the password locker using the specified password. The password
 * will be run through pw.password() and the plaintext version will not
 * persist.
 */
export function read(filename, pw) {
    // Create a session key. Calling this function again will return another
    // session key that cannot be used to access data in this locker. Need 
    // to reload the locker using the master key if the session key is lost.
    const skey = session();

    return password(pw).then(key => {
        return {
            locker: new Locker(filename, key, skey),
            session: skey,
        };
    });
}

export function update(locker, pw) {
    return password(pw)
        .then(key => {
            // Confirm that this is the same password the database was unlocked with.
            if (hash(key) === locker.pwhash) {
                console.log('writing to ' + locker.filename);
                fs.writeFileSync(locker.filename, locker._encrypt(key, locker.entries.all(skey)))
            } else {
                throw new IncorrectPassword();
            }
        });
}

/**
 * The Locker and child containers are the sole places where password-related information
 * is stored. The locker takes care of reading, writing, updating, encrypting, and decrypting
 * all file contents using both master passwords and session keys.
 * 
 * List of current safeguards:
 *  - All password entries are encrypted using the session key while in memory.
 *  - All password entries are encrypted using aes-256 and a hash derived from the master password 
 *    before being written to disk.
 *  - Passwords and session keys are never stored in plaintext or a reversible format.
 *  - Lockers are automatically padded with fake entries on creation to leaking information about the 
 *    size of the locker based on file size.
 */
class Locker {
    constructor(fn, key, skey) {
        this.filename = fn;
        this.entries = new EncryptedEntryList();
        // TODO: is it ok to store the bcrypt'd version of this here?
        this.pwhash = hash(key);
        /**
         * Store the encrypted session key so that the user never has to enter
         * the master password and session key together. 
         * 
         * If the user provides the master password, we'll be able to provide the session key. 
         * If they provide the session key then we won't have access to the master password.
         */
        this.skey = this._encrypt(key, skey);

        // If a file name describes an existing file, load it.
        // If it was not provided, create a new empty Locker.
        if (fs.existsSync(fn)) {
            fs.readFileSync(fn).then(data => {
                this._decrypt(key, data).forEach(item => {
                    this.entries.add(item, skey);
                });
            });
        } else {
            this.entries.add(new RawEntry('amazon.com', 'stevo-14'), skey);
            this.entries.add(new RawEntry('dropbox.com', 'bentley101'), skey);

            // Add some fake entries so that its hard to tell how many real entries there are 
            // by inspecting file size
            this._pad(skey);
        }
    }

    /**
     * Generates a number of fake entries to pad the locker so that its hard to tell
     * how many real entries exist.
     */
    _pad(skey) {
        let count = Math.ceil(Math.random() * MAX_FAKE_ENTRIES) + 15;

        for (let i = 0; i < Math.min(count, MAX_FAKE_ENTRIES); i++) {
            this.entries.add(new RawEntry('', '', {
                real: false,
            }), skey)
        }
    }

    _encrypt(key, data) {
        const raw = JSON.stringify(data);

        const enc = crypto.createCipher(CRYPTO_CIPHER_TYPE, key)
        return enc.update(raw, 'utf8', 'hex') + enc.final('hex');
    }

    _decrypt(key, data) {
        try {
            const dec = crypto.createDecipher(CRYPTO_CIPHER_TYPE, key);
            const raw = dec.update(data, 'hex', 'utf8') + dec.final('utf8');
            return RawEntry.fromString(raw);
        } catch (e) {
            throw new IncorrectPassword();
        }
    }

    count(conf) {
        return this.entries.count(conf);
    }

    /**
     * Iterate over each RawEntry in the list. Requires a session 
     * key to get the list.
     * 
     * The second parameter is optional but forwards its value on to all()
     */
    each(skey, conf) {
        return this.entries.all(skey, conf);
    }

    update(id, skey, entry) {

    }

    /**
     * Write to the same place it was read from. Decrypt data using the session
     * key and re-encrypt it using the master key (this.key).
     */
    save(pw, skey) {
        return password(pw)
            .then(key => {
                if (hash(key) === this.pwhash) {
                    console.log('writing to ' + this.filename);
                    fs.writeFileSync(this.filename, this._encrypt(key, this.entries.all(skey)))
                } else {
                    throw new IncorrectPassword();
                }
            });
    }
}

/**
 * 
 * 
 */
class EncryptedEntryList {
    constructor() {
        this.entries = {};
    }

    /**
     * Encrypts the specified entry using the session ID. Internal API; shouldn't
     * need to be used externally.
     */
    _encrypt(entry, session) {
        // TODO: upgrade to crypto.createCipheriv as suggested by
        // https://nodejs.org/api/crypto.html#crypto_crypto_createcipher_algorithm_password
        const enc = crypto.createCipher(CRYPTO_CIPHER_TYPE, session)
        return enc.update(entry.toString(), 'utf8', 'hex') + enc.final('hex');
    }

    _decrypt(entry, session) {
        try {
            const dec = crypto.createDecipher(CRYPTO_CIPHER_TYPE, session);
            const raw = dec.update(entry, 'hex', 'utf8') + dec.final('utf8');
            return RawEntry.fromString(raw);
        } catch (e) {
            throw new IncorrectPassword();
        }
    }

    add(entry, session) {
        if (this.entries.hasOwnProperty(entry.id)) {
            throw Exception('Entry already exists; update instead of re-adding.');
        }

        // TODO: encrypt using session key
        this.entries[entry.id] = this._encrypt(entry, session);
    }

    all(session, { real = true } = {}) {
        if (session !== undefined) {
            return Object.keys(this.entries)
                .map(key => this._decrypt(this.entries[key], session))
                .filter(entry => entry.real === real);
        } else {
            throw new Error('Session key is required');
            // return Object.keys(this.entries).map(key => this.entries[key]);
        }
    }

    /**
     * Returns true if an entry with the specified ID exists, or false
     * if it does not. No data validation occurs, this is a simple existence
     * check.
     */
    exists(id) {
        return this.entries.hasOwnProperty(id);
    }

    /**
     * Return the RawEntry with the specified ID. Decrypt using the 
     * session key.
     */
    read(id, session) {
        return this._decrypt(this.entries[id], session);
    }

    /**
     * Update an existing entry. Decrypt the existing entry with the session key 
     * and update all properties with the new values from `entry`.
     */
    update(entry, session) {
        if (this.exists(entry.id)) {

        } else {
            throw Exception(`Entry ${entry.id} can't be updated because it does not exist.`);
        }
    }

    count(skey, conf) {
        return this.all(skey, conf).length;
    }
}

class RawEntry {
    // Third param is a config
    constructor(name, password, { real = true } = {}) {
        // Random string. True randomness isn't as important here since this isn't
        // for crypto of any sort, just need a unique ID for each entry.
        this.id = Math.random().toString(36).substring(7);
        this.name = name;
        this.password = password;
        this.real = real;
    }

    toString() {
        return JSON.stringify(this);
    }

    static fromString(raw) {
        return JSON.parse(raw);
    }
}