<script>
	import { onMount } from "svelte";
	import { player, activeComponent, gameProps, players } from "$lib/stores";
	let games = [];
	export let socket;

	onMount(() => {
		socket.emit("get-game-list", (response) => {
			games = response;
		});
	});

	function joinGame(game) {
		console.log("join game:" + game);
		socket.emit(
			"join-game",
			{ gameId: game, name: $player.name },
			(response) => {
				if (response.status === "ok") {
					players.set(response.gameData.players);
					gameProps.set(response.gameData);
					$player.id = response.playerId;
					activeComponent.set("lobby");
				} else
					alert(
						"No has podido unirte al juego:\nJuego cerrado o nombre duplicado",
					);
			},
		);
	}
</script>

<div class="component-wrapper">
	<h1>Partidas abiertas</h1>
	<ul class="game-list">
		{#each games as game}
			<li>
				<div class="flex-col">
					<h2>{game.name}</h2>
				</div>
				<div class="flex-row">
					<p>Jugadores: {game.players}</p>
				</div>
				<button
					on:click={() => {
						joinGame(game.id);
					}}>Unirse</button
				>
			</li>
		{/each}
	</ul>
</div>

<style>
	h2 {
		font-size: 1.1rem;
	}
	.component-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}
	.flex-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}
	.game-list {
		list-style: none;
		padding: 0;
		overflow-y: scroll;
		max-height: 800px;
		width: 300px;
	}
	.game-list li {
		width: 100%;

		/* display: flex;
		align-items: center; */
		padding: 0.5rem;
		border-bottom: 1px solid #ccc;
	}
	.game-list h2 {
		font: 1rem;
		margin: 0;
	}
	.game-list p {
		font: 1rem;
		margin: 0;
	}
</style>
