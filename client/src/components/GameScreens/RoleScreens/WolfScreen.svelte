<script>
    import { onDestroy, onMount } from "svelte";
    import { gameProps, players, player, useTime } from "$lib/stores";
    import { Roles } from "$src/utils.js";
    import TimerWait from "$components/TimerWait.svelte";
    export let socket;

    let finalTimer = null;
    let confirmTimer = null;
    let isMounted = false;
    let selectedPlayer = null;
    let selectionDone = false;

    let potentialVictims = $players.filter(
        (player) => player.alive && player.role !== Roles.LOBO,
    );
    let wolves = $players.filter(
        (player) => player.alive && player.role === Roles.LOBO,
    );

    $: wolfSelections = [];
    $: showTimer = false;
    $: getSelectionStatus = (selectionName) => {
        if (!selectionName) return "no-selection";
        if (wolves.length === 1) return "matching-selection";

        const count = wolfSelections.filter(
            (s) => s.name === selectionName,
        ).length;

        if (count > 1) {
            return "matching-selection";
        } else {
            return "non-matching-selection";
        }
    };

    function cleanupTimers() {
        if (confirmTimer) {
            confirmTimer.stop();
            confirmTimer = null;
        }

        if (finalTimer) {
            finalTimer.stop();
            finalTimer = null;
        }
    }

    function createTimers() {
        cleanupTimers();

        confirmTimer = useTime(5, () => {
            if (!isMounted) return;
            selectionDone = true;
            if (finalTimer) {
                finalTimer.start();
            }
        });

        finalTimer = useTime(10, () => {
            if (!isMounted) return;

            if (wolves[0].id === $player.id) {
                socket.emit(
                    "continue-action-kill",
                    $gameProps.id,
                    wolfSelections[0].name,
                );
            }
        });
    }

    function handleWolfSelectionDone(new_selection) {
        if (!isMounted) return;

        const exists = wolfSelections.find(
            (selection) => selection.id === new_selection.id,
        );

        if (exists) {
            exists.name = new_selection.name;

            if (!exists.name) {
                wolfSelections = wolfSelections.filter(
                    (selection) => selection.id !== new_selection.id,
                );
            } else {
                wolfSelections = wolfSelections;
            }
        } else {
            wolfSelections = [...wolfSelections, new_selection];
        }

        if (checkWolvesAgreement()) {
            showTimer = true;
            if (confirmTimer) {
                confirmTimer.start();
            }
        } else {
            showTimer = false;
            if (confirmTimer) {
                confirmTimer.stop();
            }
        }
    }

    onMount(() => {
        isMounted = true;
        createTimers();
        socket.on("wolf-selection-done", handleWolfSelectionDone);
    });

    onDestroy(() => {
        isMounted = false;
        cleanupTimers();
        socket.off("wolf-selection-done", handleWolfSelectionDone);
    });

    function toggleSelection(id) {
        selectedPlayer = selectedPlayer === id ? null : id;
        let preyName = "Ninguno";
        if (selectedPlayer !== "Ninguno") {
            preyName = $players.find(
                (player) => player.id === selectedPlayer,
            )?.name;
        }

        socket.emit(
            "wolf-selection",
            {
                id: $player.id,
                name: preyName,
            },
            $gameProps.id,
        );
    }

    function checkWolvesAgreement() {
        if (wolfSelections.length !== wolves.length) return false;

        const firstSelection = wolfSelections[0]?.name;
        if (!firstSelection) return false;

        const allSame = wolfSelections.every(
            (selection) => selection.name === firstSelection,
        );

        if (allSame && wolves.length > 0) return true;

        return false;
    }
</script>

<div class="container">
    {#if !selectionDone}
        <div class="wolf-selections-container">
            <div class="wolf-selections-list">
                {#each wolves as wolf}
                    {@const selection = wolfSelections.find(
                        (selection) => selection.id === wolf.id,
                    )}
                    <div class="wolf-selection-row">
                        <div class="wolf-name">
                            {wolf.id === $player.id ? "Tú" : wolf.name}:
                        </div>
                        <div class="wolf-target">
                            {#if selection}
                                <span class={getSelectionStatus(selection.name)}
                                    >{selection.name}</span
                                >
                            {:else}
                                <span class="no-selection">Sin elegir</span>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        <div class="player-list">
            {#each potentialVictims as player}
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

            <article class="player-item">
                <div class="player-name">No elegir</div>
                <div class="player-select">
                    <input
                        type="checkbox"
                        checked={selectedPlayer === "Ninguno"}
                        on:click={() => toggleSelection("Ninguno")}
                        aria-label="Seleccionar jugador"
                        class="large-checkbox"
                    />
                </div>
            </article>
        </div>

        <p class="instruction-text">
            Todos los lobos deben ponerse de acuerdo para continuar
        </p>

        {#if showTimer && confirmTimer}
            <TimerWait timeLeft={confirmTimer.timeLeft} text="Confirmando..." />
        {/if}
    {:else}
        <div class="confirmation-container">
            <h2 class="selection-title">Presa seleccionada</h2>
            <p class="prey-name">{wolfSelections[0]?.name || "Ninguno"}</p>
            {#if finalTimer}
                <TimerWait timeLeft={finalTimer.timeLeft} />
            {/if}
        </div>
    {/if}
</div>

<style>
    .matching-selection {
        color: var(--success, #28a745);
        font-weight: bold;
        font-size: large;
    }

    .non-matching-selection {
        color: var(--danger, #dc3545);
        font-weight: bold;
        font-size: large;
    }
    .wolf-selections-container {
        background-color: var(--card-background-color);
        border: 1px solid var(--card-border-color);
        border-radius: var(--border-radius);
        padding: 0.75rem;
        margin-bottom: 1rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .wolf-selections-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .wolf-selection-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0;
        justify-content: space-between;
    }

    .wolf-name {
        font-weight: bold;
    }

    .wolf-target {
        font-size: 0.9rem;
    }

    .selection-made {
        color: var(--primary);
    }

    .no-selection {
        color: var(--muted-color);
        font-style: italic;
        font-size: large;
    }
</style>
