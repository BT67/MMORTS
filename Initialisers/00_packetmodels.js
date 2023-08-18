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
    netlogin: new Parser().skip(1).string("command", StringOptions)
        .string("username", StringOptions)
        .string("target_x", StringOptions)
        .string("target_y", StringOptions),
    register: new Parser().skip(1).string("command", StringOptions)
        .string("username", StringOptions)
        .string("password", StringOptions),
    pos: new Parser().skip(1).string("command", StringOptions)
        .string("username", StringOptions)
        .string("current_room", StringOptions)
        .string("target_x", StringOptions)
        .string("target_y", StringOptions),
    pop: new Parser().skip(1).string("command", StringOptions)
        .string("username", StringOptions)
        .string("net_user", StringOptions)
        .string("current_room", StringOptions)
        .string("target_x", StringOptions)
        .string("target_y", StringOptions),
    popenemy: new Parser().skip(1).string("command", StringOptions)
        .string("enemy_name", StringOptions)
        .string("enemy_type", StringOptions)
        .string("target_x", StringOptions)
        .string("target_y", StringOptions),
    updenemy: new Parser().skip(1).string("command", StringOptions)
        .string("enemy_name", StringOptions)
        .string("current_x", StringOptions)
        .string("current_y", StringOptions),
    platk: new Parser().skip(1).string("command", StringOptions)
        .string("username", StringOptions)
        .string("attack", StringOptions)
        .string("current_x", StringOptions)
        .string("current_y", StringOptions)
        .string("target_x", StringOptions)
        .string("target_y", StringOptions),
    enatk: new Parser().skip(1).string("command", StringOptions)
        .string("enemy", StringOptions)
        .string("attack", StringOptions)
        .string("current_x", StringOptions)
        .string("current_y", StringOptions)
        .string("target_x", StringOptions)
        .string("target_y", StringOptions),
    enhealth: new Parser().skip(1).string("command", StringOptions)
        .string("enemy", StringOptions)
        .string("health", StringOptions),
    plhealth: new Parser().skip(1).string("command", StringOptions)
        .string("username", StringOptions)
        .string("health", StringOptions),
    logout: new Parser().skip(1).string("command", StringOptions)
        .string("username", StringOptions),
    endeath: new Parser().skip(1).string("command", StringOptions)
        .string("enemy", StringOptions),
    netlogout: new Parser().skip(1).string("command", StringOptions)
};

