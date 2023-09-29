module.exports = function () {};
exports.mobs = {
    "goblin": {
        type: "goblin",
        move_speed: 1,
        aggressive: true,
        max_health: 80,
        respawn_period: 300,
        attack_range: 1.5,
        attack_period: 5,
        attack_damage: 5
    },
    "rat": {
        type: "rat",
        move_speed: 1,
        aggressive: true,
        max_health: 50,
        respawn_period: 200,
        attack_range: 1.5,
        attack_period: 4,
        attack_damage: 2
    }
}
