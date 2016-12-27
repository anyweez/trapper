/**
 * Generate a unique salt PER-LAUNCH. This will NOT be consistent across
 * different processes.
 */

function makeSalt() {
    /* TODO: get an encryption-quality RNG and actually randomize */
    return '$2a$05$8Ch7K1oiKM/jHIjIFr9wE.';
}

let salt = makeSalt();

module.exports = function () {
    return Promise.resolve(salt);
}