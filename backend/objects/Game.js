const { nanoid } = require('nanoid');
const {Roles, logger} = require('../utils');


module.exports = class Game {
    constructor({ voteTime = 30, name = "Partidita", roles = {}, creator = "Creador por defecto" } = {}) {
        this.id = nanoid();
        this.round = 1;
        this.status = 'open';
        this.voteTime = voteTime;
        this.name = name;
        this.creator = creator;
        this.players = [];
        this.roles = roles;
        this.turn = "first_day";
        this.selectedToDie = [];
        this.witchPotionsUsed = {
            kill: false,
            revive: false
        };
        this.votes = [];
        this.winner = null
    }

    join(player) {
        if (this.status === 'open') {
            const normalize = name => name.trim().toLowerCase();
            const exists = this.players.some(p => normalize(p.name) === normalize(player.name));

            if(!exists){
                this.players.push(player)
                return true;
            }
        }
        return false;
    }

    leave(playerid) {
        this.players = this.players.filter(player => player.id !== playerid);
    }

    getPublicData() {
        return {
            id: this.id,
            name: this.name,
            voteTime: this.voteTime,
            creator: this.creator,
            status: this.status,
            turn: this.turn,
            selectedToDie: this.selectedToDie,
            witchPotionsUsed: this.witchPotionsUsed,
            players: this.players,
            winner: this.winner
        };
    }

    getNextRole() {

        const turnOrder = [];

        if (this.roles[Roles.CUPIDO] && this.turn === 'first_day') {
            this.turn = Roles.CUPIDO
            return;
        }

        if (this.turn === Roles.ENAMORADOS) {
            turnOrder.push(Roles.ENAMORADOS);
        }

        if (this.roles[Roles.VIDENTE]) {
            turnOrder.push(Roles.VIDENTE);
        }

        turnOrder.push(Roles.LOBO);

        if (this.roles[Roles.BRUJA]) {
            turnOrder.push(Roles.BRUJA);
        }

        turnOrder.push(Roles.ALDEANO);


        const index = turnOrder.indexOf(this.turn);

        if (index === -1) {
            this.turn = null;
        }

        if (index === turnOrder.length - 1) {
            this.turn = turnOrder[0];
        }
        else {
            this.turn = turnOrder[index + 1];
        }

        if (this.turn === Roles.ALDEANO) {
            this.status = "day"
            this.resolveDeaths()
            this.resolveWin()
        }
    }

    resolveDeaths() {
        this.players.forEach(player => {
            if (this.selectedToDie.includes(player.name)) {
                player.alive = false
                this.resolveDeadRole(player)

                if (player.loversWith !== null) {
                    const playerLover = this.players.find(p => p.id === player.loversWith)
                    playerLover.alive = false
                    this.resolveDeadRole(playerLover)
                    if (!this.selectedToDie.includes(playerLover.name)) {
                        this.selectedToDie.push(playerLover.name)
                    }
                }
            }
        });
    }

    resolveDeadRole(player){
        if(player.role !== Roles.ALDEANO && player.role !== Roles.LOBO){
            this.roles[player.role] = false;
        }
    }

    manageVote(vote){
        const index = this.votes.findIndex(v => v.voter === vote.voter)

        if(vote.candidate === null){
            if(index !== -1){
                this.votes.splice(index,1);
            }
        }
        else{
            if(index !== -1){
                this.votes[index].candidate = vote.candidate
            }
            else{
                this.votes.push(vote)
            }
        }
    }

    resolveVotation(){
        const tally = {};

        for (const {candidate} of this.votes){
            tally[candidate] = (tally[candidate] || 0) + 1;
        }

        const entries = Object.entries(tally);
        entries.sort((a, b) => b[1] - a[1]);

        if (entries.length === 0) return "draw";

        const [topCandidate, topVotes] = entries[0];
        const isDraw = entries.length > 1 && entries[1][1] === topVotes;

        if(!isDraw){
            const topPlayer = this.players.find(p => p.id === topCandidate)
            if(topPlayer !== undefined){
                topPlayer.alive = false;
                this.resolveDeadRole(topPlayer)
            }
        }

        this.resolveWin()
        this.status = "night";
        this.selectedToDie = [];
        this.votes = [];
        this.round += 1;
        return isDraw ? "draw" : topCandidate;
    }

    resolveWin(){
        let drama = false;
        const alivePlayers = this.players.filter(p => p.alive);

        const aliveWolves = alivePlayers.filter(p => p.role === Roles.LOBO);
        const aliveTown   = alivePlayers.filter(p => p.role !== Roles.LOBO);
        const aliveLovers = alivePlayers.filter(p => p.loversWith !== null);

        if(aliveWolves.length === 0){
            this.winner = Roles.ALDEANO
            return
        }
        if(aliveLovers.length === 2){
            drama = aliveLovers[0].role === Roles.LOBO && aliveLovers[1].role !== Roles.LOBO
            if(alivePlayers.length <= 3){
                this.winner = Roles.ENAMORADOS
                return
            }
        }
        if(aliveWolves.length >= aliveTown.length && !drama){
            this.winner = Roles.LOBO
        }
    }
};
