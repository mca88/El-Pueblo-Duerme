const { nanoid } = require('nanoid');
const { Roles } = require('../utils');

//add more stuff to player class later when needed.. score maybe.. heeh...
module.exports = class Player {
    constructor({ name = 'John Doe' + nanoid(), id = null } = {}) {
        this.name = name;
        this.id = id;
        this.ready = false;
        this.alive = true;
        this.role = Roles.ALDEANO;
        this.loversWith = null;
    }
};

