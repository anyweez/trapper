const moment = require('moment');
/**
 * Element that lists out all of the entries in a locker.
 */
Vue.component('trapper-locker', {
    delimiters: ['${', '}'],
    template: document.querySelector('#trapper-locker-template'),
    props: {
        items: { type: Array, required: true },
    },
    methods: {
        created_ts(item) {
            return moment(item.created).fromNow();
            // return item.created.toString();
        },
        del(item) {
            this.$emit('remove', item.id);
        },
        gen(item) {
            this.$emit('regen', item.id);
        },
        clip(item) {
            const sessionpw = require('../src/getpw')().session;

            sessionpw().then(pw => {
                console.log(pw);
                // TODO: require session key
                this.$emit('clip', item.id, pw);

            }).catch(err => console.error(err));
        }
    }
});

//5x5x3//heroesinahalfshell, [Bright purple] [font 12] Go go demon team.///////////784identifythis