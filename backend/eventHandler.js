const { get } = require("http");
const Game = require("./objects/Game.js")
const Player = require("./objects/Player.js")
const {Roles, logger} = require("./utils.js");

module.exports = function (io) {
    const games = new Map();

    io.on('connection', function (socket) {
        const count = io.engine.clientsCount;
        console.log(socket.id + ' connected c:' + count);

        socket.on('disconnecting', () => {
            if (socket.rooms.size > 1) {
                for (const room of socket.rooms) {
                    if (room !== socket.id) {
                        games.get(room).leave(socket.id);
                        console.log(games.get(room).players.length)
                        if (games.get(room).players.length === 0) games.delete(room);
                        
                        break;
                    }
                }
            }
            console.log(socket.id + ' disconnected');
        });

        socket.on('leave-room', (gameid) => {
            if (gameid) {
                disconnecting(io, socket, games); 
                socket.leave(gameid); 
            }
        });

        socket.on('get-game-list', function (callback) {
			const gameList = [];
			for (const [id, game] of games.entries()) {
				if (game.status == 'open') {
					gameList.push({ 
                        id: game.id, 
                        name: game.name, 
                        players: game.players.length, 
                    }
                    );
				}
			}
			callback(gameList);
		});

        socket.on('create-game', function (data, callback) {
			const game = new Game(data?.settings); 
            const player = new Player({id: socket.id, name: data.name});
            game.creator = player.id

			game.join(player); 
			games.set(game.id, game); 
			socket.join(game.id);

			callback({ status: 'ok', playerId: player.id, gameData: game.getPublicData() });
		});

		socket.on('join-game', function (data, callback) {
			const game = games.get(data.gameId) ?? null;

            if(game !== null || game.status == 'open'){
                const player = new Player({ id: socket.id, name: data.name});
                const successfullJoin = game.join(player);
                if (successfullJoin) {
                    socket.join(data.gameId);
                    socket.to(game.id).emit('player-joined', player);
                    callback({ status: 'ok', playerId: player.id, gameData: game.getPublicData()});
                } else {
                    callback({ status: 'failed' });
                }
            }
            else {
                callback({ status: 'failed' });
            }		
		});

        socket.on('player-ready', (gameId, status) => {
			const game = games.get(gameId);
            game.players.forEach((player) =>{
                if(player.id === socket.id){
                    player.ready = true;
                }

            });
            io.to(game.id).emit('player-ready-change', socket.id, status);
		});

        socket.on('start-game', (gameId) => {
            const game = games.get(gameId);
            game.status = 'started';
            let playerSize = game.players.length;
            let wolvesCount = 0;
            let wolvesAssigned = 0;

            if(playerSize <= 11){
                wolvesCount = 2;
            }
            else if(playerSize >= 12 && playerSize <= 17){
                wolvesCount = 3;
            }
            else{
                wolvesCount = 4;
            }

            while(wolvesAssigned != wolvesCount){
                let random = Math.floor(Math.random() * playerSize);
                if(game.players[random].role === Roles.ALDEANO){
                    game.players[random].role = Roles.LOBO
                    wolvesAssigned++;
                }
            }

            for(let key in game.roles){
                if(game.roles[key] === true){
                    while(true){
                        let random = Math.floor(Math.random() * playerSize);
                        if(game.players[random].role === Roles.ALDEANO){
                            game.players[random].role = key;
                            break;
                        }
                    }
                }
            }

            game.getNextRole();

            io.to(gameId).emit('game-started', game.getPublicData())
            game.status = 'night';
        });

        socket.on('cupid-action', (gameId, lovers) =>{
            const game = games.get(gameId);
            const [lover1, lover2] = lovers;

            const player1 = game.players.find(p => p.id === lover1);
            const player2 = game.players.find(p => p.id === lover2);

            if(player1 && player2){
                player1.loversWith = player2.id;
                player2.loversWith = player1.id;
            }

            game.turn = Roles.ENAMORADOS;
            io.to(gameId).emit('continue', game.getPublicData());
        })

        socket.on('continue-action', (gameId) =>{
            const game = games.get(gameId);

            game.getNextRole();

            const winCon = game.resolveWin()

            if(winCon === null){
                io.to(gameId).emit('continue', game.getPublicData());
            }
            else{
                io.to(gameId).emit('game-end', winCon)
            }
        })

        socket.on("wolf-selection", (new_selection, gameId) => {
            io.to(gameId).emit("wolf-selection-done", new_selection);
        })

        socket.on("continue-action-kill", (gameId, playerNameToDie) => {
            const game = games.get(gameId);
            if(playerNameToDie !== "Ninguno"){
                game.selectedToDie.push(playerNameToDie);
            }
            
            game.getNextRole();

            const winCon = game.resolveWin()

            if(winCon === null){
                io.to(gameId).emit('continue', game.getPublicData());
            }
            else{
                io.to(gameId).emit('game-end', winCon)
            }
        })

        socket.on("witch-actions", (gameId, actions) =>{
            const game = games.get(gameId);

            nameToDie  = actions.killPlayerName
            nameToRevive = actions.revivePlayerName

            if(nameToDie !== null){
                game.selectedToDie.push(nameToDie)
                game.witchPotionsUsed['kill'] = true;
            }

            if(nameToRevive !== null){
                game.selectedToDie = game.selectedToDie.filter(item => item !== nameToRevive)
                game.witchPotionsUsed['revive'] = true;
            }

            
            game.getNextRole();
            io.to(gameId).emit('continue', game.getPublicData());
        })

        socket.on("player-vote", (gameId, vote, aliveCount) => {
            const game = games.get(gameId)

            if(aliveCount === -1){
                winner = game.resolveVotation()
                io.to(gameId).emit('votation-done', winner)
                return;
            }

            game.manageVote(vote)

            if(game.votes.length === aliveCount){
                winner = game.resolveVotation()
                io.to(gameId).emit('votation-done', winner)
                return;
            }

            io.to(gameId).emit('vote-update', game.votes)

        })
    });

    io.engine.on('connection_error', (err) => {
        console.log('CONNECTION_ERROR!!');
        console.log(err.req); 
        console.log(err.code); 
        console.log(err.message); 
        console.log(err.context); 
    });
}



function disconnecting(io, socket, games) {
	if (socket.rooms.size < 2) return;
	for (const room of socket.rooms) {

        if (room == socket.id || games.get(room) == undefined) continue;
		const game = games.get(room);
		game?.leave(socket.id);

		if (game?.players.length === 0) games.delete(room);
		else {
            socket.to(game.id).emit('player-left', socket.id);
		}
		break;
	}
}