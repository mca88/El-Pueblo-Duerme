<script>
    import { players, gameProps } from "$lib/stores";
    export let socket;
    let selectedPlayers = [];
    function toggleSelection(id, event) {
        if (selectedPlayers.includes(id)) {
            selectedPlayers = selectedPlayers.filter(
                (selected_id) => selected_id !== id,
            );
        } else if (selectedPlayers.length < 2) {
            selectedPlayers = [...selectedPlayers, id];
        } else {
            event.preventDefault();
        }
    }
    function handleConfirm() {
        if (selectedPlayers.length === 2) {
            socket.emit("cupid-action", $gameProps.id, selectedPlayers);
        }
    }
    $: isConfirmButtonEnabled = selectedPlayers.length === 2;
</script>

<div class="container">
    <p class="instruction-text">Selecciona 2 jugadores para enamorarlos</p>
    <div class="player-list">
        {#each $players as player}
            <article class="player-item">
                <div class="player-name">{player.name}</div>
                <div class="player-select">
                    <input
                        type="checkbox"
                        checked={selectedPlayers.includes(player.id)}
                        on:click={(event) => toggleSelection(player.id, event)}
                        aria-label="Seleccionar jugador"
                        class="large-checkbox"
                    />
                </div>
            </article>
        {/each}
    </div>
    <div class="selected-info">
        <p>Jugadores seleccionados: {selectedPlayers.length}/2</p>
    </div>
    <!-- Botón deshabilitado si no hay 2 jugadores seleccionados -->
    <button
        on:click={handleConfirm}
        class="primary"
        disabled={!isConfirmButtonEnabled}
    >
        Aceptar
    </button>
</div>

<style>
</style>
