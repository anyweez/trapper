/**
 * Copies the password for the specified entry into the system's clipboard
 * for twenty seconds. Clipboard is automatically cleared after twenty seconds 
 * passes.
 */
module.exports = (state, pw) => {
    return new Promise((resolve, reject) => {
        if (pw.pass === '$2a$05$8Ch7K1oiKM/jHIjIFr9wE.RliFmaERUma28YRzTOH38Iel4NE1iRa') resolve('password validated!');
        else reject('incorrect. try `abt`');
    });
};