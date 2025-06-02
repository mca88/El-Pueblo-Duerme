const logger = require('loglevel')
logger.setLevel('debug')

const Roles = Object.freeze({
    VIDENTE: 'vident',
    LOBO: 'wolf',
    ALDEANO: 'villager',
    CUPIDO: 'cupid',
    BRUJA: 'witch',
    ENAMORADOS : 'lovers_meet'
});

module.exports = {
    Roles,
    logger,
};