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

function SessionPassword(pw) {
    this.type = 'session';
    this.pass = pw;

    return this;
}

function MasterPassword(pw) {
    this.type = 'master';
    this.pass = pw;

    return this;
}

module.exports = function (parent = null) {
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
                    resolve(new SessionPassword(pass));
                });
            });
        },

        master() {

        }
    };

    return pw;
};