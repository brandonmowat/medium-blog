'use strict';
/** @module hash-anything **/
var Buffer = require('buffer').Buffer;

var TYPE = Object.freeze({
    Array: 1,
    Boolean: 2,
    Date: 3,
    Function: 4,
    Null: 5,
    Number: 6,
    Object: 7,
    RegExp: 8,
    String: 9,
    Undefined: 10,
    NaN : 11,
    PositiveInfinity: 12,
    NegativeInfinity: 13
});

function Hash(algorithm) {
    if (!(this instanceof Hash))
        throw new Error('new must be used when calling Hash()');
    if (!algorithm)
        throw new Error('algorithm is required.');

    this._buffer = new Buffer(128);
    this._index = 0;
    switch (typeof algorithm) {
        case 'string':
            this._algorithm = algorithm.toLowerCase();
            break;
        case 'function':
            this._algorithm = algorithm;
            break;
        default:
            throw new Error('unrecognized hash algorithm')
    }
}

function resizeBuffer() {
    var buffer = new Buffer(this._buffer.length * 2);
    this._buffer.copy(buffer);
    this._buffer = buffer;
}

function writeUInt8(v) {
    if (this._index + 1 >= this._buffer.length)
        resizeBuffer.call(this);

    this._buffer.writeUInt8(v, this._index++);
}

function writeUInt64LE(v) {
    if (this._index + 8 >= this._buffer.length)
        resizeBuffer.call(this);

    this._buffer.writeUInt32LE((v << 32) >>> 0, this._index);
    this._index += 4;
    this._buffer.writeUInt32LE(v >>> 0, this._index);
    this._index += 4;
}

function writeDoubleLE(v) {
    if (this._index + 8 >= this._buffer.length)
        resizeBuffer.call(this);

    this._buffer.writeDoubleLE(v, this._index);
    this._index += 8;
}

function writeString(v) {
    while (this._index + v.length >= this._buffer.length)
        resizeBuffer.call(this);

    this._buffer.write(v, this._index);
    this._index += v.length;
}

Hash.prototype.getValue = function() {
    var hasher,
        buffer = this._buffer.slice(0, this._index);

    switch (this._algorithm) {
        case 'sha1':
        case 'md5':
        case 'sha256':
        case 'sha512':
            hasher = require('crypto').createHash(this._algorithm);
            hasher.update(buffer);
            return hasher.digest('hex');
        default:
            if (typeof this._algorithm === 'function')
               return this._algorithm(buffer);
            throw new Error('unrecognized hash algorithm: ' + this._algorithm.toString())
    }
};

Hash.prototype.hash = function(obj) {
    add.call(this, obj);
    return this;
};

Hash.prototype.clear = function(obj) {
    this._index = 0;
    return this;
};

function add(obj) {
    var className = Object.prototype.toString.call(obj);
    switch (className) {
        case '[object Array]':
            addArray.call(this, obj);
            return;
        case '[object Boolean]':
            addBoolean.call(this, obj);
            return;
        case '[object Date]':
            addDate.call(this, obj);
            return;
        case '[object Function]':
            addFunction.call(this, obj);
            return;
        case '[object Null]':
            addNull.call(this);
            return;
        case '[object Number]':
            addNumber.call(this, obj);
            return;
        case '[object Object]':
            addObject.call(this, obj);
            return;
        case '[object RegExp]':
            addRegExp.call(this, obj);
            return;
        case '[object String]':
            addString.call(this, obj);
            return;
        case '[object Undefined]':
            addUndefined.call(this);
            return;
        default:
            throw new Error('class ' + className + ' is not supported.');
    }
}

function addArray(arr) {
    writeUInt8.call(this, TYPE.Array);

    var l = arr.length;
    for (var i = 0; i < l; i++) {
        addNumber.call(this, i);
        add.call(this, arr[i]);
    }
}

function addBoolean(bool) {
    writeUInt8.call(this, TYPE.Boolean);
    writeUInt8.call(this, !!bool ? 0xF : 0xFF);
}

function addDate(date) {
    writeUInt8.call(this, TYPE.Date);
    writeUInt64LE.call(this,+date);
}

function addFunction(func) {
    writeUInt8.call(this, TYPE.Function);
    writeString.call(this, func.toString());

    if (!!func.prototype)
        addObject.call(this, func.prototype);
}

function addNull() {
    writeUInt8.call(this, TYPE.Null);
}

function addNumber(number) {
    if (isFinite(number)) {
        if (Math.floor(number) === number) { //integers
            writeUInt8.call(this, TYPE.Number);
            writeUInt64LE.call(this, number);
        } else { //decimal & float numbers
            writeUInt8.call(this, TYPE.Number);
            writeDoubleLE.call(this, number);
        }
    } else {
        if (isNaN(number)) {
            writeUInt8.call(this, TYPE.NaN);
        } else if (number === Number.POSITIVE_INFINITY) {
            writeUInt8.call(this, TYPE.PositiveInfinity );
        } else if (number === Number.NEGATIVE_INFINITY) {
            writeUInt8.call(this, TYPE.NegativeInfinity);
        } else {
            throw new Error('unhandled infinite number');
        }
    }
}

function addObject(obj) {
    writeUInt8.call(this, TYPE.Object);

    for (var propertyName in obj) {
        if (obj.hasOwnProperty(propertyName)) {
            if (this.includeFunc)
                if (!this.includeFunc(obj, propertyName))
                    continue;

            addString.call(this, propertyName);
            add.call(this, obj[propertyName]);
        }
    }

    if (!!obj.__proto__)
        addObject.call(this, obj.__proto__);
}

function addRegExp(regex) {
    writeUInt8.call(this, TYPE.Regex);
    writeString.call(this, regex.toString());
}

function addString(str) {
    writeUInt8.call(this, TYPE.String);
    writeString.call(this, str);
}

function addUndefined() {
    writeUInt8.call(this, TYPE.Undefined);
}

module.exports = {
    /**
     * Constructor for Hash object
     * @param algorithm {String} - algorithm to use to calculate the hash: 'sha1', 'md5', 'sha256', 'sha512'
     * @constructor
     */
    Hash: Hash,
    /**
     * Returns the SHA1 hash of anything
     * @param anything
     */
    sha1: function (anything) {
        var hash = new Hash('sha1');
        hash.hash(anything);
        return hash.getValue();
    },
    /**
     * Returns the MD5 hash of anything
     * @param anything
     */
    md5: function (anything) {
        var hash = new Hash('md5');
        hash.hash(anything);
        return hash.getValue();
    },
    /**
     * Returns the SHA256 hash of anything
     * @param anything
     */
    sha256: function (anything) {
        var hash = new Hash('sha256');
        hash.hash(anything);
        return hash.getValue();
    },
    /**
     * Returns the SHA512 hash of anything
     * @param anything
     */
    sha512: function (anything) {
        var hash = new Hash('sha512');
        hash.hash(anything);
        return hash.getValue();
    }
};