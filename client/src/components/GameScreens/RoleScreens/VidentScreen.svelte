<script>
    import { onDestroy, onMount } from "svelte";
    import { players, gameProps, player, useTime } from "$lib/stores";
    import TimerWait from "$components/TimerWait.svelte";
    import PlayerReveal from "$components/GameScreens/PlayerReveal.svelte";
    export let socket;

    let selectedPlayer = null;
    let showRole = false;
    let myId = $player.id;
    let timer = null;
    let isMounted = false;
    $: isConfirmButtonEnabled = selectedPlayer !== null;

    function toggleSelection(id) {
        selectedPlayer = id === selectedPlayer ? null : id;
    }

    function handleConfirm() {
        if (selectedPlayer !== null) {
            selectedPlayer = $players.find((p) => p.id === selectedPlayer);
            showRole = true;
            timer.start();
        }
    }

    function handleContinue() {
        socket.emit("continue-action", $gameProps.id);
    }

    function cleanupTimer() {
        if (timer) {
            timer.stop();
            timer = null;
        }
    }

    function createTimer() {
        cleanupTimer();

        timer = useTime(10, () => {
            if (!isMounted) return;
            socket.emit("continue-action", $gameProps.id);
        });
    }

    onMount(() => {
        isMounted = true;
        createTimer();
    });

    onDestroy(() => {
        cleanupTimer();
    });
</script>

{#if !showRole}
    <div class="container">
        <p class="instruction-text">Selecciona 1 jugador para ver su rol</p>
        <div class="player-list">
            {#each $players.filter((player) => player.alive && myId !== player.id) as player}
                <article class="player-item">
                    <div class="player-name">{player.name}</div>
                    <div class="player-select">
                        <input
                            type="checkbox"
                            checked={selectedPlayer === player.id}
                            on:click={() => toggleSelection(player.id)}
                            aria-label="Seleccionar jugador"
                            class="large-checkbox"
                        />
                    </div>
                </article>
            {/each}
        </div>
        <button
            on:click={handleConfirm}
            class="primary"
            disabled={!isConfirmButtonEnabled}
        >
            Aceptar
        </button>
    </div>
{:else}
    <PlayerReveal name={selectedPlayer.name} role={selectedPlayer.role} />
    <TimerWait timeLeft={timer.timeLeft} />
{/if}

<style>
</style>
