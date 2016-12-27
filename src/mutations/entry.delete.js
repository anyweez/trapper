/**
 * Deletes the specified entry from the list of all entries.
 */
module.exports = (state, id) => {
    console.log('deleting entry');
    state.entries = state.entries.filter(e => e.id !== id);
};