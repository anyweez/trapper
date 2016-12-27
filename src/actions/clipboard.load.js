const { clipboard } = require('electron');
const config = require('../config');
/**
 * Copies the password for the specified entry into the system's clipboard
 * for twenty seconds. Clipboard is automatically cleared after twenty seconds 
 * passes.
 */
module.exports = (state, id) => {
    clipboard.writeText(`pw for #${id}`);

    setTimeout(() => clipboard.writeText(''), config.SECONDS_UNTIL_PURGE * 1000);
};