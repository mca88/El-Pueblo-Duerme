<script>
    import { onMount } from "svelte";
    import { activeComponent, player } from "$lib/stores";

    let audio;
</script>

<div class="wrapper">
    <h1>El Pueblo Duerme</h1>
    <input
        type="text"
        placeholder="Nombre"
        bind:value={$player.name}
        maxlength="11"
    />

    <div class="buttons" class:disabled={!$player.name}>
        <button
            class="boton"
            on:click={() => activeComponent.set("gameSettings")}
            >Crear partida</button
        >
        <button class="boton" on:click={() => activeComponent.set("gameList")}
            >Unirse a partida</button
        >
    </div>
</div>

<style>
    h1 {
        text-align: center;
    }

    .wrapper {
        max-width: 1200px;
        margin: 0 auto;
    }

    .buttons {
        display: flex;
        flex-direction: row;
        gap: 20px;
        align-items: center;
    }

    .boton {
        white-space: nowrap;
    }

    @media screen and (max-width: 600px) {
        .wrapper {
            max-width: 300px;
        }
        .buttons {
            flex-direction: column;
            gap: 10px;
        }
    }
</style>
