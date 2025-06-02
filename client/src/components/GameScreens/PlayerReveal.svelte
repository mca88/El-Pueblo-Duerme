<script>
    import { showRolePretty } from "$src/utils";

    export let name = "";
    export let role = "";
</script>

<div class="container role-reveal">
    <div class="role-card">
        <h3>{name}</h3>
        <p class="role">
            Rol: <strong>{showRolePretty(role)}</strong>
        </p>
    </div>
</div>

<style>
    .role-reveal {
        text-align: center;
    }
    .role-card {
        border: 1px solid var(--muted-border-color);
        border-radius: var(--border-radius);
        padding: 1.5rem;
        margin: 1.5rem 0;
        background-color: var(--card-background-color);
    }
    .role {
        font-size: 1.2rem;
        margin: 0.5rem 0;
    }

    h3 {
        margin-bottom: 0;
        font-weight: bold;
        color: var(--primary, #1095c1);
    }
</style>
