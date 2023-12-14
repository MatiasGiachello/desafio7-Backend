const socketClient = io()
const nombreUsuario = document.getElementById("nombreusuario")
const formulario = document.getElementById("formulario")
const inputmensaje = document.getElementById("mensaje")
const chat = document.getElementById("chat")

let usuario = null

if (!usuario) {
    Swal.fire({
        title: "¿Cómo te Llamas?",
        text: "Ingresa tu Nombre de Usuario",
        input: "text",
        inputValidator: (value) => {
            if (!value) {
                return "Necesitas ingresar tu Nombre"
            }
        },
        allowOutsideClick: false
    })
        .then(username => {
            usuario = username.value
            nombreUsuario.innerHTML = usuario
            socketClient.emit("nuevoUsuario", usuario)
        })
}

formulario.onsubmit = (e) => {
    e.preventDefault()
    const info = {
        user: usuario,
        message: inputmensaje.value
    }
    console.log(info)
    socketClient.emit("message", info)
    inputmensaje.value = " "

}

socketClient.on("chat", mensaje => {
    const chatrender = mensaje.map(e => {
        return `<p><strong>${e.user}:</strong>${e.message}`
    }).join(" ")
    chat.innerHTML = chatrender
})

socketClient.on("broadcast", usuario => {
    Swal.fire({
        toast: true,
        position: "top-right",
        title: `${usuario} se ha unido al Chat`,
        timer: 2000,
        showConfirmButton: false,
        icon: "info"
    })
})