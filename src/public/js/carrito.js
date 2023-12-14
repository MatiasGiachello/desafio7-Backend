const addButton = document.querySelectorAll(".addButton")

const agregarProd = (idProduct) => {
    const url = 'http://localhost:8080/api/carts/'
    const bodyPost = [
        {
            _id: idProduct
        }
    ]

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPost),
    })
        .then(response => {
            if (response.ok) {
                console.log('Solicitud POST exitosa');

                Swal.fire({
                    toast: true,
                    position: "top-right",
                    title: `Producto agregado al carrito`,
                    timer: 2000,
                    showConfirmButton: false,
                    icon: "info"
                })
            } else {
                console.error('Error en la solicitud POST');

                Swal.fire({
                    toast: true,
                    position: "top-right",
                    title: `Error al agregar el producto al carrito`,
                    timer: 2000,
                    showConfirmButton: false,
                    icon: "error"
                })
            }
        })
        .catch(error => {
            console.error('Error en la solicitud POST:', error);
        });
}

addButton.forEach(addButton => {
    addButton.addEventListener("click", (id) => {
        const idProduct = id.target.id;
        agregarProd(idProduct);
    });
});