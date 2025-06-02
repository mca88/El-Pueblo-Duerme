export const Roles = Object.freeze({
    VIDENTE: 'vident',
    LOBO: 'wolf',
    ALDEANO: 'villager',
    CUPIDO: 'cupid',
    BRUJA: 'witch',
    ENAMORADOS : 'lovers_meet'
});

export function showRolePretty(role) {
    let roleToShow = "";
    switch (role) {
        case Roles.ALDEANO:
            roleToShow = "Aldeano 👨‍🌾";
            break;

        case Roles.LOBO:
            roleToShow = "Lobo 🐺";
            break;

        case Roles.VIDENTE:
            roleToShow = "Vidente 👁️";
            break;

        case Roles.CUPIDO:
            roleToShow = "Cupido 💘";
            break;

        case Roles.BRUJA:
            roleToShow = "Bruja 🧙‍♀️";
            break;

        default:
            break;
    }
    return roleToShow;
}

export function playRoleAudio(role){

    let path;
    
    if(role === Roles.ALDEANO || role === Roles.ENAMORADOS){
        path = 'sounds/Pueblo.mp3'
    }
    else if(role === Roles.CUPIDO){
        path = 'sounds/Cupido.mp3'
    }
    else if(role === Roles.VIDENTE){
        path = 'sounds/Vidente.mp3'
    }
    else if(role === Roles.LOBO){
        path = 'sounds/Lobos.mp3'
    }
    else if(role === Roles.BRUJA){
        path = 'sounds/Bruja.mp3'
    }

    const audio = new Audio(path)
    audio.play().catch(error => {
        console.error("Fallo al reproducir el sonido: ", error)
    })
}