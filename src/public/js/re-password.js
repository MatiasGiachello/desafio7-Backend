const form = document.getElementById('accessForm')

form.addEventListener('submit', e => {
    e.preventDefault()
    const data = new FormData(form)
    const obj = {}
    data.forEach((value, key) => obj[key] = value)

    fetch('api/sessions/forgot-password', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        console.log(res.status)
        if (res.status === 200) {
            window.location.replace('/sucess-email')
        } else {
            window.location.replace('/error-email')
        }
    })
})