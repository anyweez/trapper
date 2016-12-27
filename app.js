require('./components/trapper-locker');

/**
 * Load the state manager for the locker.
 */
const store = require('./src/state');

window.addEventListener('DOMContentLoaded', () => {
    const app = new Vue({
        delimiters: ['${', '}'],
        el: document.querySelector('#vue'),
        components: ['trapper-locker'],
        store,
        data() {
            return {
                search: null, // search term
            };
        },
        methods: {
            /**
             * Delete the element with the specified ID.
             */
            del: id => store.commit('delete_entry', id),
            clip: id => store.dispatch('load_clipboard', id),
            /**
             * Regenerate a new password for the element with the specified ID using
             * pre-existing rules.
             */
            gen: id => console.log('generating new pass for #' + id),
            /**
             * Validates the specified Password object and returns a promise that resolves
             * if the password validates succesfully or rejects if it does not.
             */
            validate: pw => store.dispatch('validate_pw', pw),
        },
        computed: {
            /**
             * Returns the list of entries that include the search term in their `name`.
             * If there is no search term then the full list will be returned.
             * 
             * Currently a linear search; may want to improve performance for larger lists.
             */
            search_entries() {
                if (this.search === null) return store.state.entries;

                return store.state.entries.filter(e => e.name.includes(this.search));
            },
        }
    });

    require('./src/getpw')(app);
});


// thor and dr jones thor and dr jones one plays with lightning the other plays with bones
