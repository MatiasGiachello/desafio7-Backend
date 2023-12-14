document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById('home-page')) {
        var pageInfo = {
            route: "/"
        };

        var header = document.getElementById("header");

        if (pageInfo.route === "/") {
            header.classList.remove('scrollNav');
        } else {
            header.classList.add('scrollNav');
        }

        window.onscroll = function () {
            window.onscroll = function () {
                scroll = document.body.scrollTop;
                header = document.getElementById("header");

                if (scroll > 20) {
                    header.classList.add('scrollNav');
                } else if (scroll < 20) {
                    header.classList.remove('scrollNav');
                }
            }
        };
    }
});


document.getElementById("btn-menu").addEventListener("click", mostrar_menu);
function mostrar_menu() {
    document.getElementById("nav").classList.toggle('navResponsive');
}

window.addEventListener("resize", function () {
    if (window.innerWidth > 700) {
        document.getElementById("nav").classList.remove('navResponsive');
    }
})