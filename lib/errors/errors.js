
export function IncorrectPassword(message = 'Incorrect password provided.') {
    this.name = 'IncorrectPassword';
    this.message = message;
    this.stack = (new Error()).stack;

    return this;
}

IncorrectPassword.prototype = Object.create(Error.prototype);