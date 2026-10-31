/**
 * Nishi's Creations - Storefront JavaScript
 * Customer-Facing Boutique Experience
 */

let allProducts = [];
let activeCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {
  fetchStorefrontProducts();
  setupCategoryTabs();
  setupModal();
});

async function fetchStorefrontProducts() {
  const container = document.getElementById('products-grid-container');
  try {
    const res = await fetch('/api/products?publishedOnly=true');
    allProducts = await res.json();
    renderStorefrontGrid();
  } catch (err) {
    console.error('Failed to load products:', err);
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888;">Unable to load creations right now.</p>`;
  }
}

function renderStorefrontGrid() {
  const container = document.getElementById('products-grid-container');
  container.innerHTML = '';

  const filtered = allProducts.filter(p => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #888;">
        <i class="fa-solid fa-shirt" style="font-size: 2.5rem; color: #ccc; margin-bottom: 12px;"></i>
        <h3 style="font-size: 1.2rem; color: #333;">New pieces arriving soon</h3>
        <p>Check back shortly or visit our boutique in Rau, Indore for custom designs.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-editorial-card';

    const isVideo = product.mediaType === 'video';
    const mediaElem = isVideo
      ? `<video src="${product.mediaUrl}" muted loop onmouseover="this.play()" onmouseout="this.pause()" playsinline></video>`
      : `<img src="${product.mediaUrl}" alt="${product.title}" loading="lazy">`;

    const formattedPrice = product.price ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Custom Order';

    // WhatsApp Message (to WhatsApp number: 9516482651)
    const waText = encodeURIComponent(`Namaste Nishi's Creations! 🙏\nI saw the "${product.title}" (${formattedPrice}) on your website. I would like to enquire about stitching/ordering this!`);
    const waUrl = `https://wa.me/919516482651?text=${waText}`;

    card.innerHTML = `
      <div class="card-media-box">
        ${mediaElem}
        <span class="card-badge">${product.category}</span>
        ${isVideo ? `<span class="card-video-pill"><i class="fa-solid fa-video"></i> Video</span>` : ''}
        <div class="card-hover-actions">
          <button type="button" class="btn-card-quick" onclick="openQuickView('${product.id}')">
            <i class="fa-solid fa-eye"></i> Quick View
          </button>
          <a href="${waUrl}" target="_blank" class="btn-card-whatsapp" title="Enquire on WhatsApp">
            <i class="fa-brands fa-whatsapp"></i>
          </a>
        </div>
      </div>
      <div class="card-details">
        <span class="card-category-label">${product.category}</span>
        <h3 class="card-product-title">${product.title}</h3>
        ${product.fabric ? `<span class="card-fabric-info">${product.fabric}</span>` : ''}
        <div class="card-price-row">
          <span class="card-price-value">${formattedPrice}</span>
          <a href="${waUrl}" target="_blank" style="color: #25d366; font-size: 0.82rem; font-weight: 600; text-decoration: none;">
            <i class="fa-brands fa-whatsapp"></i> Enquire
          </a>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function setupCategoryTabs() {
  const tabs = document.querySelectorAll('.cat-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category;
      renderStorefrontGrid();
    });
  });
}

window.filterCategory = function(cat) {
  activeCategory = cat;
  const tabs = document.querySelectorAll('.cat-tab-btn');
  tabs.forEach(t => {
    if (t.dataset.category === cat) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });
  renderStorefrontGrid();
  const el = document.getElementById('creations-section');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

// Quick View Modal
function setupModal() {
  const modal = document.getElementById('quick-view-modal');
  const closeBtn = document.getElementById('close-quick-modal');

  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

window.openQuickView = function(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quick-view-modal');
  const mediaWrap = document.getElementById('modal-media-wrap');
  const catElem = document.getElementById('modal-category');
  const titleElem = document.getElementById('modal-title');
  const priceElem = document.getElementById('modal-price');
  const descElem = document.getElementById('modal-desc');
  const fabricElem = document.getElementById('modal-fabric');
  const waLink = document.getElementById('modal-whatsapp-link');

  const isVideo = product.mediaType === 'video';
  mediaWrap.innerHTML = isVideo
    ? `<video src="${product.mediaUrl}" controls autoplay playsinline style="width:100%;height:100%;object-fit:cover;"></video>`
    : `<img src="${product.mediaUrl}" alt="${product.title}" style="width:100%;height:100%;object-fit:cover;">`;

  catElem.textContent = product.category;
  titleElem.textContent = product.title;
  priceElem.textContent = product.price ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Custom Order / Stitched to Measure';
  descElem.textContent = product.description || 'Custom tailored with love and precision stitching by Nishi’s Creations. Available in all standard sizes or customized to your exact measurements.';
  
  if (product.fabric) {
    fabricElem.style.display = 'block';
    fabricElem.innerHTML = `<i class="fa-solid fa-vest"></i> <strong>Fabric:</strong> ${product.fabric}`;
  } else {
    fabricElem.style.display = 'none';
  }

  const msg = encodeURIComponent(`Namaste Nishi's Creations! 🙏\nI am interested in ordering/customizing "${product.title}" (${priceElem.textContent}). Please let me know the process!`);
  waLink.href = `https://wa.me/919516482651?text=${msg}`;

  modal.classList.add('active');
};

// Quick Consultation Form Submission to WhatsApp
window.submitQuickConsultation = function() {
  const category = document.getElementById('quick-visit-category')?.value || 'Custom Stitching';
  const name = document.getElementById('quick-visit-name')?.value.trim();
  const time = document.getElementById('quick-visit-time')?.value || 'Boutique Hours';

  let message = `Namaste Nishi's Creations! 🙏\nI would like to schedule a boutique visit for: *${category}*.\n`;
  if (name) message += `Customer Name: ${name}\n`;
  message += `Preferred Timing: ${time}\nPlease confirm available appointment slot. Thank you!`;

  const url = `https://wa.me/919516482651?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};
