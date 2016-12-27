## Locker file protection

Locker encrypts and pads Trapper files so that the information inside of them is only retrievable using the master password.

This format is intended to encode all user-specific application data, including passwords, account names, and all related information.

- Entire file is encrypted using a hash of the master password.
- Once decrypted, all information is encrypted in memory with a lightweight session password that users must provide in order to read or write data from the locker.