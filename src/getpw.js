const bcrypt = require('bcrypt');
const salt = require('./pwutil/salt');

/* Singleton */
let pw = null;

/**
 * Create a dynamic component that retrieves a session password. A new 
 * instance should be created for each entry to ensure that no state
 * whatsoever is kept around.
 */
const Session = Vue.extend({
    delimiters: ['${', '}'],
    template: document.querySelector('#session-pw-template'),
    data() {
        return { pass: '' };
    },
    methods: {
        submit() {
            this.$emit('submit', this.pass);
        },
    },
});

function Password() {
    throw new Error('Cannot instantiate directly!');
}

function SessionPassword(pw) {
    this.type = 'session';
    this.pass = pw;
    // return salt().then(salt => bcrypt.hash(raw, salt));


    return this;
}
SessionPassword.prototype = Password.prototype;

function MasterPassword(pw) {
    this.type = 'master';
    this.pass = pw;

    return this;
}
MasterPassword.prototype = Password.prototype;

module.exports = function (parent = null) {
    /**
     * Pass in a Password object (session or master) and this method will
     * validate it against information stored in the root data store. If the promise 
     * resolves, the password validated successfully. If not, it did not validate.
     */
    function checkpass(pw) {
        return new Promise((resolve, reject) => {
            return salt()
                .then(salt => bcrypt.hash(pw.pass, salt))
                .then(pass => {
                    if (pw.type === 'session') return parent.validate(new SessionPassword(pass));
                    else if (pw.type === 'master') return parent.validate(new MasterPassword(pass));
                })
                .then(() => resolve(pw))
                .catch(() => reject(pw));
        });
    }


    if (pw !== null) return pw;
    if (parent === null) throw Error('Must specify a root Vue instance');

    pw = {
        session() {
            return new Promise((resolve, reject) => {
                /* Create the session pw component */
                let child = new Session({
                    el: parent.$el.querySelector('#session-pw'),
                    parent,
                });

                child.$on('submit', pass => {
                    child.$destroy();
                    child.$el.innerHTML = '';

                    checkpass(new SessionPassword(pass))
                        .then(pw => resolve(pw))
                        .catch(err => reject('Invalid password'));
                });
            });
        },

        master() {

        }
    };

    return pw;
};