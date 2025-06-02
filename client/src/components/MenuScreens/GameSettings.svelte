<script>
    import { activeComponent, players, gameProps, player } from "$lib/stores";
    import { Roles } from "$src/utils";

    export let socket;
    const settings = {
        creator: "",
        name: `${$player.name}'s Game`,
        roles: {
            [Roles.BRUJA]: false,
            [Roles.VIDENTE]: false,
            [Roles.CUPIDO]: false,
        },
        voteTime: 60,
    };

    function createGame(gameSettings) {
        console.log("gs", gameSettings);
        let data = { name: $player.name, settings: gameSettings };
        socket.emit("create-game", data, (response) => {
            console.log(response.status);
            if (response.status === "ok") {
                players.set(response.gameData.players);
                gameProps.set(response.gameData);
                $player.id = response.playerId;
                activeComponent.set("lobby");
            }
            console.log($players);
        });
    }
</script>

<div class="conf-wrapper">
    <h2>Configuración de la partida</h2>
    <form>
        <label for="gameName">Nombre de la partida: </label>
        <input id="gameName" type="text" bind:value={settings.name} />

        <label for="waitTime">Tiempo de votación: {settings.voteTime}s</label>
        <input
            id="waitTime"
            type="range"
            min="60"
            max="120"
            bind:value={settings.voteTime}
        />

        <h4>Roles</h4>

        <div class="checkboxes">
            <label for="bruja">Bruja</label>
            <input
                type="checkbox"
                id="bruja"
                name="bruja"
                bind:checked={settings.roles[Roles.BRUJA]}
            />

            <label for="vidente">Vidente</label>
            <input
                type="checkbox"
                id="vidente"
                name="vidente"
                bind:checked={settings.roles[Roles.VIDENTE]}
            />

            <label for="cupido">Cupido</label>
            <input
                type="checkbox"
                id="cupido"
                name="cupido"
                bind:checked={settings.roles[Roles.CUPIDO]}
            />

            <!-- Añade más roles aquí si es necesario -->

            <button
                class="create-button"
                on:click|preventDefault={() => createGame(settings)}
            >
                Crear partida
            </button>
        </div>
    </form>
</div>

<style>
    .conf-wrapper {
        padding: 3rem;
    }
    .checkboxes {
        display: grid;
        grid-template-columns: auto auto; /* una columna para labels, otra para checkboxes */
        gap: 1.8rem 2rem;
        align-items: center;
    }

    .checkboxes label,
    .checkboxes input[type="checkbox"] {
        justify-self: start; /* alinea todo a la izquierda */
    }

    .checkboxes input[type="checkbox"] {
        transform: scale(1.5);
        cursor: pointer;
    }

    .create-button {
        grid-column: 1 / -1;
        margin-top: 1rem;
        justify-self: start; /* botón alineado a la izquierda también */
    }
</style>
