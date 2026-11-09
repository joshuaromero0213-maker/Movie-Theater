// Configuración de la API de TMDb
const API_KEY = 'a676647f29a87cf621ada2d2cba569eb'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Objeto Global para la reserva activa
const reservaActual = {
  peliculaId: null,
  peliculaTitulo: '',
  precioUnitario: 15000,
  asientosSeleccionados: [],
  total: 0
};

// 1. Obtener películas en cartelera desde TMDb
async function obtenerPeliculasCartelera() {
  const url = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=es-CO&page=1`;

  try {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    
    const peliculasFormateadas = datos.results.map(pelicula => ({
      id: pelicula.id,
      titulo: pelicula.title,
      imagen: pelicula.poster_path 
        ? `${IMAGE_BASE_URL}${pelicula.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=Sin+Imagen',
      precio: 15000
    }));

    renderizarPeliculas(peliculasFormateadas);

  } catch (error) {
    console.error('Hubo un problema al cargar las películas desde la API:', error);
  }
}

// 2. Pintar las tarjetas en la página
function renderizarPeliculas(lista) {
  const contenedor = document.getElementById('movies-container');
  if (!contenedor) return;

  contenedor.innerHTML = '';

  lista.forEach(pelicula => {
    const tarjeta = document.createElement('article');
    tarjeta.classList.add('movie-card');

    tarjeta.innerHTML = `
      <img class="movie-card__image" src="${pelicula.imagen}" alt="${pelicula.titulo}">
      <h3 class="movie-card__title">${pelicula.titulo}</h3>
      <button class="movie-card__btn" onclick="seleccionarPelicula('${pelicula.id}')">Reservar Sala</button>
    `;

    contenedor.appendChild(tarjeta);
  });
}

// 3. Abrir Modal y cargar detalles de la película seleccionada desde la API
async function seleccionarPelicula(id) {
  try {
    const respuesta = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=es-CO`);
    const pelicula = await respuesta.json();

    reservaActual.peliculaId = pelicula.id;
    reservaActual.peliculaTitulo = pelicula.title;
    reservaActual.precioUnitario = 15000;
    reservaActual.asientosSeleccionados = [];
    reservaActual.total = 0;

    document.getElementById('modal-movie-title').textContent = `Reservar: ${pelicula.title}`;
    generarAsientos(48);
    actualizarResumen();

    document.getElementById('booking-modal').classList.add('active');

  } catch (error) {
    console.error('Error al obtener la película:', error);
  }
}

// 4. Generar Asientos Dinámicamente
function generarAsientos(totalAsientos) {
  const contenedor = document.getElementById('seats-container');
  contenedor.innerHTML = '';

  for (let i = 1; i <= totalAsientos; i++) {
    const asiento = document.createElement('div');
    asiento.classList.add('seat');
    asiento.dataset.numero = i;

    if (i % 7 === 0) {
      asiento.classList.add('seat--occupied');
    }

    contenedor.appendChild(asiento);
  }
}

// 5. Manejar selección de asientos (Event Delegation)
document.getElementById('seats-container').addEventListener('click', (e) => {
  const asiento = e.target;

  if (asiento.classList.contains('seat') && !asiento.classList.contains('seat--occupied')) {
    asiento.classList.toggle('seat--selected');
    
    const numeroAsiento = asiento.dataset.numero;

    if (asiento.classList.contains('seat--selected')) {
      reservaActual.asientosSeleccionados.push(numeroAsiento);
    } else {
      reservaActual.asientosSeleccionados = reservaActual.asientosSeleccionados.filter(id => id !== numeroAsiento);
    }

    actualizarResumen();
  }
});

// 6. Actualizar cantidades y total
function actualizarResumen() {
  const cantidad = reservaActual.asientosSeleccionados.length;
  reservaActual.total = cantidad * reservaActual.precioUnitario;

  document.getElementById('selected-count').textContent = cantidad;
  document.getElementById('total-price').textContent = reservaActual.total.toLocaleString();
}

// 7. Cerrar Modal
document.getElementById('btn-close-modal').addEventListener('click', cerrarModal);

function cerrarModal() {
  document.getElementById('booking-modal').classList.remove('active');
}

// 8. Arrancar la app consultando la API al cargar el navegador
document.addEventListener('DOMContentLoaded', () => {
  obtenerPeliculasCartelera();
});

// Cargar películas mejor valoradas en el segundo contenedor
async function obtenerPeliculasMejorValoradas() {
  const yearActual = new Date().getFullYear();
  const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-CO&sort_by=vote_average.desc&vote_count.gte=200&primary_release_year=${yearActual}&page=1`;

  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    
    const peliculasFormateadas = datos.results.map(pelicula => ({
      id: pelicula.id,
      titulo: pelicula.title,
      imagen: pelicula.poster_path 
        ? `${IMAGE_BASE_URL}${pelicula.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=Sin+Imagen',
      precio: 15000
    }));

    // Inyectamos en el segundo contenedor: 'top-movies-container'
    renderizarPeliculas(peliculasFormateadas, 'top-movies-container');

  } catch (error) {
    console.error('Error al obtener mejor valoradas:', error);
  }
}

// Actualiza renderizarPeliculas para aceptar el ID del contenedor objetivo
function renderizarPeliculas(lista, contenedorId = 'movies-container') {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = '';

  lista.forEach(pelicula => {
    const tarjeta = document.createElement('article');
    tarjeta.classList.add('movie-card');

    tarjeta.innerHTML = `
      <img class="movie-card__image" src="${pelicula.imagen}" alt="${pelicula.titulo}">
      <h3 class="movie-card__title">${pelicula.titulo}</h3>
      <button class="movie-card__btn" onclick="seleccionarPelicula('${pelicula.id}')">Reservar Sala</button>
    `;

    contenedor.appendChild(tarjeta);
  });
}

// Cargar ambas secciones al iniciar
document.addEventListener('DOMContentLoaded', () => {
  obtenerPeliculasCartelera();
  obtenerPeliculasMejorValoradas();
});