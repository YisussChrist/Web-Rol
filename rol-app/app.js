const personajes = {
    Renzu: {
        nombre: "Renzu Itō",
        avatar: "img/renzu.png"
    },

    Freyja: {
        nombre: "Freyja Kane",
        avatar: "img/freyja.png"
    },

    Tao: {
        nombre: "Tao Saotome",
        avatar: "img/tao.png"
    }
};

const lugares = [
    {
        nombre: "Raimon",
        categoria: "Inazuma Eleven",
        icono: "⚽"
    },
    {
        nombre: "Monte Olimpo",
        categoria: "Antigua Grecia",
        icono: "🏛️"
    },
    {
        nombre: "Atalaya de Kamisama",
        categoria: "Dragon Ball",
        icono: "☁️"
    },
    {
        nombre: "Satán City",
        categoria: "Dragon Ball",
        icono: "🏙️"
    },
    {
        nombre: "Laboratorio Pokémon",
        categoria: "Pokémon",
        icono: "🧪"
    },
    {
        nombre: "Catedral Científica",
        categoria: "Pokémon",
        icono: "⛪"
    }
];

let categoriaActual = "Todos";
let lugarActual = null;

function cargarCategorias(){

    const contenedor = document.getElementById("categoriasLugares");

    const categorias = [
        "Todos",
        ...new Set(lugares.map(lugar => lugar.categoria))
    ];

    contenedor.innerHTML = "";

    categorias.forEach(categoria => {

        const boton = document.createElement("button");

        boton.textContent = categoria;
        boton.className = "categoria-btn";

        if(categoria === categoriaActual){
            boton.classList.add("activa");
        }

        boton.addEventListener("click", () => {
            categoriaActual = categoria;
            cargarCategorias();
            cargarLugares();
        });

        contenedor.appendChild(boton);
    });
}

function cargarLugares(){

    const grid = document.getElementById("lugaresGrid");
    const busqueda = document
        .getElementById("buscadorLugares")
        .value
        .toLowerCase();

    grid.innerHTML = "";

    const lugaresFiltrados = lugares.filter(lugar => {

        const coincideCategoria =
            categoriaActual === "Todos" ||
            lugar.categoria === categoriaActual;

        const coincideBusqueda =
            lugar.nombre.toLowerCase().includes(busqueda) ||
            lugar.categoria.toLowerCase().includes(busqueda);

        return coincideCategoria && coincideBusqueda;
    });

    lugaresFiltrados.forEach(lugar => {

        const card = document.createElement("div");

        card.className = "lugar-card";

        if(lugarActual === lugar.nombre){
            card.classList.add("activo");
        }

        card.innerHTML = `
            <div class="lugar-icono">${lugar.icono}</div>
            <div class="lugar-nombre">${lugar.nombre}</div>
            <div class="lugar-categoria">${lugar.categoria}</div>
        `;

        card.addEventListener("click", () => {
            lugarActual = lugar.nombre;

            document.getElementById("nombreLugarActivo").textContent =
                lugar.nombre;

            cargarLugares();
        });

        grid.appendChild(card);
    });
}

document
    .getElementById("buscadorLugares")
    .addEventListener("input", cargarLugares);

cargarCategorias();
cargarLugares();

function enviarMensaje(){

    const personajeSeleccionado =
        document.getElementById("personaje").value;

    const texto =
        document.getElementById("mensaje").value;

    if(!texto.trim()) return;

    const personaje =
        personajes[personajeSeleccionado];

    const chat =
        document.getElementById("chat");

    chat.innerHTML += `
        <div class="mensaje">

            <img
                src="${personaje.avatar}"
                class="avatar"
            >

            <div class="contenido">
                <div class="nombre">
                    ${personaje.nombre}
                </div>

                <div>
                    ${texto}
                </div>
            </div>

        </div>
    `;

    document.getElementById("mensaje").value="";

    chat.scrollTop = chat.scrollHeight;

    
}

document.getElementById("mensaje").addEventListener("keydown", function(e){

    if(e.key === "Enter" && !e.shiftKey){

        e.preventDefault();

        enviarMensaje();
    }

});