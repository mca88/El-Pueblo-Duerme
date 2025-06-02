<script>
  import { io } from "socket.io-client";
  import { activeComponent, players, gameProps } from "./lib/stores/";
  import Start from "./components/Start.svelte";
  import Lobby from "./components/MenuScreens/Lobby.svelte";
  import BackButton from "./components/MenuScreens/BackButton.svelte";
  import GameSettings from "./components/MenuScreens/GameSettings.svelte";
  import GameList from "./components/MenuScreens/GameList.svelte";
  import Game from "./components/GameScreens/Game.svelte";

  const socket = io(import.meta.env.VITE_URL);

  socket.on("player-left", (playerId) => {
    console.log("got playerLeft");
    $players = $players.filter((player) => player.id !== playerId);
  });

  socket.on('player-joined', (player) => {
		console.log('player joined', player);
		$players = [...$players, player];
	});

  socket.on('player-ready-change', (playerId, status) => {
		$players.forEach(player => {
        if (player.id === playerId) {
            player.ready = status;
        }
    });
    $players = [...$players];
	});

  socket.on('game-started', (gameInfo) =>{
    players.set(gameInfo.players)
    gameProps.set(gameInfo)
    activeComponent.set('game');
  });
</script>

<div>
  {#if $activeComponent !== "start" && $activeComponent !== "game"}
    <BackButton {socket} />
  {/if}
  {#if $activeComponent === "start"}
    <Start/>
  {/if}
  {#if $activeComponent === 'gameSettings'}
		<GameSettings {socket} />
	{/if}
  {#if $activeComponent === "lobby"}
    <Lobby {socket} />
  {/if}
  {#if $activeComponent === "gameList"}
    <GameList {socket} />
  {/if}
  {#if $activeComponent === "game"}
    <Game {socket} />
  {/if}
</div>
