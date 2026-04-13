// ============================================
// DATA PRODUK
// ============================================
const products = [
    {
        id: 1,
        name: 'Lemon Tea',
        icon: '🍋',
        description: 'Teh hitam segar dengan perasan lemon asli. Rasa asam manis yang menyegarkan, cocok untuk hari panas.',
        price: 5000,
        premium: false
    },
    {
        id: 2,
        name: 'Lychee Tea',
        icon: '🍒',
        description: 'Teh dengan aroma leci yang harum dan rasa manis alami. Kombinasi sempurna antara teh dan buah tropis.',
        price: 5000,
        premium: false
    },
    {
        id: 3,
        name: 'Moca Tea',
        icon: '☕',
        description: 'Perpaduan unik antara teh, kopi, dan cokelat. Rasa rich dan creamy dengan aroma yang menggugah selera.',
        price: 5000,
        premium: false
    },
    {
        id: 4,
        name: 'Milk Tea',
        icon: '🥛',
        description: 'Teh susu premium dengan rasa yang creamy dan murni. Dibuat dengan susu segar dan teh berkualitas tinggi.',
        price: 7000,
        premium: true
    }
];

// ============================================
// STATE MANAGEMENT
// ============================================
let cart = JSON.parse(localStorage.getItem('teaBlissCart')) || [];
let quantities = {};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    updateCartUI();
    setupEventListeners();
    
    // Load quantities dari localStorage
    const savedQuantities = localStorage.getItem('teaBlissQuantities');
    if (savedQuantities) {
        quantities = JSON.parse(savedQuantities);
    }
});

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Overlay click to close cart
    document.getElementById('overlay').addEventListener('click', toggleCart);
    
    // Smooth scroll untuk navigasi
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// PRODUCT RENDERING
// ============================================
function renderProducts() {
    const grid = document.getElementById('produkGrid');
    grid.innerHTML = products.map(product => `
        <div class="produk-card ${product.premium ? 'premium' : ''}">
            ${product.premium ? '<div class="badge">Premium</div>' : ''}
            <div class="produk-icon">${product.icon}</div>
            <h3>${product.name}</h3>
            <p class="deskripsi">${product.description}</p>
            <p class="harga">Rp ${product.price.toLocaleString('id-ID')}</p>
            
            <div class="quantity-control">
                <button class="qty-btn" onclick="updateQuantity(${product.id}, -1)">−</button>
                <span class="qty-display" id="qty-${product.id}">${quantities[product.id] || 1}</span>
                <button class="qty-btn" onclick="updateQuantity(${product.id}, 1)">+</button>
            </div>
            
            <button class="btn-beli" id="btn-${product.id}" onclick="addToCart(${product.id})">
                Pesan Sekarang
            </button>
        </div>
    `).join('');
}

// ============================================
// QUANTITY MANAGEMENT
// ============================================
function updateQuantity(productId, change) {
    quantities[productId] = (quantities[productId] || 1) + change;
    
    // Validasi range 1-20
    if (quantities[productId] < 1) quantities[productId] = 1;
    if (quantities[productId] > 20) quantities[productId] = 20;
    
    // Update UI
    const qtyDisplay = document.getElementById(`qty-${productId}`);
    if (qtyDisplay) {
        qtyDisplay.textContent = quantities[productId];
    }
    
    // Simpan ke localStorage
    localStorage.setItem('teaBlissQuantities', JSON.stringify(quantities));
}

// ============================================
// CART FUNCTIONALITY
// ============================================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const qty = quantities[productId] || 1;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            icon: product.icon,
            price: product.price,
            quantity: qty
        });
    }
    
    saveCart();
    updateCartUI();
    showNotification(`${qty}x ${product.name} ditambahkan ke keranjang!`);
    
    // Animasi button feedback
    animateButton(productId);
}

function animateButton(productId) {
    const btn = document.getElementById(`btn-${productId}`);
    if (btn) {
        btn.textContent = '✓ Ditambahkan';
        btn.classList.add('added');
        setTimeout(() => {
            btn.textContent = 'Pesan Sekarang';
            btn.classList.remove('added');
        }, 1500);
    }
}

function saveCart() {
    localStorage.setItem('teaBlissCart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    // Update badge count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Render cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <p>Keranjang masih kosong</p>
                <p style="font-size: 3rem; margin-top: 1rem;">🛒</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-icon">${item.icon}</div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</div>
                    <div class="cart-item-qty">
                        <button class="cart-qty-btn" onclick="updateCartItem(${item.id}, -1)">−</button>
                        <span>${item.quantity}</span>
                        <button class="cart-qty-btn" onclick="updateCartItem(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">Hapus</button>
            </div>
        `).join('');
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

function updateCartItem(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        
        // Validasi range 1-20
        if (item.quantity < 1) item.quantity = 1;
        if (item.quantity > 20) item.quantity = 20;
        
        saveCart();
        updateCartUI();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    showNotification('Produk dihapus dari keranjang');
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// ============================================
// CHECKOUT & ORDER PROCESSING
// ============================================
function openCheckout() {
    if (cart.length === 0) {
        showNotification('Keranjang masih kosong!', true);
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    const summary = document.getElementById('orderSummary');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    summary.innerHTML = `
        <h4>📋 Ringkasan Pesanan</h4>
        ${cart.map(item => `
            <div class="summary-item">
                <span>${item.icon} ${item.name} (${item.quantity}x)</span>
                <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
            </div>
        `).join('')}
        <div class="summary-total">
            <span>Total Pembayaran</span>
            <span>Rp ${total.toLocaleString('id-ID')}</span>
        </div>
    `;
    
    modal.classList.add('active');
    toggleCart();
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
}

function submitOrder(event) {
    event.preventDefault();
    
    // Ambil data form
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const payment = document.getElementById('paymentMethod').value;
    const notes = document.getElementById('orderNotes').value.trim();
    
    // Validasi
    if (!name || !phone || !address) {
        showNotification('Mohon lengkapi semua field yang wajib diisi!', true);
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Format pesan WhatsApp
    let message = formatWhatsAppMessage(name, phone, address, payment, notes, total);
    
    // Encode dan buka WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/6281215598802?text=${encodedMessage}`;
    
    showNotification('Mengarahkan ke WhatsApp...');
    
    setTimeout(() => {
        window.open(whatsappURL, '_blank');
        resetAfterOrder();
    }, 1000);
}

// ============================================
// WHATSAPP DIRECT
// ============================================
function openWhatsApp() {
    window.open('https://wa.me/6281215598802', '_blank');
}

function formatWhatsAppMessage(name, phone, address, payment, notes, total) {
    const paymentText = {
        'cod': 'Bayar di Tempat (COD)',
        'transfer': 'Transfer Bank',
        'ewallet': 'E-Wallet (DANA, OVO, GoPay)'
    };
    
    let message = `*🍃 PESANAN TEA BLISS*\n\n`;
    message += `*Data Pembeli:*\n`;
    message += `Nama: ${name}\n`;
    message += `No. HP: ${phone}\n`;
    message += `Alamat: ${address}\n\n`;
    
    message += `*Detail Pesanan:*\n`;
    cart.forEach(item => {
        message += `${item.icon} ${item.name}\n`;
        message += `   ${item.quantity}x @ Rp ${item.price.toLocaleString('id-ID')} = Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n\n`;
    });
    
    message += `*Total: Rp ${total.toLocaleString('id-ID')}*\n\n`;
    message += `*Pembayaran:* ${paymentText[payment]}\n`;
    
    if (notes) {
        message += `\n*Catatan:* ${notes}`;
    }
    
    message += `\n\nTerima kasih! 🙏`;
    
    return message;
}

function resetAfterOrder() {
    // Reset cart
    cart = [];
    quantities = {};
    saveCart();
    localStorage.removeItem('teaBlissQuantities');
    updateCartUI();
    closeCheckout();
    document.getElementById('orderForm').reset();
    
    showNotification('Pesanan berhasil dikirim! Silakan lanjutkan di WhatsApp.');
}

// ============================================
// CHAT WIDGET
// ============================================
function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.toggle('active');
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messagesDiv = document.getElementById('chatMessages');
    
    // Tambah pesan pengguna
    addMessage(messagesDiv, message, 'sent');
    input.value = '';
    
    // Auto-reply simulation
    setTimeout(() => {
        const reply = generateAutoReply(message);
        addMessage(messagesDiv, reply, 'received');
    }, 1000);
}

function addMessage(container, text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function generateAutoReply(message) {
    const lowerMsg = message.toLowerCase();
    
    const replies = {
        'harga': 'Harga menu kami:\n🍋 Lemon Tea: Rp 5.000\n🍒 Lychee Tea: Rp 5.000\n☕ Moca Tea: Rp 5.000\n🥛 Milk Tea: Rp 7.000\n\nSilakan pilih dan klik "Pesan Sekarang" ya! 😊',
        'menu': 'Harga menu kami:\n🍋 Lemon Tea: Rp 5.000\n🍒 Lychee Tea: Rp 5.000\n☕ Moca Tea: Rp 5.000\n🥛 Milk Tea: Rp 7.000\n\nSilakan pilih dan klik "Pesan Sekarang" ya! 😊',
        'buka': 'Kami buka setiap hari Senin-Minggu pukul 09.00-21.00 WITA. 🕘',
        'jam': 'Kami buka setiap hari Senin-Minggu pukul 09.00-21.00 WITA. 🕘',
        'alamat': 'Kami berlokasi di Jl. Teh Sehat No.89, Sumbawa. 📍',
        'lokasi': 'Kami berlokasi di Jl. Teh Sehat No.89, Sumbawa. 📍',
        'order': 'Untuk memesan, silakan klik tombol "Pesan Sekarang" pada menu yang Anda inginkan, lalu isi form pemesanan. Kami akan mengarahkan Anda ke WhatsApp untuk konfirmasi. 📱',
        'pesan': 'Untuk memesan, silakan klik tombol "Pesan Sekarang" pada menu yang Anda inginkan, lalu isi form pemesanan. Kami akan mengarahkan Anda ke WhatsApp untuk konfirmasi. 📱',
        'terima kasih': 'Sama-sama! Terima kasih kembali. Jangan lupa pesan lagi ya! 🍃',
        'thanks': 'Sama-sama! Terima kasih kembali. Jangan lupa pesan lagi ya! 🍃'
    };
    
    for (const [keyword, reply] of Object.entries(replies)) {
        if (lowerMsg.includes(keyword)) {
            return reply;
        }
    }
    
    return 'Terima kasih atas pesannya! 😊 Ada yang bisa kami bantu? Anda bisa bertanya tentang menu, harga, jam buka, atau cara pemesanan.';
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(text, isError = false) {
    const notif = document.getElementById('notification');
    const icon = document.getElementById('notif-icon');
    const textSpan = document.getElementById('notif-text');
    
    textSpan.textContent = text;
    icon.textContent = isError ? '⚠' : '✓';
    
    notif.className = 'notification show' + (isError ? ' error' : '');
    
    setTimeout(() => {
        notif.classList.remove('show');
    }, 3000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}