// ==========================================================================
// CONTROLADOR UNIFICADO - APLICACIÓN MULTI-PÁGINA (REFLECT)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // --- PERSISTENCIA GLOBAL DEL TEMA (Aplica en cualquier página) ---
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }

  // Detectamos en qué archivo HTML estamos parados actualmente
  const currentPage = window.location.pathname.split("/").pop();

  // Inicializar base de datos de usuarios si no existe
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
  }
  const getUsers = () => JSON.parse(localStorage.getItem("users"));
  const saveUsers = (users) =>
    localStorage.setItem("users", JSON.stringify(users));

  // ==========================================================================
  // LÓGICA EXCLUSIVA PARA: log_in.html
  // ==========================================================================
  if (currentPage === "log_in.html" || currentPage === "") {
    const loginSection = document.getElementById("login-section");
    const registerSection = document.getElementById("register-section");
    const recoverySection = document.getElementById("recovery-section");

    // Comprobar si ya hay una sesión activa, si es así, saltar directo a la Landing
    if (sessionStorage.getItem("currentUser")) {
      window.location.href = "Landing.html";
      return;
    }

    // Navegación entre pestañas de Login / Registro
    document.getElementById("go-to-register").addEventListener("click", (e) => {
      e.preventDefault();
      loginSection.classList.add("hidden");
      registerSection.classList.remove("hidden");
    });
    document.getElementById("go-to-login").addEventListener("click", (e) => {
      e.preventDefault();
      registerSection.classList.add("hidden");
      loginSection.classList.remove("hidden");
    });
    document.getElementById("go-to-recovery").addEventListener("click", (e) => {
      e.preventDefault();
      loginSection.classList.add("hidden");
      recoverySection.classList.remove("hidden");
    });
    document
      .getElementById("back-to-login-from-recover")
      .addEventListener("click", (e) => {
        e.preventDefault();
        recoverySection.classList.add("hidden");
        loginSection.classList.remove("hidden");
      });

    // Enviar Registro
    document.getElementById("register-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("reg-name").value.trim();
      const email = document
        .getElementById("reg-email")
        .value.trim()
        .toLowerCase();
      const password = document.getElementById("reg-password").value;
      const role = document.getElementById("reg-role").value;
      const users = getUsers();

      if (users.find((u) => u.email === email)) {
        alert("Este correo ya está registrado.");
        return;
      }

      users.push({
        name,
        email,
        password,
        role,
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        address: "",
      });
      saveUsers(users);
      alert("¡Registro exitoso! Ya puedes ingresar.");
      registerSection.classList.add("hidden");
      loginSection.classList.remove("hidden");
    });

    // Enviar Login
    document.getElementById("login-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document
        .getElementById("login-email")
        .value.trim()
        .toLowerCase();
      const password = document.getElementById("login-password").value;
      const user = getUsers().find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        alert("Credenciales incorrectas.");
        return;
      }

      sessionStorage.setItem("currentUser", JSON.stringify(user));
      window.location.href = "Landing.html"; // Redirección física de página
    });

    // Enviar Recuperación
    document.getElementById("recovery-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document
        .getElementById("recover-email")
        .value.trim()
        .toLowerCase();
      const user = getUsers().find((u) => u.email === email);
      alert(
        user
          ? `Contraseña encontrada: "${user.password}"`
          : "Correo no registrado."
      );
      recoverySection.classList.add("hidden");
      loginSection.classList.remove("hidden");
    });
  }

  // ==========================================================================
  // LÓGICA EXCLUSIVA PARA: Landing.html
  // ==========================================================================
  if (currentPage === "Landing.html") {
    const activeUser = JSON.parse(sessionStorage.getItem("currentUser"));

    // Seguridad: Si intentan entrar a la Landing sin loguearse, los rebota al Login
    if (!activeUser) {
      window.location.href = "log_in.html";
      return;
    }

    if (activeUser && activeUser.role === "Administrador") {
      const adminNav = document.getElementById("admin-actions-nav");
      if (adminNav) adminNav.classList.remove("hidden");
    }

    const storeContent = document.getElementById("store-content");
    const profileSection = document.getElementById("profile-section");
    const networkBadge = document.getElementById("network-badge");
    const featuredGrid = document.getElementById("featured-products-grid");

    // Monitoreo de Red Online/Offline
    function checkNetwork() {
      networkBadge.innerText = navigator.onLine ? "Online" : "Offline";
      networkBadge.className = navigator.onLine
        ? "badge-online"
        : "badge-offline";
    }
    window.addEventListener("online", checkNetwork);
    window.addEventListener("offline", checkNetwork);
    checkNetwork();

    // Toggle de Modo Claro / Oscuro
    document
      .getElementById("toggle-theme-btn")
      .addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem(
          "theme",
          document.body.classList.contains("dark-mode") ? "dark" : "light"
        );
      });

    // Consumo de FakeStoreAPI y Persistencia Local del Catálogo
    async function loadCatalog() {
      if (!localStorage.getItem("products")) {
        try {
          const res = await fetch("https://fakestoreapi.com/products");
          const data = await res.json();
          const clothes = data.filter((p) => p.category.includes("clothing"));
          localStorage.setItem("products", JSON.stringify(clothes));
        } catch (err) {
          featuredGrid.innerHTML =
            "<p>Error de conexión. Cargando catálogo local sin internet...</p>";
        }
      }
      renderProducts();
    }

    function renderProducts() {
      const products = JSON.parse(localStorage.getItem("products")) || [];
      if (products.length === 0) {
        featuredGrid.innerHTML = "<p>No hay productos en inventario.</p>";
        return;
      }

      featuredGrid.innerHTML = products
        .slice(0, 4)
        .map(
          (prod) => `
        <div class="product-card">
          <div class="product-img-holder"><img src="${prod.image}"></div>
          <div class="product-info">
            <h4>${prod.title}</h4>
            <p class="product-price">$${prod.price.toFixed(2)}</p>
            <button class="btn btn-dark btn-block" onclick="window.location.href='catalogo.html'">Comprar Ahora 🛒</button>
          </div>
        </div>
      `
        )
        .join("");
    }
    loadCatalog();

    // Navegación interna entre Tienda y Ver Perfil
    document
      .getElementById("go-to-profile-btn")
      .addEventListener("click", () => {
        storeContent.classList.add("hidden");
        profileSection.classList.remove("hidden");

        // Cargar datos actuales del perfil
        document.getElementById("profile-role-badge").innerText =
          activeUser.role;
        document.getElementById("profile-name").value = activeUser.name;
        document.getElementById("profile-avatar").value =
          activeUser.avatar || "";
        document.getElementById("profile-address").value =
          activeUser.address || "";
        document.getElementById("profile-avatar-preview").src =
          activeUser.avatar || "https://via.placeholder.com/100";
      });

    document
      .getElementById("back-to-store-btn")
      .addEventListener("click", () => {
        profileSection.classList.add("hidden");
        storeContent.classList.remove("hidden");
      });

    // Guardar cambios del Perfil en LocalStorage y Session
    document.getElementById("profile-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const users = getUsers();
      const idx = users.findIndex((u) => u.email === activeUser.email);

      if (idx !== -1) {
        users[idx].name = document.getElementById("profile-name").value.trim();
        users[idx].avatar = document
          .getElementById("profile-avatar")
          .value.trim();
        users[idx].address = document
          .getElementById("profile-address")
          .value.trim();

        saveUsers(users);
        sessionStorage.setItem("currentUser", JSON.stringify(users[idx]));
        document.getElementById("profile-avatar-preview").src =
          users[idx].avatar;
        alert("Perfil guardado con éxito.");
      }
    });

    // Cerrar Sesión
    document.getElementById("logout-btn").addEventListener("click", () => {
      sessionStorage.removeItem("currentUser");
      window.location.href = "log_in.html";
    });

    document.getElementById("cta-catalog").addEventListener("click", () => {
      featuredGrid.scrollIntoView({ behavior: "smooth" });
    });
  }

  // ==========================================================================
  // INICIALIZACIÓN DE VARIABLES LOCALES EN EL MOTOR DE BASE DE DATOS LOCAL
  // ==========================================================================
  if (!localStorage.getItem("cart"))
    localStorage.setItem("cart", JSON.stringify([]));
  if (!localStorage.getItem("orders"))
    localStorage.setItem("orders", JSON.stringify([]));
  if (!localStorage.getItem("feedbacks"))
    localStorage.setItem("feedbacks", JSON.stringify({}));

  const getCart = () => JSON.parse(localStorage.getItem("cart"));
  const saveCart = (cart) => localStorage.setItem("cart", JSON.stringify(cart));
  const getOrders = () => JSON.parse(localStorage.getItem("orders"));
  const getFeedbacks = () => JSON.parse(localStorage.getItem("feedbacks"));

  const activeUser = JSON.parse(sessionStorage.getItem("currentUser"));

  // ==========================================================================
  // SECCIÓN DINÁMICA DE REVISIÓN Y FILTRADO: catalogo.html
  // ==========================================================================
  if (currentPage === "catalogo.html") {
    if (!activeUser) {
      window.location.href = "log_in.html";
      return;
    }

    const catalogGrid = document.getElementById("full-catalog-grid");
    const cartModal = document.getElementById("cart-modal");
    const checkoutModal = document.getElementById("checkout-modal");

    // Manejo de despliegues de Modales del Carrito
    document.getElementById("open-cart-btn").addEventListener("click", () => {
      cartModal.classList.remove("hidden");
      updateCartUI();
    });
    document
      .getElementById("close-cart-btn")
      .addEventListener("click", () => cartModal.classList.add("hidden"));
    document.getElementById("go-checkout-btn").addEventListener("click", () => {
      if (getCart().length === 0) {
        alert("Tu carrito está vacío.");
        return;
      }
      checkoutModal.classList.remove("hidden");
    });
    document
      .getElementById("close-checkout-btn")
      .addEventListener("click", () => checkoutModal.classList.add("hidden"));

    // Filtros en Tiempo Real
    const searchInp = document.getElementById("search-input");
    const catFilt = document.getElementById("category-filter");
    const priceFilt = document.getElementById("price-filter");
    const priceVal = document.getElementById("price-val");

    [searchInp, catFilt, priceFilt].forEach((elem) =>
      elem.addEventListener("input", () => {
        priceVal.innerText = priceFilt.value;
        renderCatalog();
      })
    );

    function renderCatalog() {
      const products = JSON.parse(localStorage.getItem("products")) || [];
      const term = searchInp.value.toLowerCase();
      const category = catFilt.value;
      const maxPrice = parseFloat(priceFilt.value);

      const filtered = products.filter((p) => {
        const matchesSearch = p.title.toLowerCase().includes(term);
        const matchesCategory = category === "all" || p.category === category;
        const matchesPrice = p.price <= maxPrice;
        return matchesSearch && matchesCategory && matchesPrice;
      });

      if (filtered.length === 0) {
        catalogGrid.innerHTML =
          "<p>No se encontraron prendas que coincidan.</p>";
        return;
      }

      catalogGrid.innerHTML = filtered
        .map(
          (p) => `
        <div class="product-card">
          <div class="product-img-holder"><img src="${p.image}"></div>
          <div class="product-info">
            <h4>${p.title}</h4>
            <p class="product-price">$${p.price.toFixed(2)}</p>
            <div style="display:flex; gap:0.2rem;">
              <button class="btn btn-dark" style="flex:1; padding:0.5rem;" onclick="addToCart(${
                p.id
              })">Agregar 🛒</button>
              <button class="btn btn-outline" style="padding:0.5rem;" onclick="goToReview(${
                p.id
              })">Opiniones 💬</button>
            </div>
          </div>
        </div>
      `
        )
        .join("");
    }

    // Lógica e Interacciones del Carrito (Sumar, Clonar/Restar, Eliminar)
    window.addToCart = (id) => {
      const products = JSON.parse(localStorage.getItem("products")) || [];
      const product = products.find((p) => p.id === id);
      let cart = getCart();
      let item = cart.find((i) => i.id === id);

      if (item) {
        item.qty += 1;
      } else {
        cart.push({ ...product, qty: 1 });
      }
      saveCart(cart);
      updateCartUI();
    };

    window.alterQty = (id, amt) => {
      let cart = getCart();
      let item = cart.find((i) => i.id === id);
      if (item) {
        item.qty += amt;
        if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
      }
      saveCart(cart);
      updateCartUI();
    };

    window.removeFromCart = (id) => {
      saveCart(getCart().filter((i) => i.id !== id));
      updateCartUI();
    };

    function updateCartUI() {
      const cart = getCart();
      document.getElementById("cart-count").innerText = cart.reduce(
        (acc, i) => acc + i.qty,
        0
      );
      const container = document.getElementById("cart-items-container");

      if (cart.length === 0) {
        container.innerHTML = "<p>El carrito está vacío.</p>";
        document.getElementById("cart-subtotal").innerText = "$0.00";
        document.getElementById("cart-total").innerText = "$0.00";
        return;
      }

      container.innerHTML = cart
        .map(
          (i) => `
        <div class="cart-item">
          <img src="${i.image}">
          <div class="cart-item-details">
            <h5>${i.title}</h5>
            <p>$${(i.price * i.qty).toFixed(2)}</p>
            <div class="cart-item-ctrls">
              <button class="btn-qty" onclick="alterQty(${i.id}, -1)">-</button>
              <span>${i.qty}</span>
              <button class="btn-qty" onclick="alterQty(${i.id}, 1)">+</button>
            </div>
          </div>
          <button class="btn-close" style="font-size:1.2rem;" onclick="removeFromCart(${
            i.id
          })">&times;</button>
        </div>
      `
        )
        .join("");

      const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
      document.getElementById("cart-subtotal").innerText = `$${subtotal.toFixed(
        2
      )}`;
      document.getElementById("cart-total").innerText = `$${subtotal.toFixed(
        2
      )}`;
    }

    // Navegación Dinámica al módulo de feedback
    window.goToReview = (id) => {
      sessionStorage.setItem("reviewProductId", id);
      window.location.href = "comentarios.html";
    };

    // Envío Procesado en la Pasarela de Pago
    document.getElementById("checkout-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const orders = getOrders();
      const cart = getCart();
      const total = cart.reduce((acc, i) => acc + i.price * i.qty, 0);

      orders.push({
        id: "ORD-" + Math.floor(Math.random() * 90000 + 10000),
        client: activeUser.name,
        items: cart,
        total: total,
      });

      localStorage.setItem("orders", JSON.stringify(orders));
      saveCart([]); // Vaciar carrito
      alert(
        "¡Compra realizada con éxito! Orden Generada de forma persistente."
      );
      checkoutModal.classList.add("hidden");
      cartModal.classList.add("hidden");
      updateCartUI();
    });

    renderCatalog();
    updateCartUI();
  }

  // ==========================================================================
  // VISTA ADMINISTRATIVA CRUD: panel_admin.html
  // ==========================================================================
  if (currentPage === "panel_admin.html") {
    // Control Seguro Obligatorio de Rol
    if (!activeUser || activeUser.role !== "Administrador") {
      window.location.href = "Landing.html";
      return;
    }

    const inventoryTable = document.getElementById("admin-inventory-table");
    const crudForm = document.getElementById("crud-form");
    const cancelBtn = document.getElementById("crud-cancel-btn");

    function renderInventory() {
      const products = JSON.parse(localStorage.getItem("products")) || [];
      inventoryTable.innerHTML = products
        .map(
          (p) => `
        <tr>
          <td><img src="${p.image}"></td>
          <td><strong>${p.title}</strong><br><small style="color:gray;">${
            p.category
          }</small></td>
          <td>$${p.price.toFixed(2)}</td>
          <td>
            <button class="btn-dark btn-action" onclick="editProduct(${
              p.id
            })">✏️</button>
            <button class="btn-outline btn-action" style="border-color:red; color:red;" onclick="deleteProduct(${
              p.id
            })">🗑️</button>
          </td>
        </tr>
      `
        )
        .join("");
    }

    window.deleteProduct = (id) => {
      if (
        confirm("¿Estás seguro de eliminar este producto del inventario local?")
      ) {
        let products = JSON.parse(localStorage.getItem("products")) || [];
        products = products.filter((p) => p.id !== id);
        localStorage.setItem("products", JSON.stringify(products));
        renderInventory();
      }
    };

    window.editProduct = (id) => {
      const products = JSON.parse(localStorage.getItem("products")) || [];
      const p = products.find((prod) => prod.id === id);
      if (p) {
        document.getElementById("crud-id").value = p.id;
        document.getElementById("crud-title").value = p.title;
        document.getElementById("crud-price").value = p.price;
        document.getElementById("crud-category").value = p.category;
        document.getElementById("crud-image").value = p.image;

        document.getElementById("form-action-title").innerText =
          "Editar Producto Existente";
        cancelBtn.classList.remove("hidden");
      }
    };

    cancelBtn.addEventListener("click", () => {
      crudForm.reset();
      document.getElementById("crud-id").value = "";
      document.getElementById("form-action-title").innerText =
        "Agregar Nuevo Producto";
      cancelBtn.classList.add("hidden");
    });

    crudForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let products = JSON.parse(localStorage.getItem("products")) || [];
      const id = document.getElementById("crud-id").value;
      const title = document.getElementById("crud-title").value.trim();
      const price = parseFloat(document.getElementById("crud-price").value);
      const category = document.getElementById("crud-category").value;
      const image = document.getElementById("crud-image").value.trim();

      if (id) {
        // Operación Update (Actualizar)
        const idx = products.findIndex((p) => p.id == id);
        if (idx !== -1)
          products[idx] = { ...products[idx], title, price, category, image };
      } else {
        // Operación Create (Crear)
        const newProd = {
          id: Date.now(),
          title,
          price,
          category,
          image,
          rating: { rate: 5, count: 1 },
        };
        products.push(newProd);
      }

      localStorage.setItem("products", JSON.stringify(products));
      crudForm.reset();
      cancelBtn.click();
      renderInventory();
    });

    renderInventory();
  }

  // ==========================================================================
  // MÓDULO DE OPINIONES Y FEEDBACK: comentarios.html
  // ==========================================================================
// ==========================================================================
  // MÓDULO DE OPINIONES Y FEEDBACK: comentarios.html
  // ==========================================================================
  if (currentPage === "comentarios.html") {
    if (!activeUser) { window.location.href = "log_in.html"; return; }

    const prodId = sessionStorage.getItem('reviewProductId') || "1"; // Respaldo por si acaso
    const detailBox = document.getElementById('feedback-product-detail');
    const reviewsContainer = document.getElementById('product-reviews-container');
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id == prodId);

    // Renderizar la cabecera del producto seleccionado
    if (product) {
      detailBox.innerHTML = `
        <div style="display:flex; gap:1.5rem; align-items:center; flex-wrap:wrap; margin-bottom: 2rem;">
          <img src="${product.image}" style="max-height:120px; background:white; padding:0.5rem; border-radius:8px;">
          <div>
            <h2 style="margin:0 0 0.5rem 0;">${product.title}</h2>
            <p class="product-price" style="font-size:1.5rem; font-weight:bold; margin:0;">$${product.price.toFixed(2)}</p>
          </div>
        </div>
      `;
    }

    // Función para pintar las reseñas (Persistentes + Hardcodeadas)
    function renderReviews() {
      const feeds = JSON.parse(localStorage.getItem('feedbacks')) || {};
      
      // Si no existen opiniones para este producto en LocalStorage, cargamos unas de prueba por defecto
      if (!feeds[prodId] || feeds[prodId].length === 0) {
        feeds[prodId] = [
          { user: "Alexander UCAB", stars: 5, comment: "Increíble calidad en las costuras. El calce oversized es perfecto para el estilo urbano." },
          { user: "Valeria G.", stars: 4, comment: "Llegó super rápido. La tela es bastante abrigada y pesada, ideal para el invierno." }
        ];
        // Guardamos las por defecto para que la base de datos se inicialice limpia
        const currentFeeds = JSON.parse(localStorage.getItem('feedbacks')) || {};
        if (!currentFeeds[prodId]) {
          currentFeeds[prodId] = feeds[prodId];
          localStorage.setItem('feedbacks', JSON.stringify(currentFeeds));
        }
      }

      const itemReviews = feeds[prodId];

      // Renderizado limpio en el contenedor inferior
      reviewsContainer.innerHTML = itemReviews.map(r => `
        <div class="review-item" style="background-color: #111111; border: 1px solid #222222; border-left: 4px solid #ffffff; padding: 1.2rem; border-radius: 6px; margin-bottom: 1rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <strong style="color: #ffffff;">${r.user}</strong>
            <span style="color:#f1c40f;">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</span>
          </div>
          <p style="margin:0; color: #cccccc; font-size: 0.95rem;">${r.comment}</p>
        </div>
      `).join('');
    }

    // Capturar el envío del nuevo comentario
    document.getElementById('feedback-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Obtener la estrella seleccionada de los radio buttons
      const selectedRadio = document.querySelector('input[name="stars"]:checked');
      const stars = selectedRadio ? parseInt(selectedRadio.value) : 5; // 5 por defecto si no marca
      const comment = document.getElementById('feedback-text').value.trim();
      
      if (!comment) return;

      const feeds = JSON.parse(localStorage.getItem('feedbacks')) || {};
      if (!feeds[prodId]) feeds[prodId] = [];

      // Insertamos el nuevo comentario al inicio del array para que aparezca de primero
      feeds[prodId].unshift({
        user: activeUser.name,
        stars: stars,
        comment: comment
      });

      // Guardar de vuelta en el almacenamiento local para cumplir la persistencia del proyecto
      localStorage.setItem('feedbacks', JSON.stringify(feeds));
      
      // Resetear cuadro de texto
      document.getElementById('feedback-text').value = "";
      
      // Re-renderizar la sección al instante sin recargar la página entera
      renderReviews();
    });

    // Ejecutar al cargar la vista
    renderReviews();
  }

  // ==========================================================================
  // VISTA ADMINISTRATIVA DE INGRESOS: ingresos_admin.html
  // ==========================================================================
  if (currentPage === "ingresos_admin.html") {
    if (!activeUser || activeUser.role !== "Administrador") {
      window.location.href = "Landing.html";
      return;
    }

    const orders = getOrders();
    const totalEarnings = orders.reduce((acc, o) => acc + o.total, 0);
    const totalRegisteredUsers = (
      JSON.parse(localStorage.getItem("users")) || []
    ).length;

    document.getElementById(
      "metric-total-earnings"
    ).innerText = `$${totalEarnings.toFixed(2)}`;
    document.getElementById("metric-total-users").innerText =
      totalRegisteredUsers;
    document.getElementById("metric-total-orders").innerText = orders.length;

    // Calcular los 3 Productos Más Vendidos de forma algorítmica
    const productSalesCount = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        productSalesCount[item.title] =
          (productSalesCount[item.title] || 0) + item.qty;
      });
    });

    const sortedProducts = Object.entries(productSalesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topList = document.getElementById("top-products-list");
    if (sortedProducts.length === 0) {
      topList.innerHTML = "<li>No se han registrado ventas aún.</li>";
    } else {
      topList.innerHTML = sortedProducts
        .map(
          (p) =>
            `<li>${p[0]} <span style="color:gray;">(${p[1]} uds.)</span></li>`
        )
        .join("");
    }

    // Historial Reciente de Filas
    document.getElementById("sales-history-rows").innerHTML = orders
      .reverse()
      .map(
        (o) => `
      <tr>
        <td><code>${o.id}</code></td>
        <td>${o.client}</td>
        <td><strong>$${o.total.toFixed(2)}</strong></td>
      </tr>
    `
      )
      .join("");
  }
});
