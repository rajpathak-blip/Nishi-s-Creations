/**
 * Nishi's Creations - Boutique Management & Social Studio
 * Frontend Application Engine
 */

// Application State
const state = {
  products: [],
  invoices: [],
  settings: {
    boutiqueName: "Nishi's Creations",
    tagline: "DESIGNER WEAR",
    phone: "6260808658",
    whatsapp: "9516482651",
    instagram: "@NISHIS_CREATIONS",
    address: "Main Road Rangwasa, Rau, Indore",
    upiId: "6260808658@upi"
  },
  currentCategory: 'all',
  studio: {
    selectedProduct: null,
    customImage: null,
    ratio: 'story', // 'story' (9:16), 'square' (1:1), 'portrait' (4:5)
    logoOverlay: true,
    contactFooter: true,
    addressStrip: true,
    goldBorder: true,
    title: '',
    price: ''
  },
  billing: {
    items: [],
    subtotal: 0,
    discount: 0,
    total: 0,
    advance: 0,
    balance: 0
  }
};

// DOM Elements
const elements = {
  tabs: document.querySelectorAll('.nav-tab'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  productsGrid: document.getElementById('products-grid'),
  filterPills: document.querySelectorAll('.filter-pill'),
  uploadModal: document.getElementById('upload-modal'),
  openUploadModalBtn: document.getElementById('open-upload-modal-btn'),
  closeUploadModalBtn: document.getElementById('close-upload-modal'),
  cancelUploadBtn: document.getElementById('cancel-upload-btn'),
  uploadForm: document.getElementById('upload-form'),
  dropZone: document.getElementById('drop-zone'),
  mediaFileInput: document.getElementById('media-file-input'),
  dropPreviewList: document.getElementById('drop-preview-list'),
  toastContainer: document.getElementById('toast-container'),

  // Social Studio
  studioCanvas: document.getElementById('studio-canvas'),
  studioProductSelect: document.getElementById('studio-product-select'),
  studioCustomFile: document.getElementById('studio-custom-file'),
  formatBtns: document.querySelectorAll('.format-btn'),
  toggleLogoOverlay: document.getElementById('toggle-logo-overlay'),
  toggleContactFooter: document.getElementById('toggle-contact-footer'),
  toggleAddressStrip: document.getElementById('toggle-address-strip'),
  toggleGoldBorder: document.getElementById('toggle-gold-border'),
  studioOverlayTitle: document.getElementById('studio-overlay-title'),
  studioOverlayPrice: document.getElementById('studio-overlay-price'),
  downloadPostBtn: document.getElementById('download-post-image-btn'),
  studioCaptionText: document.getElementById('studio-caption-text'),
  copyCaptionBtn: document.getElementById('copy-caption-btn'),
  shareWhatsappPostBtn: document.getElementById('share-whatsapp-post-btn'),
  regenerateCaptionBtn: document.getElementById('regenerate-caption-btn'),

  // Billing
  billCustName: document.getElementById('bill-cust-name'),
  billCustPhone: document.getElementById('bill-cust-phone'),
  billCustAddress: document.getElementById('bill-cust-address'),
  billInvoiceNo: document.getElementById('bill-invoice-no'),
  billOrderDate: document.getElementById('bill-order-date'),
  billDeliveryDate: document.getElementById('bill-delivery-date'),
  billMeasurements: document.getElementById('bill-measurements'),
  billingItemsBody: document.getElementById('billing-items-body'),
  addItemRowBtn: document.getElementById('add-item-row-btn'),
  billSubtotalDisp: document.getElementById('bill-subtotal-disp'),
  billDiscountInput: document.getElementById('bill-discount-input'),
  billTotalDisp: document.getElementById('bill-total-disp'),
  billAdvanceInput: document.getElementById('bill-advance-input'),
  billBalanceDisp: document.getElementById('bill-balance-disp'),
  billPaymentMode: document.getElementById('bill-payment-mode'),
  billOrderStatus: document.getElementById('bill-order-status'),
  billNotes: document.getElementById('bill-notes'),
  saveInvoiceBtn: document.getElementById('save-invoice-btn'),
  printPdfBtn: document.getElementById('print-pdf-btn'),
  sendWhatsappBillBtn: document.getElementById('send-whatsapp-bill-btn'),
  resetBillFormBtn: document.getElementById('reset-bill-form-btn'),

  // Printable Preview
  prevBillNo: document.getElementById('prev-bill-no'),
  prevDate: document.getElementById('prev-date'),
  prevDelivery: document.getElementById('prev-delivery'),
  prevCustName: document.getElementById('prev-cust-name'),
  prevCustPhone: document.getElementById('prev-cust-phone'),
  prevCustAddress: document.getElementById('prev-cust-address'),
  prevStatusPill: document.getElementById('prev-status-pill'),
  prevMeasurementsContainer: document.getElementById('prev-measurements-container'),
  prevMeasurementsText: document.getElementById('prev-measurements-text'),
  prevItemsBody: document.getElementById('prev-items-body'),
  prevSubtotal: document.getElementById('prev-subtotal'),
  prevDiscount: document.getElementById('prev-discount'),
  prevTotal: document.getElementById('prev-total'),
  prevAdvance: document.getElementById('prev-advance'),
  prevBalance: document.getElementById('prev-balance'),
  prevPaymentMode: document.getElementById('prev-payment-mode'),

  // Orders Ledger
  ordersTableBody: document.getElementById('orders-table-body'),
  ordersStatsChips: document.getElementById('orders-stats-chips'),
  orderSearchInput: document.getElementById('order-search-input'),

  // Settings
  settingsForm: document.getElementById('settings-form'),
  setName: document.getElementById('set-name'),
  setTagline: document.getElementById('set-tagline'),
  setPhone: document.getElementById('set-phone'),
  setInstagram: document.getElementById('set-instagram'),
  setUpi: document.getElementById('set-upi'),
  setAddress: document.getElementById('set-address'),

  // Mobile Connect Modal
  btnOpenMobileModal: document.getElementById('btn-open-mobile-modal'),
  mobileModal: document.getElementById('mobile-modal'),
  closeMobileModal: document.getElementById('close-mobile-modal'),
  mobileQrImg: document.getElementById('mobile-qr-img'),
  mobileLinkInput: document.getElementById('mobile-link-input'),
  copyMobileLinkBtn: document.getElementById('copy-mobile-link-btn')
};

// Brand Logo Images for Canvas
const brandLogoImg = new Image();
brandLogoImg.src = '/assets/logo-dark.jpg';

const brandLogoLightImg = new Image();
brandLogoLightImg.src = '/assets/logo-light.jpg';

// Helper: Show toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'whatsapp' ? 'fa-brands fa-whatsapp' : 'fa-solid fa-circle-check';
  toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Format Currency
function formatINR(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

// Format Date
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupModalAndUpload();
  setupSocialStudio();
  setupBilling();
  setupOrdersLedger();
  setupSettings();
  setupMobileConnect();

  // Load Initial Data
  fetchSettings();
  fetchProducts();
  fetchInvoices();

  // Set default billing dates
  const today = new Date().toISOString().split('T')[0];
  elements.billOrderDate.value = today;
  
  const delivery = new Date();
  delivery.setDate(delivery.getDate() + 5);
  elements.billDeliveryDate.value = delivery.toISOString().split('T')[0];

  // Set default invoice number
  generateNewInvoiceNumber();
});

// ================= NAVIGATION =================
function setupNavigation() {
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.tabs.forEach(t => t.classList.remove('active'));
      elements.tabPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(tab.dataset.tab);
      if (targetPane) targetPane.classList.add('active');

      // Refresh canvas when switching to social studio
      if (tab.dataset.tab === 'social-tab') {
        renderStudioCanvas();
      }
    });
  });
}

function switchToTab(tabId) {
  const targetTab = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
  if (targetTab) targetTab.click();
}

// ================= PRODUCTS & VAULT =================
async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    state.products = data;
    renderProducts();
    populateStudioDropdown();
  } catch (err) {
    console.error('Failed to load products:', err);
  }
}

function renderProducts() {
  elements.productsGrid.innerHTML = '';

  const filtered = state.products.filter(p => {
    if (state.currentCategory === 'all') return true;
    return p.category === state.currentCategory;
  });

  if (filtered.length === 0) {
    elements.productsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <i class="fa-solid fa-gem" style="font-size: 3rem; color: var(--gold-primary); margin-bottom: 12px; opacity: 0.5;"></i>
        <h3>No creations found in this category</h3>
        <p>Click "Upload New Creation" to add photos or videos of your wife's stitching work.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const isVideo = product.mediaType === 'video';
    const mediaElem = isVideo
      ? `<video src="${product.mediaUrl}" controls preload="metadata"></video>`
      : `<img src="${product.mediaUrl}" alt="${product.title}" loading="lazy">`;

    card.innerHTML = `
      <div class="product-media-wrap">
        ${mediaElem}
        <span class="category-tag">${product.category}</span>
        <span class="media-type-badge">
          <i class="${isVideo ? 'fa-solid fa-video' : 'fa-solid fa-camera'}"></i>
          ${isVideo ? 'Video' : 'Photo'}
        </span>
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.title}</h3>
        <div class="product-price-row">
          <span class="product-price">${product.price ? formatINR(product.price) : 'Custom Order'}</span>
          <small style="color: var(--text-dim); font-size: 0.72rem;">${formatDate(product.createdAt)}</small>
        </div>
        ${product.fabric ? `<p class="product-fabric"><i class="fa-solid fa-vest"></i> ${product.fabric}</p>` : ''}
        ${product.description ? `<p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4;">${product.description}</p>` : ''}
        
        <div class="product-actions">
          <button class="btn-card-action" onclick="loadProductIntoStudio('${product.id}')">
            <i class="fa-solid fa-wand-magic-sparkles" style="color: var(--gold-primary);"></i>
            <span>Make Post / Status</span>
          </button>
          <button class="btn-card-action" onclick="loadProductIntoBilling('${product.id}')">
            <i class="fa-solid fa-file-invoice" style="color: var(--gold-primary);"></i>
            <span>Add to Bill</span>
          </button>
        </div>
      </div>
      <button class="btn-card-delete" onclick="deleteProduct('${product.id}')" title="Delete Product">
        <i class="fa-regular fa-trash-can"></i>
      </button>
    `;

    elements.productsGrid.appendChild(card);
  });
}

// Category Filter Pills
elements.filterPills.forEach(pill => {
  pill.addEventListener('click', (e) => {
    const parent = pill.closest('.category-filter-bar');
    if (!parent) return;
    parent.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.currentCategory = pill.dataset.category;
    renderProducts();
  });
});

// Setup Upload Modal & Drag-Drop
function setupModalAndUpload() {
  elements.openUploadModalBtn.addEventListener('click', () => {
    elements.uploadModal.classList.add('active');
  });

  const closeModal = () => {
    elements.uploadModal.classList.remove('active');
    elements.uploadForm.reset();
    elements.dropPreviewList.innerHTML = '';
  };

  elements.closeUploadModalBtn.addEventListener('click', closeModal);
  elements.cancelUploadBtn.addEventListener('click', closeModal);

  // Drop zone events
  const dropZone = elements.dropZone;
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    elements.mediaFileInput.files = files;
    updateFilePreviews(files);
  });

  elements.mediaFileInput.addEventListener('change', (e) => {
    updateFilePreviews(e.target.files);
  });

  // Handle Form Submit
  elements.uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(elements.uploadForm);

    const submitBtn = document.getElementById('submit-upload-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      showToast(`✨ Added "${data.product.title}" to Creations Vault!`);
      closeModal();
      await fetchProducts();
    } catch (err) {
      alert('Error uploading files: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Save to Vault`;
    }
  });
}

function updateFilePreviews(files) {
  elements.dropPreviewList.innerHTML = '';
  Array.from(files).forEach(file => {
    const isVid = file.type.startsWith('video/');
    const preview = document.createElement(isVid ? 'video' : 'img');
    preview.className = 'preview-thumb';
    preview.src = URL.createObjectURL(file);
    elements.dropPreviewList.appendChild(preview);
  });
}

async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to remove this product from the vault?')) return;
  try {
    const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Product removed');
      fetchProducts();
    }
  } catch (err) {
    alert('Error deleting product');
  }
}

// ================= SOCIAL POST & STATUS STUDIO =================
function setupSocialStudio() {
  // Format switchers
  elements.formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.formatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.studio.ratio = btn.dataset.ratio;
      renderStudioCanvas();
    });
  });

  // Checkboxes
  elements.toggleLogoOverlay.addEventListener('change', (e) => {
    state.studio.logoOverlay = e.target.checked;
    renderStudioCanvas();
  });
  elements.toggleContactFooter.addEventListener('change', (e) => {
    state.studio.contactFooter = e.target.checked;
    renderStudioCanvas();
  });
  elements.toggleAddressStrip.addEventListener('change', (e) => {
    state.studio.addressStrip = e.target.checked;
    renderStudioCanvas();
  });
  elements.toggleGoldBorder.addEventListener('change', (e) => {
    state.studio.goldBorder = e.target.checked;
    renderStudioCanvas();
  });

  // Inputs
  elements.studioOverlayTitle.addEventListener('input', (e) => {
    state.studio.title = e.target.value;
    renderStudioCanvas();
    updateGeneratedCaption();
  });
  elements.studioOverlayPrice.addEventListener('input', (e) => {
    state.studio.price = e.target.value;
    renderStudioCanvas();
    updateGeneratedCaption();
  });

  // Product Dropdown
  elements.studioProductSelect.addEventListener('change', (e) => {
    const prodId = e.target.value;
    if (prodId) {
      const prod = state.products.find(p => p.id === prodId);
      if (prod) {
        state.studio.selectedProduct = prod;
        state.studio.title = prod.title;
        state.studio.price = prod.price ? `₹${prod.price}` : 'Custom Order';
        elements.studioOverlayTitle.value = state.studio.title;
        elements.studioOverlayPrice.value = state.studio.price;
        state.studio.customImage = null;
        renderStudioCanvas();
        updateGeneratedCaption();
      }
    }
  });

  // Custom File Input
  elements.studioCustomFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          state.studio.customImage = img;
          state.studio.selectedProduct = null;
          elements.studioProductSelect.value = '';
          renderStudioCanvas();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Download Image Button
  elements.downloadPostBtn.addEventListener('click', () => {
    const canvas = elements.studioCanvas;
    const link = document.createElement('a');
    const filename = `Nishis-Creations-${state.studio.ratio}-${Date.now()}.png`;
    link.download = filename;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    showToast(`📸 Downloaded ${filename}! Ready for WhatsApp / Instagram`);
  });

  // Copy Caption Button
  elements.copyCaptionBtn.addEventListener('click', () => {
    elements.studioCaptionText.select();
    navigator.clipboard.writeText(elements.studioCaptionText.value);
    showToast('✨ Caption copied to clipboard!');
  });

  // Share to WhatsApp Button
  elements.shareWhatsappPostBtn.addEventListener('click', () => {
    const caption = encodeURIComponent(elements.studioCaptionText.value);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${caption}`;
    window.open(whatsappUrl, '_blank');
    showToast('Opening WhatsApp with ready caption...', 'whatsapp');
  });

  // Regenerate Caption Button
  elements.regenerateCaptionBtn.addEventListener('click', () => {
    updateGeneratedCaption();
    showToast('Caption refreshed!');
  });
}

function populateStudioDropdown() {
  elements.studioProductSelect.innerHTML = '<option value="">-- Choose from Catalog --</option>';
  state.products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.category}: ${p.title}`;
    elements.studioProductSelect.appendChild(opt);
  });
}

window.loadProductIntoStudio = function(productId) {
  const prod = state.products.find(p => p.id === productId);
  if (!prod) return;

  state.studio.selectedProduct = prod;
  state.studio.title = prod.title;
  state.studio.price = prod.price ? `₹${prod.price}` : 'Custom Stitched';
  elements.studioOverlayTitle.value = state.studio.title;
  elements.studioOverlayPrice.value = state.studio.price;
  elements.studioProductSelect.value = prod.id;
  state.studio.customImage = null;

  switchToTab('social-tab');
  renderStudioCanvas();
  updateGeneratedCaption();
};

function renderStudioCanvas() {
  const canvas = elements.studioCanvas;
  const ctx = canvas.getContext('2d');

  // Canvas Dimensions based on ratio
  let targetWidth = 1080;
  let targetHeight = 1920; // 9:16 WhatsApp Status / Reel

  if (state.studio.ratio === 'square') {
    targetWidth = 1080;
    targetHeight = 1080; // 1:1
  } else if (state.studio.ratio === 'portrait') {
    targetWidth = 1080;
    targetHeight = 1350; // 4:5
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Background Fill
  ctx.fillStyle = '#0f1015';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Determine Source Image
  let imgSource = null;
  if (state.studio.customImage) {
    imgSource = state.studio.customImage;
  } else if (state.studio.selectedProduct && state.studio.selectedProduct.mediaUrl) {
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.src = state.studio.selectedProduct.mediaUrl;
    if (tempImg.complete) {
      imgSource = tempImg;
    } else {
      tempImg.onload = () => renderStudioCanvas();
      return;
    }
  } else {
    // Default fallback to logo
    imgSource = brandLogoImg;
  }

  // Draw Main Image (Cover fit)
  if (imgSource && imgSource.width > 0) {
    drawImageCover(ctx, imgSource, 0, 0, targetWidth, targetHeight);
  }

  // Vignette Overlays (Top and Bottom soft gradient shadows for text contrast)
  const topGrad = ctx.createLinearGradient(0, 0, 0, targetHeight * 0.35);
  topGrad.addColorStop(0, 'rgba(10, 11, 15, 0.95)');
  topGrad.addColorStop(0.5, 'rgba(10, 11, 15, 0.55)');
  topGrad.addColorStop(1, 'rgba(10, 11, 15, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, targetWidth, targetHeight * 0.35);

  const btmGrad = ctx.createLinearGradient(0, targetHeight * 0.55, 0, targetHeight);
  btmGrad.addColorStop(0, 'rgba(10, 11, 15, 0)');
  btmGrad.addColorStop(0.5, 'rgba(10, 11, 15, 0.7)');
  btmGrad.addColorStop(1, 'rgba(10, 11, 15, 0.96)');
  ctx.fillStyle = btmGrad;
  ctx.fillRect(0, targetHeight * 0.55, targetWidth, targetHeight * 0.45);

  // 1. Royal Gold Border Frame
  if (state.studio.goldBorder) {
    ctx.save();
    const margin = 36;
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(margin, margin, targetWidth - margin * 2, targetHeight - margin * 2);

    // Inner hairline
    ctx.strokeStyle = 'rgba(245, 215, 127, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(margin + 12, margin + 12, targetWidth - (margin + 12) * 2, targetHeight - (margin + 12) * 2);

    // Corner decorative diamonds
    drawDiamond(ctx, margin + 6, margin + 6, 8, '#f5d77f');
    drawDiamond(ctx, targetWidth - margin - 6, margin + 6, 8, '#f5d77f');
    drawDiamond(ctx, margin + 6, targetHeight - margin - 6, 8, '#f5d77f');
    drawDiamond(ctx, targetWidth - margin - 6, targetHeight - margin - 6, 8, '#f5d77f');
    ctx.restore();
  }

  // 2. Top Luxury Boutique Header & Logo Overlay
  if (state.studio.logoOverlay) {
    ctx.save();
    const logoSize = 130;
    const logoX = (targetWidth - logoSize) / 2;
    const logoY = state.studio.ratio === 'story' ? 90 : 60;

    // Logo image circular clip or rounded box
    ctx.save();
    roundRect(ctx, logoX, logoY, logoSize, logoSize, 20);
    ctx.clip();
    if (brandLogoImg.complete) {
      ctx.drawImage(brandLogoImg, logoX, logoY, logoSize, logoSize);
    }
    ctx.restore();

    // Golden frame around logo
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    roundRect(ctx, logoX, logoY, logoSize, logoSize, 20);
    ctx.stroke();

    // Brand Name Typography
    ctx.textAlign = 'center';
    ctx.font = '700 48px "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#f5e4a8';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 12;
    ctx.fillText("Nishi's Creations", targetWidth / 2, logoY + logoSize + 56);

    ctx.font = '600 20px "Cinzel", serif';
    ctx.letterSpacing = '6px';
    ctx.fillStyle = '#d4af37';
    ctx.fillText("DESIGNER WEAR • BOUTIQUE", targetWidth / 2, logoY + logoSize + 88);
    ctx.restore();
  }

  // 3. Middle / Bottom Product Title & Price Badge
  const titleText = state.studio.title || (state.studio.selectedProduct ? state.studio.selectedProduct.title : '');
  const priceText = state.studio.price || (state.studio.selectedProduct && state.studio.selectedProduct.price ? `₹${state.studio.selectedProduct.price}` : '');

  if (titleText || priceText) {
    ctx.save();
    const infoY = state.studio.ratio === 'story' ? targetHeight - 380 : targetHeight - 260;

    if (titleText) {
      ctx.textAlign = 'center';
      ctx.font = '700 40px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 10;
      ctx.fillText(titleText, targetWidth / 2, infoY);
    }

    if (priceText) {
      // Golden Badge for Price
      const badgeText = `${priceText}`;
      ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
      const textWidth = ctx.measureText(badgeText).width;
      const badgeW = textWidth + 50;
      const badgeH = 50;
      const badgeX = (targetWidth - badgeW) / 2;
      const badgeY = infoY + 22;

      ctx.fillStyle = 'rgba(18, 19, 25, 0.85)';
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 25);
      ctx.fill();

      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 25);
      ctx.stroke();

      ctx.fillStyle = '#f5d77f';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, targetWidth / 2, badgeY + 35);
    }
    ctx.restore();
  }

  // 4. Contact Footer (Phone, Instagram, Address)
  if (state.studio.contactFooter) {
    ctx.save();
    const footerY = targetHeight - 140;

    // Gold Divider line
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(targetWidth * 0.2, footerY - 24);
    ctx.lineTo(targetWidth * 0.8, footerY - 24);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '700 24px "Cinzel", serif';
    ctx.letterSpacing = '3px';
    ctx.fillStyle = '#f5d77f';
    ctx.fillText("BOOK AN APPOINTMENT", targetWidth / 2, footerY + 4);

    ctx.font = '700 36px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillStyle = '#ffffff';
    ctx.fillText("📞 6260808658 • 💬 WhatsApp Orders Available", targetWidth / 2, footerY + 48);

    if (state.studio.addressStrip) {
      ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#cccccc';
      ctx.fillText("📸 Instagram: @NISHIS_CREATIONS", targetWidth / 2, footerY + 82);

      ctx.font = '400 19px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#9ba0b0';
      ctx.fillText("📍 Main Road Rangwasa, Rau, Indore", targetWidth / 2, footerY + 110);
    }
    ctx.restore();
  }
}

// Canvas Utility Functions
function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sWidth = img.width;
  let sHeight = img.height;
  let sx = 0;
  let sy = 0;

  if (imgRatio > targetRatio) {
    sWidth = img.height * targetRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    sHeight = img.width / targetRatio;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawDiamond(ctx, x, y, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Generate Social Media Caption
function updateGeneratedCaption() {
  const prod = state.studio.selectedProduct;
  const title = state.studio.title || (prod ? prod.title : "Designer Stitching Creation");
  const price = state.studio.price || (prod && prod.price ? `₹${prod.price}` : "Custom Pricing");
  const fabric = prod && prod.fabric ? prod.fabric : "Premium Fabric & Hand Embroidery";

  const caption = `✨ Nishi's Creations - Designer Wear ✨
New Stitching Masterpiece: *${title}* 🥻

💎 Fabric & Work: ${fabric}
🏷️ Rate / Estimation: ${price}
🧵 Custom tailoring, perfect fit & bespoke bridal stitching.

📍 Visit Us: Main Road Rangwasa, Rau, Indore
📞 Book an Appointment / Enquiries: 6260808658
📸 Instagram: @NISHIS_CREATIONS

DM us or WhatsApp directly on 9516482651 to book your order or design consultation! 🌸

#NishisCreations #BoutiqueIndore #IndoreBoutique #DesignerBlouse #LehengaCholi #BhagwanPoshak #KidsDress #CustomStitching #IndoreFashion #RauIndore`;

  elements.studioCaptionText.value = caption;
}

// ================= BOUTIQUE BILLING & PDF INVOICE =================
function setupBilling() {
  // Preset buttons
  document.getElementById('btn-preset-blouse').addEventListener('click', () => {
    elements.billMeasurements.value = "Blouse: Length 14.5\", Chest 36\", Waist 30\", Front Neck 6.5\", Back Neck 9.5\", Sleeves 10\"";
    updateLiveInvoicePreview();
  });
  document.getElementById('btn-preset-lehenga').addEventListener('click', () => {
    elements.billMeasurements.value = "Lehenga: Length 42\", Waist 32\", Flare 4.5m (16 Kali), Choli: Chest 36\", Waist 30\"";
    updateLiveInvoicePreview();
  });
  document.getElementById('btn-preset-dress').addEventListener('click', () => {
    elements.billMeasurements.value = "Kids Dress: Shoulder 11\", Chest 26\", Waist 24\", Length 28\", Age: 6-7 yrs";
    updateLiveInvoicePreview();
  });

  // Add Item Row
  elements.addItemRowBtn.addEventListener('click', () => {
    addItemRow('', 1, 0);
  });

  // Inputs sync
  [
    elements.billCustName,
    elements.billCustPhone,
    elements.billCustAddress,
    elements.billOrderDate,
    elements.billDeliveryDate,
    elements.billMeasurements,
    elements.billPaymentMode,
    elements.billOrderStatus
  ].forEach(input => {
    input.addEventListener('input', updateLiveInvoicePreview);
  });

  elements.billDiscountInput.addEventListener('input', calculateTotals);
  elements.billAdvanceInput.addEventListener('input', calculateTotals);

  // Initialize with 1 default item
  addItemRow('Designer Bridal Blouse Stitching (Padded)', 1, 1200);

  // Save Invoice
  elements.saveInvoiceBtn.addEventListener('click', saveCurrentInvoice);

  // Download PDF
  elements.printPdfBtn.addEventListener('click', downloadPdfInvoice);

  // Send WhatsApp Bill
  elements.sendWhatsappBillBtn.addEventListener('click', sendInvoiceViaWhatsApp);

  // Reset
  elements.resetBillFormBtn.addEventListener('click', resetBillingForm);
}

function generateNewInvoiceNumber() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100 + Math.random() * 900);
  elements.billInvoiceNo.value = `NC-${year}-${randomNum}`;
  updateLiveInvoicePreview();
}

window.addPresetItem = function(desc, rate) {
  addItemRow(desc, 1, rate);
  showToast(`Added: ${desc}`);
};

function addItemRow(desc = '', qty = 1, rate = 0) {
  const rowId = 'item-' + Date.now() + Math.random().toString(36).substring(2, 5);
  const tr = document.createElement('tr');
  tr.id = rowId;
  tr.innerHTML = `
    <td>
      <input type="text" class="form-input item-desc-input" value="${desc}" placeholder="Item description" style="padding: 6px 10px;">
    </td>
    <td>
      <input type="number" class="form-input item-qty-input" value="${qty}" min="1" style="padding: 6px 10px; text-align: center;">
    </td>
    <td>
      <input type="number" class="form-input item-rate-input" value="${rate}" min="0" style="padding: 6px 10px; text-align: right;">
    </td>
    <td style="text-align: right; font-weight: 600; color: var(--gold-primary);">
      <span class="item-row-total">${formatINR(qty * rate)}</span>
    </td>
    <td style="text-align: center;">
      <button type="button" class="btn-remove-row" onclick="removeItemRow('${rowId}')" title="Delete row">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </td>
  `;

  elements.billingItemsBody.appendChild(tr);

  // Bind input changes
  const descInput = tr.querySelector('.item-desc-input');
  const qtyInput = tr.querySelector('.item-qty-input');
  const rateInput = tr.querySelector('.item-rate-input');

  const onRowChange = () => {
    const q = Number(qtyInput.value) || 0;
    const r = Number(rateInput.value) || 0;
    tr.querySelector('.item-row-total').textContent = formatINR(q * r);
    calculateTotals();
  };

  descInput.addEventListener('input', updateLiveInvoicePreview);
  qtyInput.addEventListener('input', onRowChange);
  rateInput.addEventListener('input', onRowChange);

  calculateTotals();
}

window.removeItemRow = function(rowId) {
  const row = document.getElementById(rowId);
  if (row) {
    row.remove();
    calculateTotals();
  }
};

function calculateTotals() {
  const rows = elements.billingItemsBody.querySelectorAll('tr');
  let subtotal = 0;
  const items = [];

  rows.forEach(row => {
    const desc = row.querySelector('.item-desc-input').value.trim();
    const qty = Number(row.querySelector('.item-qty-input').value) || 0;
    const rate = Number(row.querySelector('.item-rate-input').value) || 0;
    const rowTotal = qty * rate;
    subtotal += rowTotal;

    if (desc) {
      items.push({ description: desc, qty, rate, total: rowTotal });
    }
  });

  const discount = Number(elements.billDiscountInput.value) || 0;
  const total = Math.max(0, subtotal - discount);
  const advance = Number(elements.billAdvanceInput.value) || 0;
  const balance = Math.max(0, total - advance);

  state.billing = {
    items,
    subtotal,
    discount,
    total,
    advance,
    balance
  };

  elements.billSubtotalDisp.textContent = formatINR(subtotal);
  elements.billTotalDisp.textContent = formatINR(total);
  elements.billBalanceDisp.textContent = formatINR(balance);

  updateLiveInvoicePreview();
}

function updateLiveInvoicePreview() {
  elements.prevBillNo.textContent = elements.billInvoiceNo.value || 'NC-2026-001';
  elements.prevDate.textContent = formatDate(elements.billOrderDate.value);
  elements.prevDelivery.textContent = formatDate(elements.billDeliveryDate.value);
  elements.prevCustName.textContent = elements.billCustName.value || 'Customer Name';
  elements.prevCustPhone.textContent = elements.billCustPhone.value ? `+91 ${elements.billCustPhone.value}` : '+91 6260808658';
  elements.prevCustAddress.textContent = elements.billCustAddress.value || 'Main Road, Rau, Indore';
  elements.prevStatusPill.textContent = elements.billOrderStatus.value;
  elements.prevPaymentMode.textContent = elements.billPaymentMode.value;

  // Measurements
  if (elements.billMeasurements.value.trim()) {
    elements.prevMeasurementsContainer.style.display = 'block';
    elements.prevMeasurementsText.textContent = elements.billMeasurements.value.trim();
  } else {
    elements.prevMeasurementsContainer.style.display = 'none';
  }

  // Populate preview items table
  elements.prevItemsBody.innerHTML = '';
  if (state.billing.items.length === 0) {
    elements.prevItemsBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #888; padding: 12px;">No items added yet</td>
      </tr>
    `;
  } else {
    state.billing.items.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.description}</td>
        <td style="text-align: center;">${item.qty}</td>
        <td style="text-align: right;">${formatINR(item.rate)}</td>
        <td style="text-align: right;">${formatINR(item.total)}</td>
      `;
      elements.prevItemsBody.appendChild(tr);
    });
  }

  elements.prevSubtotal.textContent = formatINR(state.billing.subtotal);
  elements.prevDiscount.textContent = formatINR(state.billing.discount);
  elements.prevTotal.textContent = formatINR(state.billing.total);
  elements.prevAdvance.textContent = formatINR(state.billing.advance);
  elements.prevBalance.textContent = formatINR(state.billing.balance);
}

// Save Invoice to Database
async function saveCurrentInvoice() {
  const custName = elements.billCustName.value.trim();
  if (!custName) {
    alert('Please enter Customer Name');
    elements.billCustName.focus();
    return;
  }

  const payload = {
    invoiceNo: elements.billInvoiceNo.value,
    customerName: custName,
    phone: elements.billCustPhone.value.trim(),
    address: elements.billCustAddress.value.trim(),
    orderDate: elements.billOrderDate.value,
    deliveryDate: elements.billDeliveryDate.value,
    measurements: elements.billMeasurements.value.trim(),
    items: state.billing.items,
    subtotal: state.billing.subtotal,
    discount: state.billing.discount,
    totalAmount: state.billing.total,
    advancePaid: state.billing.advance,
    balanceDue: state.billing.balance,
    paymentMode: elements.billPaymentMode.value,
    status: elements.billOrderStatus.value,
    notes: elements.billNotes.value.trim()
  };

  try {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Failed to save invoice');
    const data = await res.json();

    // Trigger celebration confetti
    if (typeof confetti === 'function') {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }

    showToast(`🧾 Invoice ${data.invoice.invoiceNo} saved successfully!`);
    await fetchInvoices();
  } catch (err) {
    alert('Error saving bill: ' + err.message);
  }
}

// Download PDF Invoice using html2pdf
function downloadPdfInvoice() {
  const invoiceElement = document.getElementById('printable-invoice');
  const invoiceNo = elements.billInvoiceNo.value || 'NC-Invoice';
  const customerName = (elements.billCustName.value || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');

  showToast('Generating high-resolution PDF Bill...');

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `Nishis_Creations_${invoiceNo}_${customerName}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.5, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(invoiceElement).save().then(() => {
    showToast('✨ PDF Download Complete!');
  }).catch(err => {
    console.error('PDF error:', err);
    window.print();
  });
}

// Direct Print Invoice
window.printInvoiceDirect = function() {
  window.print();
};

// Send Invoice summary via WhatsApp
function sendInvoiceViaWhatsApp() {
  const name = elements.billCustName.value.trim() || 'Customer';
  const phone = elements.billCustPhone.value.trim().replace(/[^0-9]/g, '');
  const billNo = elements.billInvoiceNo.value;
  const delivery = formatDate(elements.billDeliveryDate.value);
  const total = formatINR(state.billing.total);
  const advance = formatINR(state.billing.advance);
  const balance = formatINR(state.billing.balance);

  let itemsSummary = '';
  state.billing.items.forEach(it => {
    itemsSummary += `\n• ${it.description} (x${it.qty}) - ₹${it.total}`;
  });

  const msg = `🌸 *Nishi's Creations - Designer Wear* 🌸
Main Road Rangwasa, Rau, Indore | 📞 6260808658

Namaste *${name}* Ji 🙏
Thank you for choosing Nishi's Creations for your custom stitching!

🧾 *Invoice No:* ${billNo}
👗 *Trial / Delivery Date:* ${delivery}

*Order Items:*${itemsSummary}

💰 *Total Amount:* ${total}
💵 *Advance Paid:* ${advance}
⚠️ *Balance Remaining:* ${balance}

📍 *Boutique Address:* Main Road Rangwasa, Rau, Indore
📸 *Instagram:* @NISHIS_CREATIONS
For queries or updates, call us at *6260808658*. Looking forward to your visit! ✨`;

  const encodedMsg = encodeURIComponent(msg);
  let whatsappUrl = '';
  if (phone) {
    // If Indian 10-digit number without country code
    const fullPhone = phone.length === 10 ? '91' + phone : phone;
    whatsappUrl = `https://wa.me/${fullPhone}?text=${encodedMsg}`;
  } else {
    whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;
  }

  window.open(whatsappUrl, '_blank');
  showToast('Opening WhatsApp with bill details...', 'whatsapp');
}

function resetBillingForm() {
  elements.billCustName.value = '';
  elements.billCustPhone.value = '';
  elements.billCustAddress.value = '';
  elements.billMeasurements.value = '';
  elements.billNotes.value = '';
  elements.billDiscountInput.value = 0;
  elements.billAdvanceInput.value = 0;
  elements.billingItemsBody.innerHTML = '';
  generateNewInvoiceNumber();
  calculateTotals();
  showToast('Billing form reset');
}

// Load product from catalog into bill
window.loadProductIntoBilling = function(productId) {
  const prod = state.products.find(p => p.id === productId);
  if (!prod) return;

  switchToTab('billing-tab');
  addItemRow(prod.title, 1, prod.price || 0);
  showToast(`Added "${prod.title}" to bill!`);
};

// ================= TAB 4: ORDERS & CUSTOMER LEDGER =================
async function fetchInvoices() {
  try {
    const res = await fetch('/api/invoices');
    state.invoices = await res.json();
    renderOrdersLedger();
    updateLedgerStats();
  } catch (err) {
    console.error('Failed to load invoices:', err);
  }
}

function renderOrdersLedger() {
  elements.ordersTableBody.innerHTML = '';

  const query = elements.orderSearchInput.value.toLowerCase().trim();

  const filtered = state.invoices.filter(inv => {
    if (!query) return true;
    return (
      inv.invoiceNo.toLowerCase().includes(query) ||
      inv.customerName.toLowerCase().includes(query) ||
      (inv.phone && inv.phone.includes(query))
    );
  });

  if (filtered.length === 0) {
    elements.ordersTableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fa-solid fa-receipt" style="font-size: 2.5rem; margin-bottom: 8px; opacity: 0.5;"></i>
          <p>No orders found.</p>
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(inv => {
    const tr = document.createElement('tr');

    let statusClass = 'status-in-stitching';
    if (inv.status === 'Ready for Trial') statusClass = 'status-ready';
    if (inv.status === 'Delivered') statusClass = 'status-delivered';

    tr.innerHTML = `
      <td><strong>${inv.invoiceNo}</strong></td>
      <td><strong>${inv.customerName}</strong></td>
      <td>${inv.phone ? `<a href="tel:${inv.phone}" style="color: var(--gold-light); text-decoration: none;"><i class="fa-solid fa-phone"></i> ${inv.phone}</a>` : '-'}</td>
      <td>${formatDate(inv.deliveryDate)}</td>
      <td>${formatINR(inv.totalAmount)}</td>
      <td style="color: #4ade80;">${formatINR(inv.advancePaid)}</td>
      <td style="color: ${inv.balanceDue > 0 ? '#ff7675' : '#4ade80'}; font-weight: 700;">${formatINR(inv.balanceDue)}</td>
      <td>
        <select class="form-input" style="padding: 4px 8px; font-size: 0.78rem;" onchange="updateOrderStatus('${inv.id}', this.value)">
          <option value="In Stitching" ${inv.status === 'In Stitching' ? 'selected' : ''}>In Stitching</option>
          <option value="Ready for Trial" ${inv.status === 'Ready for Trial' ? 'selected' : ''}>Ready for Trial</option>
          <option value="Delivered" ${inv.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
      <td>
        <div class="table-action-btns">
          <button class="btn-tiny" onclick="notifyOrderOnWhatsApp('${inv.id}')" title="Notify Customer on WhatsApp">
            <i class="fa-brands fa-whatsapp" style="color: #25d366;"></i> WhatsApp
          </button>
          <button class="btn-tiny" onclick="loadInvoiceForViewing('${inv.id}')" title="View & Print Bill">
            <i class="fa-solid fa-eye"></i> View
          </button>
        </div>
      </td>
    `;
    elements.ordersTableBody.appendChild(tr);
  });
}

function updateLedgerStats() {
  const totalOrders = state.invoices.length;
  const totalRevenue = state.invoices.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  const totalAdvance = state.invoices.reduce((s, i) => s + (Number(i.advancePaid) || 0), 0);
  const totalBalance = state.invoices.reduce((s, i) => s + (Number(i.balanceDue) || 0), 0);
  const pendingOrders = state.invoices.filter(i => i.status !== 'Delivered').length;

  elements.ordersStatsChips.innerHTML = `
    <div class="stat-chip">
      <span class="val">${totalOrders}</span>
      <span class="lbl">Total Orders</span>
    </div>
    <div class="stat-chip">
      <span class="val" style="color: var(--gold-primary);">${pendingOrders}</span>
      <span class="lbl">Pending Stitching</span>
    </div>
    <div class="stat-chip">
      <span class="val">${formatINR(totalRevenue)}</span>
      <span class="lbl">Total Business</span>
    </div>
    <div class="stat-chip">
      <span class="val" style="color: #4ade80;">${formatINR(totalAdvance)}</span>
      <span class="lbl">Advance Received</span>
    </div>
    <div class="stat-chip">
      <span class="val" style="color: #ff7675;">${formatINR(totalBalance)}</span>
      <span class="lbl">Balance Pending</span>
    </div>
  `;
}

function setupOrdersLedger() {
  elements.orderSearchInput.addEventListener('input', renderOrdersLedger);

  // Status Filter Pills
  document.querySelectorAll('#orders-tab .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#orders-tab .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const st = pill.dataset.status;

      if (st === 'all') {
        renderOrdersLedger();
      } else if (st === 'Balance Due') {
        const filtered = state.invoices.filter(i => i.balanceDue > 0);
        renderOrdersTableWithList(filtered);
      } else {
        const filtered = state.invoices.filter(i => i.status === st);
        renderOrdersTableWithList(filtered);
      }
    });
  });
}

function renderOrdersTableWithList(list) {
  elements.ordersTableBody.innerHTML = '';
  list.forEach(inv => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${inv.invoiceNo}</strong></td>
      <td><strong>${inv.customerName}</strong></td>
      <td>${inv.phone ? `<a href="tel:${inv.phone}" style="color: var(--gold-light); text-decoration: none;"><i class="fa-solid fa-phone"></i> ${inv.phone}</a>` : '-'}</td>
      <td>${formatDate(inv.deliveryDate)}</td>
      <td>${formatINR(inv.totalAmount)}</td>
      <td style="color: #4ade80;">${formatINR(inv.advancePaid)}</td>
      <td style="color: ${inv.balanceDue > 0 ? '#ff7675' : '#4ade80'}; font-weight: 700;">${formatINR(inv.balanceDue)}</td>
      <td>
        <select class="form-input" style="padding: 4px 8px; font-size: 0.78rem;" onchange="updateOrderStatus('${inv.id}', this.value)">
          <option value="In Stitching" ${inv.status === 'In Stitching' ? 'selected' : ''}>In Stitching</option>
          <option value="Ready for Trial" ${inv.status === 'Ready for Trial' ? 'selected' : ''}>Ready for Trial</option>
          <option value="Delivered" ${inv.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
      <td>
        <div class="table-action-btns">
          <button class="btn-tiny" onclick="notifyOrderOnWhatsApp('${inv.id}')" title="Notify Customer on WhatsApp">
            <i class="fa-brands fa-whatsapp" style="color: #25d366;"></i> WhatsApp
          </button>
          <button class="btn-tiny" onclick="loadInvoiceForViewing('${inv.id}')" title="View & Print Bill">
            <i class="fa-solid fa-eye"></i> View
          </button>
        </div>
      </td>
    `;
    elements.ordersTableBody.appendChild(tr);
  });
}

window.updateOrderStatus = async function(id, newStatus) {
  try {
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      showToast(`Order status updated to: ${newStatus}`);
      fetchInvoices();
    }
  } catch (err) {
    alert('Failed to update status');
  }
};

window.notifyOrderOnWhatsApp = function(id) {
  const inv = state.invoices.find(i => i.id === id);
  if (!inv) return;

  const phone = (inv.phone || '').replace(/[^0-9]/g, '');
  const isReady = inv.status === 'Ready for Trial';

  let msg = '';
  if (isReady) {
    msg = `🌸 *Nishi's Creations - Designer Wear* 🌸
Namaste *${inv.customerName}* Ji 🙏

Good news! Your custom stitched outfit (Bill No: *${inv.invoiceNo}*) is now *READY FOR TRIAL* at our boutique! ✨

📍 Please visit us: Main Road Rangwasa, Rau, Indore
📞 Call: 6260808658
Remaining Balance: *${formatINR(inv.balanceDue)}*

Looking forward to seeing your wonderful fit!`;
  } else {
    msg = `🌸 *Nishi's Creations - Designer Wear* 🌸
Namaste *${inv.customerName}* Ji 🙏

Your order *${inv.invoiceNo}* is currently *${inv.status}*.
Expected Delivery / Trial Date: *${formatDate(inv.deliveryDate)}*
Remaining Balance: *${formatINR(inv.balanceDue)}*

📍 Main Road Rangwasa, Rau, Indore • 📞 6260808658`;
  }

  const encoded = encodeURIComponent(msg);
  const fullPhone = phone.length === 10 ? '91' + phone : phone;
  const url = fullPhone ? `https://wa.me/${fullPhone}?text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(url, '_blank');
};

window.loadInvoiceForViewing = function(id) {
  const inv = state.invoices.find(i => i.id === id);
  if (!inv) return;

  elements.billInvoiceNo.value = inv.invoiceNo;
  elements.billCustName.value = inv.customerName;
  elements.billCustPhone.value = inv.phone || '';
  elements.billCustAddress.value = inv.address || '';
  elements.billOrderDate.value = inv.orderDate || '';
  elements.billDeliveryDate.value = inv.deliveryDate || '';
  elements.billMeasurements.value = inv.measurements || '';
  elements.billDiscountInput.value = inv.discount || 0;
  elements.billAdvanceInput.value = inv.advancePaid || 0;
  elements.billPaymentMode.value = inv.paymentMode || 'Cash';
  elements.billOrderStatus.value = inv.status || 'In Stitching';

  // Load items
  elements.billingItemsBody.innerHTML = '';
  if (inv.items && inv.items.length > 0) {
    inv.items.forEach(it => {
      addItemRow(it.description, it.qty, it.rate);
    });
  }

  calculateTotals();
  switchToTab('billing-tab');
  showToast(`Loaded invoice ${inv.invoiceNo}`);
};

// ================= BOUTIQUE SETTINGS =================
async function fetchSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    state.settings = data;
    elements.setName.value = data.boutiqueName || '';
    elements.setTagline.value = data.tagline || '';
    elements.setPhone.value = data.phone || '';
    elements.setInstagram.value = data.instagram || '';
    elements.setUpi.value = data.upiId || '';
    elements.setAddress.value = data.address || '';
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

function setupSettings() {
  elements.settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updated = {
      boutiqueName: elements.setName.value.trim(),
      tagline: elements.setTagline.value.trim(),
      phone: elements.setPhone.value.trim(),
      instagram: elements.setInstagram.value.trim(),
      upiId: elements.setUpi.value.trim(),
      address: elements.setAddress.value.trim()
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        state.settings = updated;
        showToast('✨ Boutique details updated successfully!');
      }
    } catch (err) {
      alert('Failed to save settings');
    }
  });
}

// ================= MOBILE CONNECT MODAL =================
let cachedMobileUrl = `http://${window.location.hostname}:3000`;

async function setupMobileConnect() {
  try {
    const res = await fetch('/api/network-info');
    if (res.ok) {
      const info = await res.json();
      if (info.mobileUrl) {
        cachedMobileUrl = info.mobileUrl;
      }
    }
  } catch (err) {
    console.warn('Could not fetch network info:', err);
  }

  if (elements.btnOpenMobileModal) {
    elements.btnOpenMobileModal.addEventListener('click', () => {
      elements.mobileLinkInput.value = cachedMobileUrl;
      elements.mobileQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(cachedMobileUrl)}&color=12-13-16&bgcolor=ffffff`;
      elements.mobileModal.classList.add('active');
    });
  }

  if (elements.closeMobileModal) {
    elements.closeMobileModal.addEventListener('click', () => {
      elements.mobileModal.classList.remove('active');
    });
  }

  // Close when clicking outside modal box
  if (elements.mobileModal) {
    elements.mobileModal.addEventListener('click', (e) => {
      if (e.target === elements.mobileModal) {
        elements.mobileModal.classList.remove('active');
      }
    });
  }

  if (elements.copyMobileLinkBtn) {
    elements.copyMobileLinkBtn.addEventListener('click', () => {
      elements.mobileLinkInput.select();
      navigator.clipboard.writeText(elements.mobileLinkInput.value);
      showToast('📱 Mobile link copied to clipboard!');
    });
  }
}

