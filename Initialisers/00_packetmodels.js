var Parser = require("binary-parser").Parser;

var StringOptions = {
    length: 99,
    zeroTerminated: true
};

//Password should be encrypted by the client before being transmitted to the server
module.exports = PacketModels = {
    header: new Parser().skip(1).string("command", StringOptions),
    login: new Parser().skip(1).string("command", StringOptions)
        .string("username", StringOptions)
        .string("password", StringOptions),
    register: new Parser().skip(1).string("command", StringOptions)
        .string("username", StringOptions)
        .string("password", StringOptions),
    logout: new Parser().skip(1).string("command", StringOptions)
        .string("username", StringOptions)

    ,

    spawn: new Parser().skip(1).string("command", StringOptions)
        .string("entity_name", StringOptions)
        .string("entity_type", StringOptions)
        .string("target_x", StringOptions)
        .string("target_y", StringOptions)
        .string("health", StringOptions)
        .string("sprite", StringOptions),
    entity: new Parser().skip(1).string("command", StringOptions)
        .string("entity_name", StringOptions)
        .string("entity_type", StringOptions)
        .string("target_x", StringOptions)
        .string("target_y", StringOptions)
        .string("health", StringOptions)
        .string("sprite", StringOptions),
    attack: new Parser().skip(1).string("command", StringOptions)
        .string("attack_name", StringOptions)
        .string("attack_type", StringOptions)
        .string("target_entity", StringOptions)
        .string("origin_entity", StringOptions)
        .string("damage", StringOptions)
        .string("sprite", StringOptions),
    destroy: new Parser().skip(1).string("command", StringOptions)
        .string("entity_name", StringOptions)
};

