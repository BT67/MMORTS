var Parser = require("binary-parser").Parser;

var StringOptions = {
    length: 99,
    zeroTerminated: true
};

//Password should be encrypted by the client before being transmitted to the server
//Packet models sent from the client to the server
module.exports = PacketModels = {
    header: new Parser().skip(1)
        .string("command", StringOptions),
    refresh: new Parser().skip(1)
        .string("command", StringOptions),
    login: new Parser().skip(1)
        .string("command", StringOptions)
        .string("username", StringOptions)
        .string("password", StringOptions),
    register: new Parser().skip(1)
        .string("command", StringOptions)
        .string("email", StringOptions)
        .string("username", StringOptions)
        .string("password", StringOptions),
    logout: new Parser().skip(1)
        .string("command", StringOptions),
    resetpassword: new Parser().skip(1)
        .string("command", StringOptions)
        .string("email", StringOptions),
    spawn: new Parser().skip(1)
        .string("command", StringOptions)
        .string("entity_name", StringOptions)
        .string("entity_type", StringOptions)
        .string("pos_x", StringOptions)
        .string("pos_y", StringOptions)
        .string("health", StringOptions)
        .string("sprite", StringOptions),
    entity: new Parser().skip(1)
        .string("command", StringOptions)
        .string("target_x", StringOptions)
        .string("target_y", StringOptions),
    attack: new Parser().skip(1)
        .string("command", StringOptions)
        .string("target_entity", StringOptions),
    destroy: new Parser().skip(1)
        .string("command", StringOptions)
        .string("entity_name", StringOptions),
    chat: new Parser().skip(1)
        .string("command", StringOptions)
        .string("message", StringOptions),
    room: new Parser().skip(1)
        .string("command", StringOptions)
        .string("room", StringOptions)
};

