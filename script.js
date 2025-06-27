// Variables globales
let productos = [];
let productoEditandoIndex = -1;

// Cargar productos desde localStorage
try {
    productos = JSON.parse(localStorage.getItem('productos')) || [];
} catch (error) {
    console.error('Error al cargar productos desde localStorage:', error);
    productos = [];
}

// Variables globales para categorías
let categorias = [];
try {
    categorias = JSON.parse(localStorage.getItem('categorias')) || ['Electrónica', 'Ropa', 'Alimentos', 'Hogar'];
} catch (e) {
    categorias = ['Electrónica', 'Ropa', 'Alimentos', 'Hogar'];
}

// Cambia la URL de imagen por defecto a una ruta local para evitar error de red
const IMAGEN_DEFAULT = 'img/placeholder.png';

// Función para mostrar las categorías en la tabla y en el select de productos
function mostrarCategorias() {
    const tablaCategorias = document.getElementById('tabla-categorias');
    if (tablaCategorias) {
        tablaCategorias.innerHTML = categorias.map((categoria, index) => `
            <tr>
                <td>${categoria}</td>
                <td>
                    <button onclick="editarCategoria(${index})" class="btn-editar"><i class="fas fa-edit"></i> Editar</button>
                    <button onclick="eliminarCategoria(${index})" class="btn-eliminar"><i class="fas fa-trash-alt"></i> Eliminar</button>
                </td>
            </tr>
        `).join('');
    }
    // Actualizar select de categorías en el formulario de productos
    const selectCategoria = document.getElementById('categoria-producto');
    if (selectCategoria) {
        const valorActual = selectCategoria.value;
        selectCategoria.innerHTML = '<option value="" disabled selected>Seleccione una categoría...</option>' +
            categorias.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        // Restaurar selección si aplica
        if (categorias.includes(valorActual)) selectCategoria.value = valorActual;
    }
}

// Función para editar una categoría
function editarCategoria(index) {
    const nuevaCategoria = prompt('Ingrese el nuevo nombre de la categoría:', categorias[index]);
    if (nuevaCategoria && nuevaCategoria.trim() !== '') {
        categorias[index] = nuevaCategoria.trim();
        localStorage.setItem('categorias', JSON.stringify(categorias));
        mostrarCategorias();
        mostrarMensajeTabla('exito', 'Categoría editada correctamente.');
    }
}

// Función para eliminar una categoría
function eliminarCategoria(index) {
    if (confirm('¿Está seguro de que desea eliminar esta categoría?')) {
        categorias.splice(index, 1);
        localStorage.setItem('categorias', JSON.stringify(categorias));
        mostrarCategorias();
        mostrarMensajeTabla('exito', 'Categoría eliminada correctamente.');
    }
}

// Función para limpiar el formulario
function limpiarFormulario() {
    const formulario = document.getElementById('formulario-inventario');
    if (formulario) {
        formulario.reset();
    } else {
        console.error('Formulario de inventario no encontrado.');
    }
}

// Función para agregar una nueva categoría
function agregarCategoria() {
    const nuevaCategoriaInput = document.getElementById('nueva-categoria');
    if (!nuevaCategoriaInput) {
        mostrarMensajeTabla('error', 'Campo de nueva categoría no encontrado.');
        return;
    }
    const nuevaCategoria = nuevaCategoriaInput.value.trim();
    if (!nuevaCategoria || categorias.includes(nuevaCategoria)) {
        mostrarMensajeTabla('error', 'Por favor, ingrese una categoría válida o que no exista.');
        return;
    }
    categorias.push(nuevaCategoria);
    localStorage.setItem('categorias', JSON.stringify(categorias));
    mostrarCategorias();
    nuevaCategoriaInput.value = '';
    mostrarMensajeTabla('exito', 'Categoría agregada correctamente.');
}

// Función para mostrar productos en la tabla
function mostrarProductos(listaProductos = productos) {
    const tablaBody = document.getElementById('tabla-body');
    if (!tablaBody) {
        console.error('Elemento "tabla-body" no encontrado.');
        return;
    }
    if (listaProductos.length === 0) {
        tablaBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; color: #999;">No hay productos registrados.</td>
            </tr>
        `;
        return;
    }
    tablaBody.innerHTML = listaProductos.map((producto, index) => {
        // Corregir: Si la imagen es null, undefined o contiene 'via.placeholder.com/50', usar IMAGEN_DEFAULT
        let imgSrc = IMAGEN_DEFAULT;
        if (producto.imagen && typeof producto.imagen === 'string' && producto.imagen.trim() !== '' && !producto.imagen.includes('via.placeholder.com/50')) {
            imgSrc = producto.imagen;
        }
        return `
        <tr>
            <td>${producto.codigo || 'N/A'}</td>
            <td>${producto.nombre || 'N/A'}</td>
            <td>${producto.costo || 0}</td>
            <td>${producto.precio || 0}</td>
            <td>${formatearFecha(producto.fechaCaducidad)}</td>
            <td>${producto.fechaRegistro || 'N/A'}</td>
            <td>${producto.categoria || 'N/A'}</td>
            <td>
                <img src="${imgSrc}" alt="${producto.nombre || 'Imagen'}" width="50">
            </td>
            <td>
                <button onclick="editarProducto(${index})" class="btn-accion btn-editar" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="eliminarProducto(${index})" class="btn-accion btn-eliminar" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

// Función para formatear fechas
function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Función para editar un producto
function editarProducto(index) {
    const producto = productos[index];
    if (!producto) {
        console.error('Producto no encontrado en el índice:', index);
        return;
    }

    const tablaBody = document.getElementById('tabla-body');
    const fila = tablaBody.rows[index];
    fila.innerHTML = `
        <td><input type="text" value="${producto.codigo}" id="edit-codigo-${index}" style="width: 100%;"></td>
        <td><input type="text" value="${producto.nombre}" id="edit-nombre-${index}" style="width: 100%;"></td>
        <td><input type="number" value="${producto.costo}" id="edit-costo-${index}" style="width: 100%;"></td>
        <td><input type="number" value="${producto.precio}" id="edit-precio-${index}" style="width: 100%;"></td>
        <td><input type="date" value="${producto.fechaCaducidad}" id="edit-fecha-${index}" style="width: 100%;"></td>
        <td>${producto.fechaRegistro || 'N/A'}</td>
        <td>
            <select id="edit-categoria-${index}" style="width: 100%;">
                ${categorias.map(cat => `<option value="${cat}" ${cat === producto.categoria ? 'selected' : ''}>${cat}</option>`).join('')}
            </select>
        </td>
        <td>
            <input type="file" id="edit-imagen-${index}" accept="image/*" style="width: 100%;">
            ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}" width="50" style="margin-top: 10px;">` : ''}
        </td>
        <td>
            <button onclick="guardarCambios(${index})" class="btn-guardar"><i class="fas fa-save"></i> Guardar</button>
            <button onclick="cancelarEdicionFila(${index})" class="btn-cancelar"><i class="fas fa-times"></i> Cancelar</button>
        </td>
    `;
}

// Función para guardar los cambios realizados en un producto
function guardarCambios(index) {
    const codigo = document.getElementById(`edit-codigo-${index}`).value.trim();
    const nombre = document.getElementById(`edit-nombre-${index}`).value.trim();
    const costo = parseFloat(document.getElementById(`edit-costo-${index}`).value.trim());
    const precio = parseFloat(document.getElementById(`edit-precio-${index}`).value.trim());
    const fechaCaducidad = document.getElementById(`edit-fecha-${index}`).value.trim();
    const categoria = document.getElementById(`edit-categoria-${index}`).value.trim();
    const imagenInput = document.getElementById(`edit-imagen-${index}`);

    if (!codigo || !nombre || isNaN(costo) || isNaN(precio) || !fechaCaducidad || !categoria) {
        alert('Por favor, complete todos los campos correctamente.');
        return;
    }

    let imagenUrl = productos[index].imagen;
    if (imagenInput.files.length > 0) {
        const file = imagenInput.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            imagenUrl = e.target.result;
            actualizarProductoEnArray(index, codigo, nombre, costo, precio, fechaCaducidad, categoria, imagenUrl);
        };
        reader.readAsDataURL(file);
    } else {
        actualizarProductoEnArray(index, codigo, nombre, costo, precio, fechaCaducidad, categoria, imagenUrl);
    }
}

// Función para actualizar un producto en el array
function actualizarProductoEnArray(index, codigo, nombre, costo, precio, fechaCaducidad, categoria, imagenUrl) {
    productos[index] = { codigo, nombre, costo, precio, fechaCaducidad, categoria, imagen: imagenUrl, fechaRegistro: productos[index].fechaRegistro };
    try {
        localStorage.setItem('productos', JSON.stringify(productos));
        alert('Cambios guardados correctamente.');
    } catch (error) {
        console.error('Error al guardar productos en localStorage:', error);
        alert('Error al guardar los cambios.');
    }
    mostrarProductos();
}

// Función para cancelar la edición de un producto
function cancelarEdicionFila(index) {
    mostrarProductos();
}

// Función para eliminar un producto
function eliminarProducto(index) {
    if (index < 0 || index >= productos.length) {
        console.error('Índice de producto inválido.');
        return;
    }
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        productos.splice(index, 1);
        try {
            localStorage.setItem('productos', JSON.stringify(productos));
            alert('Producto eliminado correctamente.');
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            alert('Error al eliminar el producto.');
        }
        mostrarProductos();
    }
}

// Función para importar datos desde un archivo Excel
function importarExcel() {
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = '.xlsx, .xls';
    inputFile.onchange = async function () {
        const file = inputFile.files[0];
        if (!file) {
            mostrarMensajeTabla && mostrarMensajeTabla('error', 'No se seleccionó ningún archivo.');
            return;
        }
        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                jsonData.forEach(item => {
                    let imagen = item.Imagen || IMAGEN_DEFAULT;
                    if (!imagen || typeof imagen !== 'string' || imagen.trim() === '' || imagen.includes('via.placeholder.com/50')) {
                        imagen = IMAGEN_DEFAULT;
                    }
                    const producto = {
                        codigo: item.Código || '',
                        nombre: item.Nombre || '',
                        costo: item.Costo || 0,
                        precio: item.Precio || 0,
                        fechaCaducidad: item['Fecha de Caducidad'] || '',
                        fechaRegistro: item['Fecha de Registro'] || new Date().toLocaleString('es-ES'),
                        categoria: item.Categoría || '',
                        imagen
                    };
                    productos.push(producto);
                });

                localStorage.setItem('productos', JSON.stringify(productos));
                mostrarProductos();
                mostrarMensajeTabla && mostrarMensajeTabla('exito', 'Datos importados correctamente desde Excel.');
            } catch (error) {
                console.error('Error al importar Excel:', error);
                mostrarMensajeTabla && mostrarMensajeTabla('error', 'No se pudo importar el archivo Excel.');
            }
        };
        reader.readAsArrayBuffer(file);
    };
    inputFile.click();
}

// Función para exportar la tabla de productos a un archivo Excel
function exportarExcel() {
    if (productos.length === 0) {
        alert('No hay productos para exportar.');
        return;
    }

    try {
        // Crear una hoja de cálculo a partir de los datos de los productos
        const worksheet = XLSX.utils.json_to_sheet(productos.map(producto => ({
            Código: truncarTexto(producto.codigo || 'N/A'),
            Nombre: truncarTexto(producto.nombre || 'N/A'),
            Costo: producto.costo || 0,
            Precio: producto.precio || 0,
            'Fecha de Caducidad': truncarTexto(producto.fechaCaducidad || 'N/A'),
            'Fecha de Registro': truncarTexto(producto.fechaRegistro || 'N/A'),
            Categoría: truncarTexto(producto.categoria || 'N/A'),
            Imagen: truncarTexto(producto.imagen || 'N/A')
        })));

        // Crear un libro de trabajo y agregar la hoja de cálculo
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

        // Descargar el archivo Excel
        XLSX.writeFile(workbook, 'productos.xlsx');
        alert('Archivo Excel exportado correctamente.');
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
        alert('Ocurrió un error al intentar exportar el archivo Excel.');
    }
}

// Función para truncar texto a 32767 caracteres (límite de Excel)
function truncarTexto(texto) {
    const LIMITE_EXCEL = 32767;
    return texto.length > LIMITE_EXCEL ? texto.substring(0, LIMITE_EXCEL) : texto;
}

// Función para importar datos desde un archivo PDF
function importarPDF() {
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = '.pdf';
    inputFile.onchange = async function () {
        const file = inputFile.files[0];
        if (!file) {
            alert('No se seleccionó ningún archivo.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const pdfData = e.target.result;
            // Aquí puedes procesar el contenido del PDF si es necesario
            alert('Archivo PDF cargado correctamente. Procesamiento pendiente.');
        };
        reader.readAsArrayBuffer(file);
    };
    inputFile.click();
}

// Función para exportar la tabla de productos a un archivo PDF
function exportarPDF() {
    if (productos.length === 0) {
        alert('No hay productos para exportar.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const encabezados = [
        ['Código', 'Nombre', 'Costo', 'Precio', 'Fecha de Caducidad', 'Fecha de Registro', 'Categoría']
    ];

    const datos = productos.map(producto => [
        producto.codigo,
        producto.nombre,
        producto.costo,
        producto.precio,
        producto.fechaCaducidad,
        producto.fechaRegistro,
        producto.categoria
    ]);

    doc.text('Productos Registrados', 14, 10);
    doc.autoTable({
        head: encabezados,
        body: datos,
        startY: 20,
        theme: 'grid',
        headStyles: { fillColor: [76, 175, 80] }
    });

    doc.save('productos.pdf');
    alert('Archivo PDF exportado correctamente.');
}

// --- INTEGRACIÓN CON API PHP (MySQL) ---

// Registrar producto
async function registrarProductoAPI(producto) {
    const res = await fetch('api/productos.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto)
    });
    return await res.json();
}

// Editar producto
async function editarProductoAPI(id, producto) {
    const res = await fetch('api/productos.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...producto })
    });
    return await res.json();
}

// Eliminar producto
async function eliminarProductoAPI(id) {
    const res = await fetch('api/productos.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    return await res.json();
}

// Obtener productos
async function obtenerProductosAPI() {
    const res = await fetch('api/productos.php');
    return await res.json();
}

// --- INTEGRACIÓN CATEGORÍAS DESDE API ---
async function cargarCategoriasDesdeAPI() {
    try {
        const res = await fetch('api/categorias.php');
        const data = await res.json();
        if (Array.isArray(data)) {
            categorias = data.map(cat => cat.nombre);
            // Actualizar select de categorías en el formulario de productos
            const selectCategoria = document.getElementById('categoria-producto');
            if (selectCategoria) {
                const valorActual = selectCategoria.value;
                selectCategoria.innerHTML = '<option value="" disabled selected>Seleccione una categoría...</option>' +
                    categorias.map(cat => `<option value="${cat}">${cat}</option>`).join('');
                if (categorias.includes(valorActual)) selectCategoria.value = valorActual;
            }
            // Si hay tabla de categorías, actualiza también
            if (typeof mostrarCategorias === 'function') mostrarCategorias();
        } else {
            showDialog && showDialog({ titulo: 'Error', mensaje: 'No se pudieron cargar las categorías.', icono: '<i class="fas fa-times-circle" style="color:#db4437;"></i>', botones: [{ texto: 'Cerrar', tipo: 'default', accion: null }] });
        }
    } catch (e) {
        showDialog && showDialog({ titulo: 'Error de red', mensaje: 'No se pudo conectar con la API de categorías.', icono: '<i class="fas fa-times-circle" style="color:#db4437;"></i>', botones: [{ texto: 'Cerrar', tipo: 'default', accion: null }] });
    }
}

// Llama a la función al cargar la página
window.addEventListener('DOMContentLoaded', cargarCategoriasDesdeAPI);

// Sobrescribir agregarProducto para usar API
async function agregarProducto() {
    const codigo = document.getElementById('codigo-producto').value.trim();
    const nombre = document.getElementById('nombre-producto').value.trim();
    const costo = parseFloat(document.getElementById('costo-producto').value.trim());
    const precio = parseFloat(document.getElementById('precio-producto').value.trim());
    const fechaCaducidad = document.getElementById('fecha-caducidad-producto').value.trim();
    const categoria = document.getElementById('categoria-producto').value.trim();
    const imagenInput = document.getElementById('imagen-producto');
    let imagen = '';
    if (imagenInput && imagenInput.files.length > 0) {
        const file = imagenInput.files[0];
        imagen = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }
    if (!codigo || !nombre || isNaN(costo) || isNaN(precio) || !fechaCaducidad || !categoria) {
        showDialog({ titulo: 'Error', mensaje: 'Completa todos los campos.', icono: '<i class="fas fa-times-circle" style="color:#db4437;"></i>', botones: [{ texto: 'Cerrar', tipo: 'default', accion: null }] });
        return;
    }
    const producto = { codigo, nombre, costo, precio, fechaCaducidad, categoria, imagen };
    const res = await registrarProductoAPI(producto);
    if (res.success) {
        mostrarMensajeTabla && mostrarMensajeTabla('exito', 'Producto registrado correctamente.');
        mostrarProductosDesdeAPI();
    } else {
        showDialog({ titulo: 'Error', mensaje: 'No se pudo registrar el producto: ' + (res.error || ''), icono: '<i class="fas fa-times-circle" style="color:#db4437;"></i>', botones: [{ texto: 'Cerrar', tipo: 'default', accion: null }] });
    }
}

// Mostrar productos desde la API
async function mostrarProductosDesdeAPI() {
    const lista = await obtenerProductosAPI();
    productos = Array.isArray(lista) ? lista : [];
    mostrarProductos(productos);
}

// Sobrescribir eliminarProducto para usar API
window.eliminarProducto = async function(index) {
    const id = productos[index].id;
    if (!id) return;
    showDialog({
        titulo: 'Eliminar producto',
        mensaje: '¿Seguro que deseas eliminar este producto?',
        icono: '<i class="fas fa-trash-alt" style="color:#ff6f61;"></i>',
        botones: [
            { texto: 'Cancelar', tipo: 'default', accion: null },
            { texto: 'Eliminar', tipo: 'danger', accion: async () => {
                const res = await eliminarProductoAPI(id);
                if (res.success) {
                    mostrarMensajeTabla && mostrarMensajeTabla('exito', 'Producto eliminado correctamente.');
                    mostrarProductosDesdeAPI();
                } else {
                    showDialog({ titulo: 'Error', mensaje: 'No se pudo eliminar el producto: ' + (res.error || ''), icono: '<i class="fas fa-times-circle" style="color:#db4437;"></i>', botones: [{ texto: 'Cerrar', tipo: 'default', accion: null }] });
                }
            }}
        ]
    });
};

// Sobrescribir guardarCambios para usar API
window.guardarCambios = async function(index) {
    const id = productos[index].id;
    const codigo = document.getElementById(`edit-codigo-${index}`).value.trim();
    const nombre = document.getElementById(`edit-nombre-${index}`).value.trim();
    const costo = parseFloat(document.getElementById(`edit-costo-${index}`).value.trim());
    const precio = parseFloat(document.getElementById(`edit-precio-${index}`).value.trim());
    const fechaCaducidad = document.getElementById(`edit-fecha-${index}`).value.trim();
    const categoria = document.getElementById(`edit-categoria-${index}`).value.trim();
    const imagenInput = document.getElementById(`edit-imagen-${index}`);
    let imagen = productos[index].imagen;
    if (imagenInput && imagenInput.files.length > 0) {
        const file = imagenInput.files[0];
        imagen = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }
    if (!codigo || !nombre || isNaN(costo) || isNaN(precio) || !fechaCaducidad || !categoria) {
        showDialog({ titulo: 'Error', mensaje: 'Completa todos los campos.', icono: '<i class=\'fas fa-times-circle\' style=\'color:#db4437;\'></i>', botones: [{ texto: 'Cerrar', tipo: 'default', accion: null }] });
        return;
    }
    const producto = { codigo, nombre, costo, precio, fechaCaducidad, categoria, imagen };
    const res = await editarProductoAPI(id, producto);
    if (res.success) {
        mostrarMensajeTabla && mostrarMensajeTabla('exito', 'Producto actualizado correctamente.');
        mostrarProductosDesdeAPI();
    } else {
        showDialog({ titulo: 'Error', mensaje: 'No se pudo actualizar el producto: ' + (res.error || ''), icono: '<i class=\'fas fa-times-circle\' style=\'color:#db4437;\'></i>', botones: [{ texto: 'Cerrar', tipo: 'default', accion: null }] });
    }
};

// Al cargar la página, mostrar productos desde la base de datos
window.addEventListener('DOMContentLoaded', mostrarProductosDesdeAPI);

// Función genérica para mostrar u ocultar secciones
function toggleSeccion(idSeccion, idBoton, textoMostrar, textoOcultar) {
    const seccion = document.getElementById(idSeccion);
    const boton = document.getElementById(idBoton);
    if (!seccion || !boton) {
        console.error(`Elemento "${idSeccion}" o "${idBoton}" no encontrado.`);
        return;
    }

    if (seccion.style.display === 'none' || seccion.style.display === '') {
        seccion.style.display = 'block';
        boton.textContent = textoOcultar;
    } else {
        seccion.style.display = 'none';
        boton.textContent = textoMostrar;
    }
}

// Aplicar la funcionalidad genérica a botones específicos
function toggleFiltros() {
    toggleSeccion('filtros-contenedor', 'btn-toggle-filtros', 'Mostrar Filtros', 'Ocultar Filtros');
}

function toggleRegistroCategorias() {
    toggleSeccion('registro-categorias-contenedor', 'btn-toggle-categorias', 'Mostrar Categorías', 'Ocultar Categorías');
}

function toggleTablaEjemplo() {
    toggleSeccion('tabla-ejemplo', 'btn-tabla-ejemplo', 'Mostrar Tabla de Ejemplo', 'Ocultar Tabla de Ejemplo');
}

// Función para mostrar el cuadro de diálogo futurista
function mostrarDialogoFuturista(mensaje) {
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'dialog-overlay';
    dialogOverlay.innerHTML = `
        <div class="dialog-box futurista">
            <h2><i class="fas fa-check-circle"></i> ¡Mensaje Enviado!</h2>
            <p>${mensaje}</p>
            <button class="btn" onclick="cerrarDialogoFuturista()">Cerrar</button>
        </div>
    `;
    document.body.appendChild(dialogOverlay);
    dialogOverlay.style.display = 'flex';
}

// Función para cerrar el cuadro de diálogo futurista
function cerrarDialogoFuturista() {
    const dialogOverlay = document.querySelector('.dialog-overlay');
    if (dialogOverlay) {
        dialogOverlay.remove();
    }
}

// Función para manejar el envío del formulario de contacto
document.getElementById('contact-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre-contacto').value.trim();
    const correo = document.getElementById('correo-contacto').value.trim();
    const telefono = document.getElementById('telefono-contacto').value.trim();
    const mensaje = document.getElementById('mensaje-contacto').value.trim();

    if (!nombre || !correo || !mensaje) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
    }

    // Mostrar cuadro de diálogo futurista
    mostrarDialogoFuturista(`Gracias, ${nombre}. Hemos recibido su mensaje y nos pondremos en contacto pronto.`);
    document.getElementById('contact-form').reset();
});

// --- CALCULADORA DIGITAL Y AI ENHANCEMENTS (Centralizado) ---
window.calcValue = window.calcValue || '';
window.calcHistoryArr = window.calcHistoryArr || [];

// Define las funciones globalmente para evitar errores de referencia
window.calcPress = function(val) {
  const display = document.getElementById('calcDisplay');
  if (!display) return;
  if (display.value === 'Error') window.calcClear();
  if (val === '.' && window.calcValue.endsWith('.')) return;
  window.calcValue += val;
  display.value = window.calcValue;
};

window.calcEquals = function() {
  const display = document.getElementById('calcDisplay');
  if (!display) return;
  try {
    let expr = window.calcValue.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');
    let result = eval(expr.replace('%', '/100'));
    if (result === undefined || isNaN(result)) throw new Error();
    window.agregarHistorial(window.calcValue + ' = ' + result);
    display.value = result;
    window.calcValue = result.toString();
    window.mostrarHistorial();
  } catch {
    display.value = 'Error';
    window.calcValue = '';
  }
};

window.calcClear = function() {
  window.calcValue = '';
  const display = document.getElementById('calcDisplay');
  if (display) display.value = '';
};

window.calcOperation = function(op) {
  const display = document.getElementById('calcDisplay');
  if (!display) return;
  let val = parseFloat(window.calcValue);
  if (isNaN(val)) return;
  let result = val;
  let opStr = '';
  switch (op) {
    case 'sqrt':
      result = Math.sqrt(val);
      opStr = `√(${val}) = ${result}`;
      break;
    case 'pow2':
      result = Math.pow(val, 2);
      opStr = `${val}² = ${result}`;
      break;
    case 'inv':
      result = 1 / val;
      opStr = `1/(${val}) = ${result}`;
      break;
    case 'perc':
      result = val / 100;
      opStr = `${val}% = ${result}`;
      break;
  }
  display.value = result;
  window.calcValue = result.toString();
  window.agregarHistorial(opStr);
  window.mostrarHistorial();
};

window.copiarResultado = function() {
  const display = document.getElementById('calcDisplay');
  if (!display) return;
  const val = display.value;
  if (!val || val === 'Error') return;
  navigator.clipboard.writeText(val);
  alert('Resultado copiado al portapapeles');
};

window.agregarHistorial = function(entry) {
  window.calcHistoryArr.push(entry);
  if (window.calcHistoryArr.length > 5) window.calcHistoryArr.shift();
};

window.mostrarHistorial = function() {
  const histDiv = document.getElementById('calcHistory');
  if (!histDiv) return;
  if (window.calcHistoryArr.length === 0) {
    histDiv.style.display = 'none';
    return;
  }
  histDiv.style.display = 'block';
  histDiv.innerHTML = '<div class="calculator-history-title">Historial</div>' + window.calcHistoryArr.map(e => `<div>${e}</div>`).join('');
};

window.toggleCalculator = function() {
  let modal = document.getElementById('calculatorModal');
  let overlay = document.getElementById('calcOverlay');
  if (!modal) {
    // Overlay para cerrar al hacer clic fuera
    overlay = document.createElement('div');
    overlay.id = 'calcOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.zIndex = 10999;
    overlay.style.background = 'rgba(0,0,0,0.08)';
    overlay.onclick = function(e) {
      if (e.target === overlay) window.toggleCalculator();
    };
    document.body.appendChild(overlay);

    // Modal calculadora con diseño moderno y colores destacados
    modal = document.createElement('div');
    modal.id = 'calculatorModal';
    modal.className = 'calculator-modal calculator-anim-in active';
    modal.tabIndex = -1;
    modal.innerHTML = `
      <button class="calculator-close" onclick="toggleCalculator()" title="Cerrar calculadora">&times;</button>
      <div style="display:flex;align-items:center;justify-content:center;margin-bottom:8px;">
        <svg width="38" height="38" viewBox="0 0 54 54" fill="none" style="display:block;" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="8" width="38" height="38" rx="9" fill="#fff" stroke="#ff9800" stroke-width="2.5"/>
          <rect x="16" y="14" width="22" height="7" rx="2.5" fill="#ff9800" opacity="0.85"/>
          <rect x="16" y="14" width="22" height="7" rx="2.5" fill="none" stroke="#ff9800" stroke-width="1"/>
          <circle cx="20" cy="29" r="2.5" fill="#ff9800"/>
          <circle cx="27" cy="29" r="2.5" fill="#ff9800"/>
          <circle cx="34" cy="29" r="2.5" fill="#ff9800"/>
          <circle cx="20" cy="36" r="2.5" fill="#ff9800"/>
          <circle cx="27" cy="36" r="2.5" fill="#ff9800"/>
          <circle cx="34" cy="36" r="2.5" fill="#ff9800"/>
          <rect x="23" y="20" width="8" height="2" rx="1" fill="#fff"/>
        </svg>
        <h3 style="margin:0 0 0 10px;font-size:1.18rem;color:#ff9800;letter-spacing:1px;">Calculadora</h3>
      </div>
      <div class="calculator-history" id="calcHistory" style="display:none;"></div>
      <input type="text" id="calcDisplay" class="calculator-display" readonly tabindex="-1" aria-label="Pantalla de calculadora">
      <button class="copy-result-btn" onclick="copiarResultado()">Copiar resultado</button>
      <div class="calculator-keys" style="margin-top:14px;">
        <button onclick="calcClear()" class="key-clear" style="grid-area: clear;">C</button>
        <button onclick="calcOperation('perc')" class="key-op" title="Porcentaje" style="grid-area: perc;">%</button>
        <button onclick="calcOperation('sqrt')" class="key-op" title="Raíz cuadrada" style="grid-area: sqrt;">√</button>
        <button onclick="calcPress('7')" value="7" style="grid-area: seven;">7</button>
        <button onclick="calcPress('8')" value="8" style="grid-area: eight;">8</button>
        <button onclick="calcPress('9')" value="9" style="grid-area: nine;">9</button>
        <button onclick="calcPress('/')" class="key-op" value="/" style="grid-area: div;">÷</button>
        <button onclick="calcPress('4')" value="4" style="grid-area: four;">4</button>
        <button onclick="calcPress('5')" value="5" style="grid-area: five;">5</button>
        <button onclick="calcPress('6')" value="6" style="grid-area: six;">6</button>
        <button onclick="calcPress('*')" class="key-op" value="*" style="grid-area: mul;">×</button>
        <button onclick="calcPress('1')" value="1" style="grid-area: one;">1</button>
        <button onclick="calcPress('2')" value="2" style="grid-area: two;">2</button>
        <button onclick="calcPress('3')" value="3" style="grid-area: three;">3</button>
        <button onclick="calcPress('-')" class="key-op" value="-" style="grid-area: sub;">−</button>
        <button onclick="calcPress('0')" value="0" style="grid-area: zero;">0</button>
        <button onclick="calcPress('.')">.</button>
        <button onclick="calcPress('+')" class="key-op" value="+" style="grid-area: add;">+</button>
        <button onclick="calcEquals()" class="key-equals" style="grid-area: equals;">=</button>
      </div>
    `;
    // Posiciona la calculadora en la esquina inferior derecha, con diseño moderno
    Object.assign(modal.style, {
      position: 'fixed',
      right: '40px',
      bottom: '100px',
      left: 'auto',
      top: 'auto',
      transform: 'none',
      minWidth: '340px',
      maxWidth: '98vw',
      maxHeight: '98vh',
      overflow: 'visible',
      zIndex: 11000,
      boxShadow: '0 12px 48px #ffb74d55, 0 2px 16px #ff980044',
      padding: '28px 22px 18px 22px',
      borderRadius: '22px',
      border: '3px solid #ff9800',
      background: 'linear-gradient(135deg, #fffbe6 0%, #ffe0c3 100%)'
    });
    // Responsive para móviles
    if (window.innerWidth < 600) {
      modal.style.right = '8px';
      modal.style.bottom = '70px';
      modal.style.minWidth = '95vw';
      modal.style.padding = '10px 2vw 10px 2vw';
    }
    document.body.appendChild(modal);
    setTimeout(() => { modal.classList.add('active'); }, 10);
    setTimeout(() => { document.getElementById('calcDisplay')?.focus(); }, 100);
  } else {
    modal.classList.remove('active');
    modal.classList.add('calculator-anim-out');
    setTimeout(() => {
      modal.remove();
      const overlay = document.getElementById('calcOverlay');
      if (overlay) overlay.remove();
      if (typeof window.calcClear === 'function') window.calcClear();
    }, 250);
  }
};

// Animaciones CSS para calculadora
(function() {
  const style = document.createElement('style');
  style.innerHTML = `
    .calculator-modal.calculator-anim-in { animation: calcFadeIn .25s cubic-bezier(.4,2,.6,1); }
    .calculator-modal.calculator-anim-out { animation: calcFadeOut .22s cubic-bezier(.4,2,.6,1); }
    @keyframes calcFadeIn { from { opacity:0; transform:scale(0.92) translate(-50%,-50%);} to { opacity:1; transform:scale(1) translate(-50%,-50%);} }
    @keyframes calcFadeOut { from { opacity:1; transform:scale(1) translate(-50%,-50%);} to { opacity:0; transform:scale(0.92) translate(-50%,-50%);} }
    .calculator-modal .calculator-close {
      position: absolute; top: 10px; right: 16px; background: none; border: none; color: #ff6f61; font-size: 1.7rem; cursor: pointer; z-index: 2;
      transition: color 0.2s;
    }
    .calculator-modal .calculator-close:hover { color: #db4437; }
    .calculator-modal h3 { margin-top: 0; margin-bottom: 18px; font-size: 1.25rem; color: #ff9800; text-align: center; }
    .calculator-modal .calculator-keys { margin-top: 18px; }
  `;
  document.head.appendChild(style);
})();

// Cargar productos y categorías al iniciar
window.onload = function () {
    mostrarProductos();
    mostrarCategorias();
};

// Función para mostrar mensajes en la interfaz (éxito/error)
function mostrarMensajeTabla(tipo, mensaje) {
    const mensajeDiv = document.getElementById('tabla-mensaje');
    if (!mensajeDiv) return;
    mensajeDiv.textContent = mensaje;
    mensajeDiv.style.display = 'block';
    mensajeDiv.style.background = tipo === 'exito' ? '#43cea2' : '#db4437';
    mensajeDiv.style.color = '#fff';
    mensajeDiv.style.padding = '10px 18px';
    mensajeDiv.style.margin = '12px 0';
    mensajeDiv.style.borderRadius = '8px';
    mensajeDiv.style.fontWeight = 'bold';
    setTimeout(() => {
        mensajeDiv.style.display = 'none';
    }, 3200);
}

// --- NUEVAS FUNCIONES Y MEJORAS AI ---

// Función para mostrar el modal de confirmación visual tras eliminar todo el inventario
function mostrarModalEliminacionTodo() {
    const modal = document.getElementById('modal-eliminacion-todo');
    if (modal) {
        modal.style.display = 'flex';
        const cerrar = document.getElementById('cerrar-modal-eliminacion-todo');
        if (cerrar) {
            cerrar.onclick = () => { modal.style.display = 'none'; };
        }
        // Cerrar con click fuera del cuadro
        modal.onclick = function(e) {
            if (e.target === modal) modal.style.display = 'none';
        };
    }
}

/**
 * Muestra un cuadro de diálogo elegante y reutilizable
 * @param {Object} opts - Opciones del diálogo
 * @param {string} opts.titulo - Título del cuadro
 * @param {string} opts.mensaje - Mensaje a mostrar
 * @param {string} [opts.icono] - HTML de ícono (ej: '<i class="fas fa-exclamation-triangle"></i>')
 * @param {boolean} [opts.input] - Si debe mostrar input de texto
 * @param {string} [opts.inputPlaceholder] - Placeholder del input
 * @param {string} [opts.inputType] - Tipo de input
 * @param {string} [opts.valorConfirmacion] - Valor que debe escribir el usuario para confirmar
 * @param {Array} opts.botones - [{texto, tipo, accion}]
 */
function showDialog(opts) {
    const modal = document.getElementById('modal-dialogo');
    const content = document.getElementById('modal-dialogo-content');
    const icono = document.getElementById('modal-dialogo-icono');
    const titulo = document.getElementById('modal-dialogo-titulo');
    const mensaje = document.getElementById('modal-dialogo-mensaje');
    const inputContainer = document.getElementById('modal-dialogo-input-container');
    const input = document.getElementById('modal-dialogo-input');
    const botones = document.getElementById('modal-dialogo-botones');
    const cerrar = document.getElementById('cerrar-modal-dialogo');
    if (!modal || !content) return;
    icono.innerHTML = opts.icono || '';
    titulo.textContent = opts.titulo || '';
    mensaje.innerHTML = opts.mensaje || '';
    if (opts.input) {
        inputContainer.style.display = 'flex';
        input.value = '';
        input.type = opts.inputType || 'text';
        input.placeholder = opts.inputPlaceholder || '';
    } else {
        inputContainer.style.display = 'none';
    }
    botones.innerHTML = '';
    (opts.botones || []).forEach(btn => {
        const b = document.createElement('button');
        b.textContent = btn.texto;
        b.className = btn.tipo === 'danger' ? 'btn-eliminar' : (btn.tipo === 'success' ? 'btn-guardar' : 'btn-aplicar');
        b.onclick = () => {
            if (opts.input && opts.valorConfirmacion && input.value.trim().toLowerCase() !== opts.valorConfirmacion.toLowerCase()) {
                input.style.borderColor = '#db4437';
                input.focus();
                return;
            }
            modal.style.display = 'none';
            if (btn.accion) btn.accion(input.value);
        };
        botones.appendChild(b);
    });
    cerrar.onclick = () => { modal.style.display = 'none'; };
    modal.style.display = 'flex';
    setTimeout(() => { if (opts.input) input.focus(); }, 200);
    // Cerrar con click fuera del cuadro
    modal.onclick = function(e) {
        if (e.target === modal) modal.style.display = 'none';
    };
}

// Reemplazar confirmación de eliminación masiva por showDialog
function confirmarEliminarTodo() {
    showDialog({
        titulo: 'Eliminar TODO el Inventario',
        mensaje: '¿Seguro que deseas eliminar <b>TODOS</b> los productos? Esta acción no se puede deshacer.<br>Escribe <b>SI</b> para confirmar.',
        icono: '<i class="fas fa-exclamation-triangle" style="color:#ff6f61;"></i>',
        input: true,
        inputPlaceholder: 'Escribe SI para confirmar',
        valorConfirmacion: 'si',
        botones: [
            { texto: 'Cancelar', tipo: 'default', accion: null },
            { texto: 'Eliminar Todo', tipo: 'danger', accion: () => {
                fetch('api/productos.php', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ all: true })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        productos = [];
                        localStorage.setItem('productos', JSON.stringify(productos));
                        mostrarProductos();
                        showDialog({
                            titulo: '¡Inventario eliminado!',
                            mensaje: 'Todos los productos han sido eliminados correctamente.<br>Esta acción no se puede deshacer.',
                            icono: '<i class="fas fa-check-circle" style="color:#43cea2;"></i>',
                            botones: [{ texto: 'Cerrar', tipo: 'success', accion: null }]
                        });
                    } else {
                        showDialog({
                            titulo: 'Error',
                            mensaje: 'Error al eliminar en la base de datos: ' + (data.error || ''),
                            icono: '<i class="fas fa-times-circle" style="color:#db4437;"></i>',
                            botones: [{ texto: 'Cerrar', tipo: 'default', accion: null }]
                        });
                    }
                })
                .catch(err => {
                    showDialog({
                        titulo: 'Error de red',
                        mensaje: 'No se pudo conectar con la base de datos.',
                        icono: '<i class="fas fa-times-circle" style="color:#db4437;"></i>',
                        botones: [{ texto: 'Cerrar', tipo: 'default', accion: null }]
                    });
                });
            }}
        ]
    });
}

// Asegura que todas las funciones estén en window para los botones HTML
window.importarExcel = importarExcel;
window.exportarExcel = exportarExcel;
window.importarPDF = importarPDF;
window.exportarPDF = exportarPDF;
window.toggleTablaEjemplo = toggleTablaEjemplo;
window.toggleRegistroCategorias = toggleRegistroCategorias;
window.toggleFiltros = toggleFiltros;
window.agregarCategoria = agregarCategoria;
window.editarCategoria = editarCategoria;
window.eliminarCategoria = eliminarCategoria;
window.agregarProducto = agregarProducto;
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
window.guardarCambios = guardarCambios;
window.cancelarEdicionFila = cancelarEdicionFila;
window.limpiarBusqueda = limpiarBusqueda;
window.filtrarProductos = filtrarProductos;
window.toggleCalculator = toggleCalculator;
window.copiarResultado = copiarResultado;
window.toggleAIEnhancements = toggleAIEnhancements;
window.confirmarEliminarTodo = confirmarEliminarTodo;

// Corrige el botón de mostrar tabla de ejemplo
function toggleTablaEjemplo() {
    toggleSeccion('tabla-ejemplo', 'btn-tabla-ejemplo', 'Mostrar Tabla de Ejemplo', 'Ocultar Tabla de Ejemplo');
}

// Corrige el botón de mostrar categorías
function toggleRegistroCategorias() {
    toggleSeccion('registro-categorias-contenedor', 'btn-toggle-categorias', 'Mostrar Categorías', 'Ocultar Categorías');
}

// Corrige el botón de mostrar filtros
function toggleFiltros() {
    toggleSeccion('filtros-contenedor', 'btn-toggle-filtros', 'Mostrar Filtros', 'Ocultar Filtros');
}

// Corrige el botón de limpiar filtros
function limpiarBusqueda() {
    const nombre = document.getElementById('filtro-nombre');
    const categoria = document.getElementById('filtro-categoria');
    const existencia = document.getElementById('filtro-existencia');
    const orden = document.getElementById('orden-productos');
    if (nombre) nombre.value = '';
    if (categoria) categoria.value = '';
    if (existencia) existencia.value = '';
    if (orden) orden.selectedIndex = 0;
    filtrarProductos();
}

// Corrige el botón de aplicar filtros
function filtrarProductos() {
    let lista = productos.slice();
    const nombre = document.getElementById('filtro-nombre')?.value.trim().toLowerCase() || '';
    const categoria = document.getElementById('filtro-categoria')?.value.trim().toLowerCase() || '';
    const existencia = parseFloat(document.getElementById('filtro-existencia')?.value.trim());
    const orden = document.getElementById('orden-productos')?.value || '';

    if (nombre) {
        lista = lista.filter(p => (p.nombre || '').toLowerCase().includes(nombre));
    }
    if (categoria) {
        lista = lista.filter(p => (p.categoria || '').toLowerCase().includes(categoria));
    }
    if (!isNaN(existencia)) {
        lista = lista.filter(p => parseFloat(p.costo || 0) >= existencia); // Ajusta según campo real de existencia
    }

    switch (orden) {
        case 'nombre-asc':
            lista.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
            break;
        case 'nombre-desc':
            lista.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
            break;
        case 'existencia-asc':
            lista.sort((a, b) => (parseFloat(a.costo || 0)) - (parseFloat(b.costo || 0)));
            break;
        case 'existencia-desc':
            lista.sort((a, b) => (parseFloat(b.costo || 0)) - (parseFloat(a.costo || 0)));
            break;
        case 'fecha-registro':
            lista.sort((a, b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro));
            break;
        case 'fecha-caducidad':
            lista.sort((a, b) => new Date(a.fechaCaducidad) - new Date(b.fechaCaducidad));
            break;
    }

    mostrarProductos(lista);
}

// Corrige el botón de agregar categoría
window.agregarCategoria = function() {
    const nuevaCategoriaInput = document.getElementById('nueva-categoria');
    if (!nuevaCategoriaInput) {
        mostrarMensajeTabla('error', 'Campo de nueva categoría no encontrado.');
        return;
    }
    const nuevaCategoria = nuevaCategoriaInput.value.trim();
    if (!nuevaCategoria || categorias.includes(nuevaCategoria)) {
        mostrarMensajeTabla('error', 'Por favor, ingrese una categoría válida o que no exista.');
        return;
    }
    categorias.push(nuevaCategoria);
    localStorage.setItem('categorias', JSON.stringify(categorias));
    mostrarCategorias();
    nuevaCategoriaInput.value = '';
    mostrarMensajeTabla('exito', 'Categoría agregada correctamente.');
};

// Corrige los botones de editar y eliminar categoría
window.editarCategoria = function(index) {
    const nuevaCategoria = prompt('Ingrese el nuevo nombre de la categoría:', categorias[index]);
    if (nuevaCategoria && nuevaCategoria.trim() !== '') {
        categorias[index] = nuevaCategoria.trim();
        localStorage.setItem('categorias', JSON.stringify(categorias));
        mostrarCategorias();
        mostrarMensajeTabla('exito', 'Categoría editada correctamente.');
    }
};
window.eliminarCategoria = function(index) {
    if (confirm('¿Está seguro de que desea eliminar esta categoría?')) {
        categorias.splice(index, 1);
        localStorage.setItem('categorias', JSON.stringify(categorias));
        mostrarCategorias();
        mostrarMensajeTabla('exito', 'Categoría eliminada correctamente.');
    }
};

// Corrige el botón de agregar producto
window.agregarProducto = agregarProducto;

// Corrige los botones de editar/eliminar producto
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;

// Corrige los botones de guardar/cancelar edición de producto
window.guardarCambios = guardarCambios;
window.cancelarEdicionFila = cancelarEdicionFila;

// Corrige el botón de copiar resultado de la calculadora
window.copiarResultado = copiarResultado;

// Corrige el botón de mostrar perfil (si aplica)
window.mostrarPerfil = window.mostrarPerfil || function() {};
window.cerrarPerfil = window.cerrarPerfil || function() {};
window.cerrarSesion = window.cerrarSesion || function() {};

// Función para activar/desactivar mejoras AI
function toggleAIEnhancements() {
  const body = document.body;
  const aiBtn = document.querySelector('.fab-ai');
  const chatbot = document.getElementById('aiChatbot');
  body.classList.toggle('ai-enhanced');
  // Cambia a modo futurista con UX/UI mejorado
  if (body.classList.contains('ai-enhanced')) {
    aiBtn.classList.add('btn-anim-ai');
    aiBtn.style.boxShadow = '0 0 32px 8px #0fffc1, 0 0 16px 4px #7e0fff';
    aiBtn.style.background = 'linear-gradient(135deg,#0fffc1 0%,#7e0fff 100%)';
    aiBtn.style.filter = 'brightness(1.18) drop-shadow(0 0 24px #0fffc1)';
    setTimeout(() => aiBtn.classList.remove('btn-anim-ai'), 600);
    document.querySelectorAll('.main-header, .footer, .container, .section, .navbar, .contact-form-container, .table-container, .import-export, #tabla-ejemplo, .fab-btn, .fab-calc, #registro-productos, #formulario-inventario').forEach(el => {
      el.classList.add('ai-enhanced-section');
    });
    // No mostrar el asistente virtual automáticamente
    if (chatbot) chatbot.style.display = 'none';
  } else {
    aiBtn.style.boxShadow = '0 4px 16px #185a9d22';
    aiBtn.style.background = 'linear-gradient(135deg,#ff9800 0%,#43cea2 100%)';
    aiBtn.style.filter = 'drop-shadow(0 0 8px #ff9800) brightness(1.08)';
    document.querySelectorAll('.ai-enhanced-section').forEach(el => {
      el.classList.remove('ai-enhanced-section');
    });
    if (chatbot) chatbot.style.display = 'none';
  }
  if (aiBtn) {
    const label = aiBtn.querySelector('.ai-label');
    if (body.classList.contains('ai-enhanced')) {
      aiBtn.querySelector('i').className = 'fas fa-magic';
      if (label) label.textContent = 'Desactivar AI';
    } else {
      aiBtn.querySelector('i').className = 'fas fa-robot';
      if (label) label.textContent = 'Mejorar con AI';
    }
  }
}

// Mostrar/ocultar asistente virtual solo al oprimir el botón flotante del asistente virtual
window.toggleAIChat = function() {
  const chatbot = document.getElementById('aiChatbot');
  if (chatbot) {
    chatbot.style.display = chatbot.style.display === 'none' ? 'flex' : 'none';
    // Opcional: animación de entrada
    if (chatbot.style.display === 'flex') {
      chatbot.style.opacity = '0';
      chatbot.style.transform = 'translateY(30px) scale(0.97)';
      setTimeout(() => {
        chatbot.style.transition = 'opacity 0.35s, transform 0.35s';
        chatbot.style.opacity = '1';
        chatbot.style.transform = 'translateY(0) scale(1)';
      }, 10);
    } else {
      chatbot.style.transition = '';
      chatbot.style.opacity = '';
      chatbot.style.transform = '';
    }
  }
};

// Función para confirmar la eliminación de todos los productos
function confirmarEliminarTodo() {
    showDialog({
        titulo: 'Eliminar TODO el Inventario',
        mensaje: '¿Seguro que deseas eliminar <b>TODOS</b> los productos? Esta acción no se puede deshacer.<br>Escribe <b>SI</b> para confirmar.',
        icono: '<i class="fas fa-exclamation-triangle" style="color:#ff6f61;"></i>',
        input: true,
        inputPlaceholder: 'Escribe SI para confirmar',
        valorConfirmacion: 'si',
        botones: [
            { texto: 'Cancelar', tipo: 'default', accion: null },
            { texto: 'Eliminar Todo', tipo: 'danger', accion: () => {
                fetch('api/productos.php', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ all: true })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        productos = [];
                        localStorage.setItem('productos', JSON.stringify(productos));
                        mostrarProductos();
                        showDialog({
                            titulo: '¡Inventario eliminado!',
                            mensaje: 'Todos los productos han sido eliminados correctamente.<br>Esta acción no se puede deshacer.',
                            icono: '<i class="fas fa-check-circle" style="color:#43cea2;"></i>',
                            botones: [{ texto: 'Cerrar', tipo: 'success', accion: null }]
                        });
                    } else {
                        showDialog({
                            titulo: 'Error',
                            mensaje: 'Error al eliminar en la base de datos: ' + (data.error || ''),
                            icono: '<i class="fas fa-times-circle" style="color:#db4437;"></i>',
                            botones: [{ texto: 'Cerrar', tipo: 'default', accion: null }]
                        });
                    }
                })
                .catch(err => {
                    showDialog({
                        titulo: 'Error de red',
                        mensaje: 'No se pudo conectar con la base de datos.',
                        icono: '<i class="fas fa-times-circle" style="color:#db4437;"></i>',
                        botones: [{ texto: 'Cerrar', tipo: 'default', accion: null }]
                    });
                });
            }}
        ]
    });
}