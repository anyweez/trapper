import test from 'ava';
import { create, read, update } from './locker';

/**
 * Run tests for Locker
 */
const filename = `./test-locker-${Math.round(Math.random() * 10000)}.tp`;
const pw = 'peaSE!';

test('Can create and save a new locker', t => {
    return create(filename, pw)
        .then(({locker, session}) => locker.save(pw, session))
        .catch(err => {
            console.error(err);
            t.fail();
        });
});

test('New lockers contain padding', t => {
    return read(filename, pw)
        .then(({ locker, session }) => {
            console.log(locker.each(session, { real: false }).length);
            // Check that there's at least one fake entry.
            t.is(locker.each(session, { real: false }).length >= 1, true);
        })
        .catch(err => {
            console.error(err);
            t.fail();
        });
});

test('Can open an existing locker', t => {
    return read(filename, pw)
        .then(({locker, session}) => t.deepEqual(locker.count(session), 2))
        .catch(err => {
            console.error(err);
            t.fail();
        });
});