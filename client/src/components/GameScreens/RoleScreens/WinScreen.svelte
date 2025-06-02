<script>
    import { players } from "$lib/stores";
    import { Roles, showRolePretty } from "$src/utils";

    export let winnerRole;
</script>

{#if winnerRole === Roles.ALDEANO}
    <h1>Ha ganado el pueblo</h1>
{:else if winnerRole === Roles.LOBO}
    <h1>Han ganado los lobos</h1>
{:else if winnerRole === Roles.ENAMORADOS}
    <h1>Han ganado los enamorados</h1>
{/if}

<div class="players-cont">
    <h3>Jugadores de esta partida</h3>

    <ul class="player-list">
        {#each $players as player}
            <li class="player-item">
                <div class="player-info">
                    <span class="player-name">{player.name}</span>
                    <span class="player-role">{showRolePretty(player.role)}</span>
                </div>
                {#if player.loverWith !== undefined && player.loverWith !== ""}
                    <span class="heart">❤️</span>
                {/if}
            </li>
        {/each}
    </ul>
</div>

<style>
    .players-cont {
        width: 100%;
        margin-bottom: 1rem;
    }

    h1{
        text-align: center;
    }

    h3 {
        margin-bottom: 0.5rem;
        font-size: 1.2rem;
    }

    .player-list {
        max-height: 500px;
        overflow-y: auto;
        border: 1px solid var(--muted-border-color);
        border-radius: var(--border-radius);
        padding: 0;
        margin-bottom: 1rem;
        width: 100%;
        list-style: none;
    }

    .player-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        margin: 0;
        border-bottom: 1px solid var(--muted-border-color);
    }

    .player-item:last-child {
        border-bottom: none;
    }

    .player-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-grow: 1;
    }

    .player-name {
        font-size: 1.1rem;
        font-weight: 500;
    }

    .player-role {
        font-size: 0.9rem;
        color: var(--muted-color);
    }

    .heart {
        font-size: 1rem;
    }
</style>
