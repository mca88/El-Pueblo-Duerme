<script>
    import { onDestroy, onMount } from "svelte";
    import { players, gameProps, player, useTime } from "$lib/stores";
    import TimerWait from "$components/TimerWait.svelte";
    export let socket;

    let selectedPlayerToKill = null;
    let selectedPlayerToRevive = null;
    let canUseKillPotion = !$gameProps.witchPotionsUsed.kill;
    let canUseRevivePotion = !$gameProps.witchPotionsUsed.revive;
    let myId = $player.id;
    let preys = $gameProps.selectedToDie;
    let timer = null;
    let isMounted = false;
    let accepted = false;

    function cleanupTimer() {
        if (timer) {
            timer.stop();
            timer = null;
        }
    }

    function createrTimer() {
        cleanupTimer();
        timer = useTime(5, () => {
            if (!isMounted) return;
            const actions = {
                killPlayerName: selectedPlayerToKill,
                revivePlayerName: selectedPlayerToRevive,
            };
            socket.emit("witch-actions", $gameProps.id, actions);
        });
    }
    function selectPlayerToKill(playerName) {
        if (selectedPlayerToKill === playerName) {
            selectedPlayerToKill = null;
        } else {
            selectedPlayerToKill = playerName;
        }
    }

    function selectPlayerToRevive(playerName) {
        if (selectedPlayerToRevive === playerName) {
            selectedPlayerToRevive = null;
        } else {
            selectedPlayerToRevive = playerName;
        }
    }

    onMount(() => {
        isMounted = true;
        createrTimer();
    });

    onDestroy(() => {
        isMounted = false;
        cleanupTimer();
    });
</script>

<div class="container witch-screen">
    {#if !accepted}
        <h3>Poción de Vida</h3>
        {#if canUseRevivePotion}
            {#if preys.length > 0}
                <div class="revive-section">
                    <div class="player-list">
                        {#each preys as playerToDie}
                            <article class="player-item">
                                <div class="player-name">{playerToDie}</div>
                                <div class="player-select">
                                    <input
                                        type="checkbox"
                                        checked={selectPlayerToRevive ===
                                            playerToDie}
                                        on:click={() =>
                                            selectPlayerToRevive(playerToDie)}
                                        aria-label="Seleccionar jugador"
                                        class="large-checkbox"
                                    />
                                </div>
                            </article>
                        {/each}
                    </div>
                </div>
            {:else}
                <p class="instruction-text">No hay jugadores muertos</p>
            {/if}
        {:else}
            <div class="revive-section">
                <p class="instruction-text">Ya has usado tu poción de vida.</p>
            </div>
        {/if}

        <!-- Sección para matar a un jugador -->
        <h3>Poción de Muerte</h3>
        {#if canUseKillPotion}
            <div class="kill-section">
                <div class="player-list">
                    {#each $players.filter((player) => player.alive && myId !== player.id && !preys.includes(player.name)) as player}
                        <article class="player-item">
                            <div class="player-name">{player.name}</div>
                            <div class="player-select">
                                <input
                                    type="checkbox"
                                    checked={selectedPlayerToKill ===
                                        player.name}
                                    on:click={() =>
                                        selectPlayerToKill(player.name)}
                                    aria-label="Seleccionar jugador para matar"
                                    class="large-checkbox"
                                />
                            </div>
                        </article>
                    {/each}
                </div>
            </div>
        {:else}
            <div class="kill-section">
                <p class="instruction-text">
                    Ya has usado tu poción de muerte.
                </p>
            </div>
        {/if}

        <button
            on:click={() => {
                timer.start();
                accepted = true;
            }}
            class="primary"
        >
            Aceptar
        </button>
    {:else}
        <TimerWait timeLeft={timer.timeLeft} />
    {/if}
</div>

<style>
    .witch-screen {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    h3 {
        text-align: center;
        margin: 0;
    }
</style>
