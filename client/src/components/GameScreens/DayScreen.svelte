<script>
    import { onDestroy, onMount } from "svelte";
    import { player, players, gameProps, useTime } from "$lib/stores";
    import { showRolePretty } from "$src/utils.js";
    import TimerWait from "$components/TimerWait.svelte";
    export let socket;

    let isVisible = true;
    let votationDone = false;
    let votationWinner = null;
    let selectedPlayer = null;
    let myId = $player.id;
    const deadPlayers = $players.filter((p) => !p.alive);
    const killedPlayers = $gameProps.selectedToDie.map((name) => ({
        name,
        role: getRoleByName(name),
    }));
    const alivePlayers = $players.filter((p) => p.alive);
    const sortedPlayers = deadPlayers.concat(alivePlayers);

    let dayTimer = null;
    let finalTimer = null;
    let isMounted = null;

    $: votes = [];
    $: selectedPlayerName = null;

    function cleanupTimers() {
        if (dayTimer) {
            dayTimer.stop();
            dayTimer = null;
        }
        if (finalTimer) {
            finalTimer.stop();
            finalTimer = null;
        }
    }

    function createTimers() {
        cleanupTimers();

        dayTimer = useTime($gameProps.voteTime+10, () => {
            if (!isMounted) return;
            if (alivePlayers[0].id === myId) {
                socket.emit("player-vote", $gameProps.id, null, -1);
            }
        });

        finalTimer = useTime(10, () => {
            if (!isMounted) return;

            if (alivePlayers[0].id === myId) {
                socket.emit("continue-action", $gameProps.id);
            }
        });
    }

    function getRoleByName(name) {
        const player = $players.find((p) => p.name === name);
        return player.role;
    }

    function handleAccept() {
        socket.emit(
            "player-vote",
            $gameProps.id,
            { voter: $player.id, candidate: selectedPlayer },
            alivePlayers.length,
        );
    }

    function toggleSelection(id) {
        selectedPlayer = id === selectedPlayer ? null : id;

        if (selectedPlayer !== null) {
            if (selectedPlayer === "No votar") {
                selectedPlayerName = "No votar";
            } else {
                selectedPlayerName = alivePlayers.find(
                    (p) => p.id === selectedPlayer,
                ).name;
            }
        } else {
            selectedPlayerName = null;
        }
    }

    onMount(() => {
        isMounted = true;
        createTimers();
        dayTimer.start();

        socket.on("vote-update", (new_votes) => {
            votes = [...new_votes];
        });

        socket.on("votation-done", (winner) => {
            votationDone = true;
            votationWinner = winner;
            finalTimer.start();
        });
    });

    onDestroy(() => {
        isMounted = false;
        cleanupTimers();
        socket.off("vote-update");
        socket.off("votation-done");
    });
</script>

{#if isVisible}
    <dialog open class="modal">
        <article>
            <header>
                <h3>Resultados de la Noche</h3>
            </header>

            <div class="content">
                {#if killedPlayers.length > 0}
                    <h4>Jugadores fallecidos:</h4>
                    <div>
                        {#each killedPlayers as player}
                            <div class="dead-player">
                                <strong
                                    >{player.name}
                                    {#if $players.find((p) => p.name === player.name).loversWith !== ""}
                                        ❤️
                                    {/if}
                                </strong>
                                <span class="role"
                                    >{showRolePretty(player.role)}</span
                                >
                            </div>
                        {/each}
                    </div>
                {:else}
                    <p>No ha muerto ningún jugador esta noche.</p>
                {/if}
            </div>

            <footer>
                <button
                    on:click={() => {
                        isVisible = false;
                    }}
                >
                    Aceptar
                </button>
            </footer>
        </article>
    </dialog>
{/if}

{#if !votationDone}
    <div class="container">
        <p class="instruction-text">Vota a un jugador para expulsarlo</p>
        <div class="player-list">
            {#each sortedPlayers as player}
                <article class="player-item">
                    <div class="player-name">{player.name}</div>
                    {#if player.alive}
                        {#if player.id !== myId}
                            <div class="player-select">
                                <input
                                    type="checkbox"
                                    checked={selectedPlayer === player.id}
                                    on:click={() => toggleSelection(player.id)}
                                    aria-label="Seleccionar jugador"
                                    class="large-checkbox"
                                />
                            </div>
                        {/if}
                        <div class="vote-count">
                            {votes.filter(
                                (vote) => vote.candidate === player.id,
                            ).length}
                        </div>
                    {:else}
                        <div>
                            {showRolePretty(player.role)} 💀
                        </div>
                    {/if}
                </article>
            {/each}

            <article class="player-item">
                <div class="player-name">No votar</div>

                <div class="player-select">
                    <input
                        type="checkbox"
                        checked={selectedPlayer === "No votar"}
                        on:click={() => toggleSelection("No votar")}
                        aria-label="Seleccionar jugador"
                        class="large-checkbox"
                    />
                </div>
                <div class="vote-count">
                    {votes.filter((vote) => vote.candidate === "No votar")
                        .length}
                </div>
            </article>
        </div>

        <div class="selected-info">
            <p>Votos totales: {votes.length}/{alivePlayers.length}</p>
        </div>

        <button
            on:click={handleAccept}
            class="primary"
            disabled={selectedPlayerName === null}
        >
            {#if selectedPlayerName !== null}
                {#if selectedPlayerName !== "No votar"}
                    Votar por {selectedPlayerName}
                {:else}
                    No votar
                {/if}
            {:else}
                Selecciona jugador
            {/if}
        </button>
        {#if isMounted}
            <TimerWait timeLeft={dayTimer.timeLeft} text="" />
        {/if}
    </div>
{:else}
    <div class="confirmation-container">
        <p class="prey-name">
            {#if votationWinner === "draw"}
                Empate en la votación
            {:else if votationWinner === "No votar"}
                Se ha votado no expulsar a nadie
            {:else}
                {alivePlayers.find((p) => p.id === votationWinner).name} ha sido
                expulsado
                <p class="role">
                    Rol: <strong
                        >{showRolePretty(
                            alivePlayers.find((p) => p.id === votationWinner)
                                .role,
                        )}</strong
                    >
                </p>
            {/if}
        </p>
        <TimerWait
            timeLeft={finalTimer.timeLeft}
            text="Cierra los ojos y espera al siguiente rol. O jódete si te han expulsado"
        />
    </div>
{/if}

<style>
    .vote-count {
        padding-left: 10px;
        font-size: large;
        width: 4ch;
        text-align: center;
    }
    .modal {
        max-width: 32rem;
    }
    header {
        padding-bottom: 0;
    }

    .content {
        margin-bottom: 1rem;
    }

    .dead-player {
        padding: 0.5rem;
        border-bottom: 1px solid var(--muted-border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .dead-player:last-child {
        border-bottom: none;
    }

    .role {
        color: var(--primary);
        font-weight: 500;
    }

    footer {
        display: flex;
        justify-content: center;
    }

    h3 {
        text-align: center;
        padding-bottom: 0;
    }
    .role {
        font-size: 1.2rem;
        margin: 0.5rem 0;
    }
</style>
