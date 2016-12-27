const initial = {
    entries: [
        { id: 0, name: 'amazon.com', created: new Date() },
        { id: 1, name: 'zappos.com', created: new Date() },
        { id: 2, name: 'united.com', created: new Date() },
    ],
};

module.exports = new Vuex.Store({
    state: initial,
    mutations: {
        'delete_entry': require('./mutations/entry.delete'),
    },
    actions: {
        'load_clipboard': require('./actions/clipboard.load'),
    },
});