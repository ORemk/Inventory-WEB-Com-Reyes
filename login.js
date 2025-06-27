function validarLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('login-error');
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    let usuarios = [];
    try {
        usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    } catch (e) { usuarios = []; }
    // Solo agrega admin si no existe
    if (!usuarios.some(u => u.email === 'admin@example.com')) {
        usuarios.push({ email: 'admin@example.com', password: 'password123', nombre: 'Administrador' });
    }
    const user = usuarios.find(u => u.email === email && u.password === password);
    if (user) {
        // Guardar sesión
        localStorage.setItem('sesion', JSON.stringify({ email: user.email, nombre: user.nombre || '' }));
        window.location.href = 'index.html#registro-productos';
    } else {
        errorDiv.textContent = 'Credenciales incorrectas. Intente nuevamente.';
        errorDiv.style.display = 'block';
    }
}

function mostrarRegistro() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('recover-form').style.display = 'none';
}

function mostrarLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('recover-form').style.display = 'none';
}

function mostrarRecuperar() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('recover-form').style.display = 'block';
}

function registrarCuenta(event) {
    event.preventDefault();
    const nombre = document.getElementById('reg-nombre').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const errorDiv = document.getElementById('register-error');
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    if (!nombre || !email || !password) {
        errorDiv.textContent = 'Todos los campos son obligatorios.';
        errorDiv.style.display = 'block';
        return;
    }
    let usuarios = [];
    try {
        usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    } catch (e) { usuarios = []; }
    if (usuarios.some(u => u.email === email)) {
        errorDiv.textContent = 'El correo ya está registrado.';
        errorDiv.style.display = 'block';
        return;
    }
    usuarios.push({ nombre, email, password });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    errorDiv.style.display = 'none';
    alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
    mostrarLogin();
}

function recuperarCuenta(event) {
    event.preventDefault();
    const email = document.getElementById('rec-email').value.trim();
    const errorDiv = document.getElementById('recover-error');
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    let usuarios = [];
    try {
        usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    } catch (e) { usuarios = []; }
    const user = usuarios.find(u => u.email === email);
    if (user) {
        alert('Tu contraseña es: ' + user.password);
        mostrarLogin();
    } else {
        errorDiv.textContent = 'No se encontró una cuenta con ese correo.';
        errorDiv.style.display = 'block';
    }
}

// Usar variables globales para evitar redefinición
window.calcValue = window.calcValue || '';
window.calcHistoryArr = window.calcHistoryArr || [];

window.toggleCalculator = function() {
  let modal = document.getElementById('calculatorModal');
  if (!modal) {
    // Si no existe el modal, lo crea dinámicamente
    modal = document.createElement('div');
    modal.id = 'calculatorModal';
    modal.className = 'calculator-modal active';
    modal.innerHTML = `
      <button class="calculator-close" onclick="toggleCalculator()" title="Cerrar calculadora">&times;</button>
      <h3>Calculadora</h3>
      <div class="calculator-history" id="calcHistory" style="display:none;"></div>
      <input type="text" id="calcDisplay" class="calculator-display" readonly tabindex="-1">
      <button class="copy-result-btn" onclick="copiarResultado()">Copiar resultado</button>
      <div class="calculator-keys">
        <button onclick="calcClear()" class="key-clear">C</button>
        <button onclick="calcOperation('perc')" class="key-op" title="Porcentaje">%</button>
        <button onclick="calcOperation('sqrt')" class="key-op" title="Raíz cuadrada">√</button>
        <button onclick="calcPress('7')" value="7">7</button>
        <button onclick="calcPress('8')" value="8">8</button>
        <button onclick="calcPress('9')" value="9">9</button>
        <button onclick="calcPress('/')" class="key-op" value="/">÷</button>
        <button onclick="calcPress('4')" value="4">4</button>
        <button onclick="calcPress('5')" value="5">5</button>
        <button onclick="calcPress('6')" value="6">6</button>
        <button onclick="calcPress('*')" class="key-op" value="*">×</button>
        <button onclick="calcPress('1')" value="1">1</button>
        <button onclick="calcPress('2')" value="2">2</button>
        <button onclick="calcPress('3')" value="3">3</button>
        <button onclick="calcPress('-')" class="key-op" value="-">−</button>
        <button onclick="calcPress('0')" value="0">0</button>
        <button onclick="calcPress('.')">.</button>
        <button onclick="calcPress('+')" class="key-op" value="+">+</button>
        <button onclick="calcEquals()" class="key-equals">=</button>
      </div>
    `;
    document.body.appendChild(modal);
  }
  if (modal.classList.contains('active')) {
    modal.classList.remove('active');
    modal.classList.add('closing');
    setTimeout(() => {
      modal.classList.remove('closing');
      window.calcClear && window.calcClear();
    }, 800);
  } else {
    modal.classList.add('active');
    modal.classList.remove('closing');
    const display = document.getElementById('calcDisplay');
    if (display) display.focus();
    window.mostrarHistorial && window.mostrarHistorial();
  }
};

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

window.copiarResultado = function() {
  const display = document.getElementById('calcDisplay');
  if (!display) return;
  const val = display.value;
  if (!val || val === 'Error') return;
  navigator.clipboard.writeText(val);
  alert('Resultado copiado al portapapeles');
}

// Botón AI mejorado: funcionalidad robusta y feedback en login y registro de productos
function toggleAIEnhancements() {
  const body = document.body;
  const aiBtn = document.querySelector('.fab-ai');
  body.classList.toggle('ai-enhanced');
  if (aiBtn) {
    aiBtn.classList.add('btn-anim-ai');
    aiBtn.style.boxShadow = body.classList.contains('ai-enhanced')
      ? '0 0 32px 8px #ff00ff, 0 0 16px 4px #00ffcc'
      : '0 4px 16px #185a9d22';
    aiBtn.style.background = body.classList.contains('ai-enhanced')
      ? 'linear-gradient(135deg,#ff00ff 0%,#00ffcc 100%)'
      : 'linear-gradient(135deg,#ff9800 0%,#43cea2 100%)';
    aiBtn.style.filter = body.classList.contains('ai-enhanced')
      ? 'brightness(1.2) drop-shadow(0 0 24px #ff00ff)'
      : 'drop-shadow(0 0 8px #ff9800) brightness(1.08)';
    setTimeout(() => aiBtn.classList.remove('btn-anim-ai'), 600);
  }
  document.querySelectorAll('.login-card, .main-header, .register-link, .social-login, .social-buttons, .btn-login, .btn-social, .register-link a, .login-container, .footer, .container, .section, .navbar, .contact-form-container, .table-container, .import-export, #tabla-ejemplo, .fab-btn, .fab-calc, #registro-productos, #formulario-inventario').forEach(el => {
    if (body.classList.contains('ai-enhanced')) {
      el.classList.add('ai-enhanced', 'ai-animate');
      el.style.animation = 'fadeIn 0.7s';
      el.style.filter = 'drop-shadow(0 0 16px #ff00ff88) brightness(1.08)';
    } else {
      el.classList.remove('ai-enhanced', 'ai-animate');
      el.style.animation = '';
      el.style.filter = '';
    }
  });
  if (aiBtn) {
    const label = aiBtn.querySelector('.ai-label');
    if (body.classList.contains('ai-enhanced')) {
      aiBtn.querySelector('i').className = 'fas fa-magic';
      if (label) label.textContent = 'Desactivar AI';
      // mostrarToast('Modo AI activado', 'success');
    } else {
      aiBtn.querySelector('i').className = 'fas fa-robot';
      if (label) label.textContent = 'Mejorar con AI';
      // mostrarToast('Modo AI desactivado', 'info');
    }
  }
}

document.addEventListener('keydown', function (e) {
  const modal = document.getElementById('calculatorModal');
  if (!modal || !modal.classList.contains('active')) return;
  if (e.key >= '0' && e.key <= '9') window.calcPress(e.key);
  if (e.key === '.') window.calcPress('.');
  if (e.key === '+' || e.key === '-') window.calcPress(e.key);
  if (e.key === '*' || e.key === 'x') window.calcPress('*');
  if (e.key === '/' || e.key === '÷') window.calcPress('/');
  if (e.key === 'Enter' || e.key === '=') window.calcEquals();
  if (e.key === 'c' || e.key === 'C') window.calcClear();
  if (e.key === 'Escape') toggleCalculator();
});

function socialLogin(provider) {
  let nombre = '', email = '', usuarios = [];
  try {
      usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  } catch (e) {
      usuarios = [];
  }
  switch (provider) {
      case 'google':
          nombre = 'Usuario Google';
          email = 'usuario.google@example.com';
          break;
      case 'facebook':
          nombre = 'Usuario Facebook';
          email = 'usuario.facebook@example.com';
          break;
      case 'twitter':
          nombre = 'Usuario Twitter';
          email = 'usuario.twitter@example.com';
          break;
      case 'instagram':
          nombre = 'Usuario Instagram';
          email = 'usuario.instagram@example.com';
          break;
  }
  let user = usuarios.find(u => u.email === email);
  if (!user) {
      usuarios.push({ nombre, email, password: provider + "123" });
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }
  localStorage.setItem('sesion', JSON.stringify({ email: email, nombre: nombre }));
  window.location.href = 'index.html#registro-productos';
}

function animarBoton(btn) {
  btn.classList.add('btn-anim');
  setTimeout(() => btn.classList.remove('btn-anim'), 350);
}

document.querySelectorAll('.btn-login, .btn-social').forEach(btn => {
  btn.addEventListener('mousedown', function () {
    animarBoton(this);
  });
});

function shakeInput(input) {
  input.classList.add('input-shake');
  setTimeout(() => input.classList.remove('input-shake'), 400);
}

// Mejora: feedback visual y accesibilidad en formularios
function mostrarErrorInput(input, mensaje) {
  input.setAttribute('aria-invalid', 'true');
  input.classList.add('input-shake');
  setTimeout(() => input.classList.remove('input-shake'), 400);
  if (mensaje) {
    let errorDiv = input.parentElement.querySelector('.input-error');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'input-error';
      input.parentElement.insertBefore(errorDiv, input.nextSibling);
    }
    errorDiv.textContent = mensaje;
  }
}
function limpiarErrorInput(input) {
  input.removeAttribute('aria-invalid');
  const errorDiv = input.parentElement.querySelector('.input-error');
  if (errorDiv) errorDiv.remove();
}

window.addEventListener('DOMContentLoaded', function () {
  const email = document.getElementById('email');
  if (email) email.focus();
});
