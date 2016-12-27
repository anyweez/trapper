const bcrypt = require('bcrypt');

const PASSWORD_SALT_ROUNDS = 5;

let _salt = null;

function salt() {
    return Promise.resolve('$2a$05$8Ch7K1oiKM/jHIjIFr9wE.');
    // if (_salt === null) {
    //     return bcrypt.genSalt(PASSWORD_SALT_ROUNDS)
    //         .then(salt => {
    //             _salt = salt;
    //             return salt;
    //         });
    // }

    // return Promise.resolve(_salt);
}

/**
 * Returns a promise whose first parameter is the hashed version 
 * of the password that should be used for password-related operations
 * like decrypting the locker.
 */
export function password(raw) {    
    return salt().then(salt => bcrypt.hash(raw, salt));
};

export function session() {
    // TODO: make non-deterministic
    return 'hamr';
};