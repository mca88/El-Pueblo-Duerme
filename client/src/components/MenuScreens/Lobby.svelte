<script>
	import { players, gameProps, player } from "$lib/stores";
	export let socket;
	let ready_status = "Listo";
	let canStart = false;

	function playerReady() {
		if (ready_status === "Listo") {
			ready_status = "No Listo";
			socket.emit("player-ready", $gameProps.id, true);
		} else {
			ready_status = "Listo";
			socket.emit("player-ready", $gameProps.id, false);
		}
	}

	function gameCanStart() {
		let result = true;

		if ($players.length < 3) return false;

		$players.forEach((player) => {
			if (player.id === $gameProps.creator) return;
			if (!player.ready) result = false;
		});

		return result;
	}
	$: if ($players) {
		canStart = gameCanStart();
	}

	function startGame() {
		console.log("start game");
		socket.emit("start-game", $gameProps.id);
	}
</script>

<div class="component-wrapper">
	<h1>Lobby</h1>
	<h2>{$gameProps.name}</h2>

	<ul class="game-list">
		{#each $players as player}
			<li>
				{player.name}
				{#if player.id === $gameProps.creator}
					👑
				{:else if player.ready}
					✅
				{:else}
					❌
				{/if}
			</li>
		{/each}
	</ul>

	{#if $player.id === $gameProps.creator}
		<button
			on:click={startGame}
			class:disabled={!canStart}
			class:secondary={!canStart}
		>
			Iniciar juego
		</button>
	{:else}
		<button on:click={playerReady}>{ready_status}</button>
	{/if}
</div>

<style>
	.component-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}
	h1 {
		margin-bottom: 0px;
	}
	h2 {
		font-size: 1rem;
	}
	button {
		max-width: 200px;
	}
	.game-list {
		list-style: none;
		padding: 0;
		overflow-y: scroll;
		max-height: 800px;
		font-size: 20px;
	}
	.game-list li {
		width: 100%;
	}
</style>
