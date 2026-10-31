/**
 * Nishi's Creations - Admin Management Studio
 * Complete Backend Control Engine
 */

const adminState = {
  products: [],
  invoices: [],
  settings: {},
  selectedProductForPost: null,
  studioRatio: 'story',
  billingItems: []
};

// Toast
function showAdminToast(msg) {
  const container = document.getElementById('admin-toast-container');
  const toast = document.createElement('div');
  toast.className = 'admin-toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--admin-green);"></i> <span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupProductsManager();
  setupSocialStudio();
  setupBilling();
  setupOrdersLedger();
  setupSettings();
  setupMobileModal();

  loadAllData();
});

// Setup Admin Nav Tabs
function setupTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');

      if (tab.dataset.tab === 'tab-social') {
        renderCanvas();
      }
    });
  });
}

async function loadAllData() {
  await fetchProducts();
  await fetchInvoices();
  await fetchSettings();
}

// ================= 1. PRODUCTS & MEDIA MANAGER =================
async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    adminState.products = await res.json();
    renderProductsTable();
    populateStudioDropdown();
  } catch (err) {
    console.error('Error fetching products:', err);
  }
}

function renderProductsTable() {
  const tbody = document.getElementById('admin-products-tbody');
  tbody.innerHTML = '';

  const search = document.getElementById('admin-search-input').value.toLowerCase().trim();
  const catFilter = document.getElementById('admin-category-filter').value;

  const filtered = adminState.products.filter(p => {
    const matchCat = catFilter === 'all' || p.category === catFilter;
    const matchSearch = !search || p.title.toLowerCase().includes(search) || (p.fabric && p.fabric.toLowerCase().includes(search));
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--admin-muted); padding: 30px;">No creations found. Click "Add New Creation" above.</td></tr>`;
    return;
  }

  filtered.forEach(p => {
    const tr = document.createElement('tr');

    const isLive = p.isPublished !== false;
    const isVideo = p.mediaType === 'video';

    tr.innerHTML = `
      <td>
        <img src="${p.mediaUrl || '/assets/blouse-sample.jpg'}" alt="${p.title}" class="table-thumb">
      </td>
      <td>
        <strong style="color: var(--admin-dark); display: block;">${p.title}</strong>
        <span style="font-size: 0.78rem; color: var(--admin-muted);">${p.category} ${isVideo ? '• 🎥 Video' : '• 📷 Photo'}</span>
      </td>
      <td>
        <span style="font-size: 0.82rem; color: var(--admin-text);">${p.fabric || '—'}</span>
      </td>
      <td>
        <strong style="color: var(--admin-gold);">${p.price ? '₹' + Number(p.price).toLocaleString('en-IN') : 'Custom'}</strong>
      </td>
      <td>
        <button type="button" class="status-badge ${isLive ? 'status-published' : 'status-draft'}" onclick="togglePublish('${p.id}')" title="Click to toggle Storefront visibility" style="border: none; cursor: pointer;">
          <i class="fa-solid ${isLive ? 'fa-check' : 'fa-eye-slash'}"></i>
          ${isLive ? 'Live on Storefront' : 'Draft / Hidden'}
        </button>
      </td>
      <td style="text-align: right;">
        <div class="action-buttons" style="justify-content: flex-end;">
          <button type="button" class="btn btn-outline btn-sm" onclick="openEditModal('${p.id}')" title="Edit Creation">
            <i class="fa-solid fa-pen"></i> Edit
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="deleteProduct('${p.id}')" title="Delete" style="color: var(--admin-red);">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function setupProductsManager() {
  document.getElementById('admin-search-input').addEventListener('input', renderProductsTable);
  document.getElementById('admin-category-filter').addEventListener('change', renderProductsTable);

  const modal = document.getElementById('product-modal');
  const openBtn = document.getElementById('btn-open-create-modal');
  const closeBtn = document.getElementById('close-product-modal');
  const cancelBtn = document.getElementById('cancel-product-modal');
  const dropzone = document.getElementById('admin-dropzone');
  const fileInput = document.getElementById('form-media-files');
  const form = document.getElementById('product-form');

  // Open Add Modal
  openBtn.addEventListener('click', () => {
    document.getElementById('modal-form-title').textContent = 'Add New Creation';
    document.getElementById('form-product-id').value = '';
    form.reset();
    document.getElementById('form-drop-preview').innerHTML = '';
    document.getElementById('form-published').checked = true;
    modal.classList.add('active');
  });

  const closeModal = () => modal.classList.remove('active');
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Dropzone click & drag
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#111'; });
  dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = '#d1d5db'; });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#d1d5db';
    fileInput.files = e.dataTransfer.files;
    showFilePreviews(fileInput.files);
  });
  fileInput.addEventListener('change', () => showFilePreviews(fileInput.files));

  // Form Submit (Handles both CREATE and UPDATE!)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('form-product-id').value;
    const saveBtn = document.getElementById('save-product-btn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

    const formData = new FormData();
    formData.append('title', document.getElementById('form-title').value.trim());
    formData.append('category', document.getElementById('form-category').value);
    formData.append('price', document.getElementById('form-price').value || 0);
    formData.append('fabric', document.getElementById('form-fabric').value.trim());
    formData.append('description', document.getElementById('form-description').value.trim());
    formData.append('isPublished', document.getElementById('form-published').checked);

    if (fileInput.files.length > 0) {
      Array.from(fileInput.files).forEach(f => formData.append('media', f));
    }

    try {
      const url = id ? `/api/products/${id}` : '/api/products';
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData
      });

      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();

      showAdminToast(id ? '✨ Creation updated successfully!' : '✨ New creation added!');
      closeModal();
      await fetchProducts();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<i class="fa-solid fa-check"></i> Save Changes`;
    }
  });
}

function showFilePreviews(files) {
  const container = document.getElementById('form-drop-preview');
  container.innerHTML = '';
  Array.from(files).forEach(file => {
    const isVid = file.type.startsWith('video/');
    const preview = document.createElement(isVid ? 'video' : 'img');
    preview.style.width = '60px';
    preview.style.height = '60px';
    preview.style.borderRadius = '4px';
    preview.style.objectFit = 'cover';
    preview.style.border = '1px solid #ddd';
    preview.src = URL.createObjectURL(file);
    container.appendChild(preview);
  });
}

window.openEditModal = function(id) {
  const p = adminState.products.find(item => item.id === id);
  if (!p) return;

  document.getElementById('modal-form-title').textContent = 'Edit Creation';
  document.getElementById('form-product-id').value = p.id;
  document.getElementById('form-title').value = p.title || '';
  document.getElementById('form-category').value = p.category || 'Blouses';
  document.getElementById('form-price').value = p.price || '';
  document.getElementById('form-fabric').value = p.fabric || '';
  document.getElementById('form-description').value = p.description || '';
  document.getElementById('form-published').checked = p.isPublished !== false;

  const preview = document.getElementById('form-drop-preview');
  preview.innerHTML = `<img src="${p.mediaUrl}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #ddd;"> <span style="font-size:0.75rem;color:#888;align-self:center;">Current Photo (drop new files to replace)</span>`;

  document.getElementById('product-modal').classList.add('active');
};

window.togglePublish = async function(id) {
  const p = adminState.products.find(item => item.id === id);
  if (!p) return;

  const newStatus = !(p.isPublished !== false);
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: newStatus })
    });
    if (res.ok) {
      showAdminToast(newStatus ? '🟢 Product is now LIVE on storefront' : '🟡 Product hidden as DRAFT');
      fetchProducts();
    }
  } catch (err) {
    alert('Failed to update status');
  }
};

window.deleteProduct = async function(id) {
  if (!confirm('Are you sure you want to delete this creation?')) return;
  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showAdminToast('Creation removed');
      fetchProducts();
    }
  } catch (err) {
    alert('Failed to delete product');
  }
};

// ================= 2. SOCIAL POST & STATUS STUDIO =================
const brandLogo = new Image();
brandLogo.src = '/assets/logo-dark.jpg';

function setupSocialStudio() {
  const formatBtns = document.querySelectorAll('.format-btn');
  formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      formatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      adminState.studioRatio = btn.dataset.ratio;
      renderCanvas();
    });
  });

  ['toggle-logo-overlay', 'toggle-contact-footer', 'toggle-address-strip', 'toggle-gold-border'].forEach(id => {
    document.getElementById(id).addEventListener('change', renderCanvas);
  });

  document.getElementById('studio-overlay-title').addEventListener('input', () => {
    renderCanvas();
    updateCaption();
  });
  document.getElementById('studio-overlay-price').addEventListener('input', () => {
    renderCanvas();
    updateCaption();
  });

  document.getElementById('studio-product-select').addEventListener('change', (e) => {
    const id = e.target.value;
    if (id) {
      const p = adminState.products.find(item => item.id === id);
      if (p) {
        adminState.selectedProductForPost = p;
        document.getElementById('studio-overlay-title').value = p.title;
        document.getElementById('studio-overlay-price').value = p.price ? `₹${p.price}` : 'Custom Fit';
        renderCanvas();
        updateCaption();
      }
    }
  });

  document.getElementById('download-post-image-btn').addEventListener('click', () => {
    const canvas = document.getElementById('studio-canvas');
    const a = document.createElement('a');
    a.download = `Nishis-Creations-${adminState.studioRatio}-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png', 1.0);
    a.click();
    showAdminToast('📸 HD Image downloaded for WhatsApp/Instagram!');
  });

  document.getElementById('copy-caption-btn').addEventListener('click', () => {
    const txt = document.getElementById('studio-caption-text');
    txt.select();
    navigator.clipboard.writeText(txt.value);
    showAdminToast('✨ Caption copied to clipboard!');
  });

  document.getElementById('share-whatsapp-post-btn').addEventListener('click', () => {
    const txt = encodeURIComponent(document.getElementById('studio-caption-text').value);
    window.open(`https://api.whatsapp.com/send?text=${txt}`, '_blank');
  });
}

function populateStudioDropdown() {
  const sel = document.getElementById('studio-product-select');
  sel.innerHTML = '<option value="">-- Choose from Catalog --</option>';
  adminState.products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.category}: ${p.title}`;
    sel.appendChild(opt);
  });
}

function renderCanvas() {
  const canvas = document.getElementById('studio-canvas');
  const ctx = canvas.getContext('2d');

  const isStory = adminState.studioRatio === 'story';
  const width = 1080;
  const height = isStory ? 1920 : 1080;

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = '#0f1015';
  ctx.fillRect(0, 0, width, height);

  // Background Image
  let img = brandLogo;
  if (adminState.selectedProductForPost && adminState.selectedProductForPost.mediaUrl) {
    const temp = new Image();
    temp.crossOrigin = 'anonymous';
    temp.src = adminState.selectedProductForPost.mediaUrl;
    if (temp.complete) {
      img = temp;
    } else {
      temp.onload = () => renderCanvas();
      return;
    }
  }

  // Cover image
  if (img && img.width > 0) {
    const imgRatio = img.width / img.height;
    const targetRatio = width / height;
    let sW = img.width, sH = img.height, sx = 0, sy = 0;
    if (imgRatio > targetRatio) {
      sW = img.height * targetRatio;
      sx = (img.width - sW) / 2;
    } else {
      sH = img.width / targetRatio;
      sy = (img.height - sH) / 2;
    }
    ctx.drawImage(img, sx, sy, sW, sH, 0, 0, width, height);
  }

  // Vignette top & bottom
  const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.35);
  topGrad.addColorStop(0, 'rgba(10, 11, 15, 0.95)');
  topGrad.addColorStop(1, 'rgba(10, 11, 15, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, width, height * 0.35);

  const btmGrad = ctx.createLinearGradient(0, height * 0.6, 0, height);
  btmGrad.addColorStop(0, 'rgba(10, 11, 15, 0)');
  btmGrad.addColorStop(1, 'rgba(10, 11, 15, 0.96)');
  ctx.fillStyle = btmGrad;
  ctx.fillRect(0, height * 0.6, width, height * 0.4);

  // Gold Border
  if (document.getElementById('toggle-gold-border').checked) {
    ctx.save();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, width - 72, height - 72);
    ctx.restore();
  }

  // Top Logo
  if (document.getElementById('toggle-logo-overlay').checked) {
    ctx.save();
    const logoSize = 120;
    const logoX = (width - logoSize) / 2;
    const logoY = isStory ? 90 : 50;

    ctx.save();
    ctx.beginPath();
    ctx.arc(logoX + 60, logoY + 60, 60, 0, Math.PI * 2);
    ctx.clip();
    if (brandLogo.complete) ctx.drawImage(brandLogo, logoX, logoY, logoSize, logoSize);
    ctx.restore();

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(logoX + 60, logoY + 60, 60, 0, Math.PI * 2);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '700 46px "Playfair Display", serif';
    ctx.fillStyle = '#f5e4a8';
    ctx.fillText("Nishi's Creations", width / 2, logoY + logoSize + 54);

    ctx.font = '600 20px "Cinzel", serif';
    ctx.letterSpacing = '5px';
    ctx.fillStyle = '#d4af37';
    ctx.fillText("DESIGNER WEAR • INDORE", width / 2, logoY + logoSize + 84);
    ctx.restore();
  }

  // Titles
  const title = document.getElementById('studio-overlay-title').value;
  const price = document.getElementById('studio-overlay-price').value;

  if (title || price) {
    ctx.save();
    const infoY = isStory ? height - 360 : height - 240;
    if (title) {
      ctx.textAlign = 'center';
      ctx.font = '700 38px "Playfair Display", serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title, width / 2, infoY);
    }
    if (price) {
      ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
      const tw = ctx.measureText(price).width;
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect((width - tw - 40) / 2, infoY + 20, tw + 40, 44);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.strokeRect((width - tw - 40) / 2, infoY + 20, tw + 40, 44);
      ctx.fillStyle = '#f5d77f';
      ctx.textAlign = 'center';
      ctx.fillText(price, width / 2, infoY + 52);
    }
    ctx.restore();
  }

  // Contact Footer
  if (document.getElementById('toggle-contact-footer').checked) {
    ctx.save();
    const footerY = height - 130;
    ctx.textAlign = 'center';
    ctx.font = '700 22px "Cinzel", serif';
    ctx.fillStyle = '#f5d77f';
    ctx.fillText("BOOK AN APPOINTMENT", width / 2, footerY);

    ctx.font = '700 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText("📞 6260808658 • 💬 WhatsApp: 9516482651", width / 2, footerY + 40);

    if (document.getElementById('toggle-address-strip').checked) {
      ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#cccccc';
      ctx.fillText("📸 @NISHIS_CREATIONS • Main Road Rangwasa, Rau", width / 2, footerY + 74);
    }
    ctx.restore();
  }
}

function updateCaption() {
  const p = adminState.selectedProductForPost;
  const title = document.getElementById('studio-overlay-title').value || (p ? p.title : "New Stitching Creation");
  const price = document.getElementById('studio-overlay-price').value || (p && p.price ? `₹${p.price}` : "Custom Fit");

  const caption = `✨ Nishi's Creations - Designer Wear ✨
New Arrival: *${title}* 🥻

🏷️ Stitching / Order Rate: ${price}
🧵 Custom tailored to your exact measurements with premium finish.

📍 Visit Boutique: Main Road Rangwasa, Rau, Indore
📞 Calling / Appointments: 6260808658
💬 WhatsApp: 9516482651
📸 Instagram: @NISHIS_CREATIONS

WhatsApp us directly on 9516482651 for orders and custom stitching! 🌸
#NishisCreations #IndoreBoutique #DesignerBlouse #LehengaCholi #BhagwanPoshak #CustomStitching`;

  document.getElementById('studio-caption-text').value = caption;
}

// ================= 3. BOUTIQUE BILLING & PDF =================
function setupBilling() {
  const addItemBtn = document.getElementById('add-item-row-btn');
  addItemBtn.addEventListener('click', () => addBillingRow('', 1, 0));

  ['bill-cust-name', 'bill-cust-phone', 'bill-cust-address', 'bill-delivery-date', 'bill-measurements'].forEach(id => {
    document.getElementById(id).addEventListener('input', syncInvoicePreview);
  });

  document.getElementById('bill-discount-input').addEventListener('input', calculateInvoiceTotals);
  document.getElementById('bill-advance-input').addEventListener('input', calculateInvoiceTotals);

  // Set default bill number
  document.getElementById('bill-invoice-no').value = `NC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  
  const d = new Date();
  d.setDate(d.getDate() + 5);
  document.getElementById('bill-delivery-date').value = d.toISOString().split('T')[0];

  addBillingRow('Designer Bridal Blouse Stitching (Padded)', 1, 1200);

  // Save invoice
  document.getElementById('save-invoice-btn').addEventListener('click', async () => {
    const custName = document.getElementById('bill-cust-name').value.trim();
    if (!custName) {
      alert('Please enter customer name');
      return;
    }

    const payload = {
      invoiceNo: document.getElementById('bill-invoice-no').value,
      customerName: custName,
      phone: document.getElementById('bill-cust-phone').value.trim(),
      address: document.getElementById('bill-cust-address').value.trim(),
      deliveryDate: document.getElementById('bill-delivery-date').value,
      measurements: document.getElementById('bill-measurements').value.trim(),
      items: adminState.billingItems,
      subtotal: adminState.billingSubtotal,
      discount: Number(document.getElementById('bill-discount-input').value) || 0,
      totalAmount: adminState.billingTotal,
      advancePaid: Number(document.getElementById('bill-advance-input').value) || 0,
      balanceDue: adminState.billingBalance,
      status: 'In Stitching'
    };

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (typeof confetti === 'function') confetti({ particleCount: 50 });
        showAdminToast('🧾 Order bill saved successfully!');
        fetchInvoices();
      }
    } catch (err) {
      alert('Error saving bill: ' + err.message);
    }
  });

  // Download PDF
  document.getElementById('print-pdf-btn').addEventListener('click', () => {
    const el = document.getElementById('printable-invoice');
    const billNo = document.getElementById('bill-invoice-no').value;
    const name = document.getElementById('bill-cust-name').value || 'Customer';

    showAdminToast('Generating PDF Bill...');
    html2pdf().set({
      margin: 10,
      filename: `Bill_${billNo}_${name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(el).save();
  });

  // WhatsApp Bill
  document.getElementById('send-whatsapp-bill-btn').addEventListener('click', () => {
    const name = document.getElementById('bill-cust-name').value || 'Customer';
    const phone = document.getElementById('bill-cust-phone').value.replace(/[^0-9]/g, '');
    const billNo = document.getElementById('bill-invoice-no').value;
    const delivery = document.getElementById('bill-delivery-date').value;

    const msg = `🌸 *Nishi's Creations - Designer Wear* 🌸
Main Road Rangwasa, Rau, Indore | 📞 Call: 6260808658 | 💬 WhatsApp: 9516482651

Namaste *${name}* Ji 🙏
Thank you for your order at Nishi's Creations!

🧾 *Bill No:* ${billNo}
👗 *Trial / Delivery Date:* ${delivery}
💰 *Total Amount:* ₹${adminState.billingTotal}
💵 *Advance Paid:* ₹${document.getElementById('bill-advance-input').value}
⚠️ *Balance Remaining:* ₹${adminState.billingBalance}

Visit: Main Road Rangwasa, Rau, Indore • 📞 6260808658`;

    const fullPhone = phone.length === 10 ? '91' + phone : phone;
    const url = fullPhone ? `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  });
}

function addBillingRow(desc = '', qty = 1, rate = 0) {
  const tbody = document.getElementById('billing-items-body');
  const tr = document.createElement('tr');
  const rowId = 'row-' + Date.now() + Math.random().toString(36).substring(2, 5);
  tr.id = rowId;

  tr.innerHTML = `
    <td><input type="text" class="form-input row-desc" value="${desc}" placeholder="Item" style="padding: 4px 8px;"></td>
    <td><input type="number" class="form-input row-qty" value="${qty}" min="1" style="padding: 4px 8px; text-align: center;"></td>
    <td><input type="number" class="form-input row-rate" value="${rate}" min="0" style="padding: 4px 8px; text-align: right;"></td>
    <td style="text-align: right; font-weight: 600;" class="row-total">₹${qty * rate}</td>
    <td style="text-align: center;">
      <button type="button" onclick="document.getElementById('${rowId}').remove(); calculateInvoiceTotals();" style="border:none;background:none;color:#dc2626;cursor:pointer;">&times;</button>
    </td>
  `;
  tbody.appendChild(tr);

  tr.querySelector('.row-desc').addEventListener('input', syncInvoicePreview);
  tr.querySelector('.row-qty').addEventListener('input', () => { updateRowTotal(tr); calculateInvoiceTotals(); });
  tr.querySelector('.row-rate').addEventListener('input', () => { updateRowTotal(tr); calculateInvoiceTotals(); });

  calculateInvoiceTotals();
}

function updateRowTotal(tr) {
  const q = Number(tr.querySelector('.row-qty').value) || 0;
  const r = Number(tr.querySelector('.row-rate').value) || 0;
  tr.querySelector('.row-total').textContent = `₹${q * r}`;
}

function calculateInvoiceTotals() {
  const rows = document.querySelectorAll('#billing-items-body tr');
  let subtotal = 0;
  const items = [];

  rows.forEach(r => {
    const desc = r.querySelector('.row-desc').value.trim();
    const qty = Number(r.querySelector('.row-qty').value) || 0;
    const rate = Number(r.querySelector('.row-rate').value) || 0;
    const total = qty * rate;
    subtotal += total;
    if (desc) items.push({ description: desc, qty, rate, total });
  });

  const discount = Number(document.getElementById('bill-discount-input').value) || 0;
  const total = Math.max(0, subtotal - discount);
  const advance = Number(document.getElementById('bill-advance-input').value) || 0;
  const balance = Math.max(0, total - advance);

  adminState.billingItems = items;
  adminState.billingSubtotal = subtotal;
  adminState.billingTotal = total;
  adminState.billingBalance = balance;

  document.getElementById('bill-subtotal-disp').textContent = `₹${subtotal}`;
  document.getElementById('bill-total-disp').textContent = `₹${total}`;
  document.getElementById('bill-balance-disp').textContent = `₹${balance}`;

  syncInvoicePreview();
}

function syncInvoicePreview() {
  document.getElementById('prev-bill-no').textContent = document.getElementById('bill-invoice-no').value;
  document.getElementById('prev-cust-name').textContent = document.getElementById('bill-cust-name').value || 'Customer Name';
  document.getElementById('prev-cust-phone').textContent = document.getElementById('bill-cust-phone').value || '+91 00000 00000';
  document.getElementById('prev-cust-address').textContent = document.getElementById('bill-cust-address').value || 'Main Road, Rau, Indore';
  document.getElementById('prev-delivery').textContent = document.getElementById('bill-delivery-date').value || '—';

  const m = document.getElementById('bill-measurements').value.trim();
  const mBox = document.getElementById('prev-measurements-container');
  if (m) {
    mBox.style.display = 'block';
    document.getElementById('prev-measurements-text').textContent = m;
  } else {
    mBox.style.display = 'none';
  }

  const prevItems = document.getElementById('prev-items-body');
  prevItems.innerHTML = '';
  adminState.billingItems.forEach(it => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding: 6px 8px; border-bottom: 1px solid #eee;">${it.description}</td>
      <td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid #eee;">${it.qty}</td>
      <td style="padding: 6px 8px; text-align: right; border-bottom: 1px solid #eee;">₹${it.rate}</td>
      <td style="padding: 6px 8px; text-align: right; border-bottom: 1px solid #eee; font-weight: 600;">₹${it.total}</td>
    `;
    prevItems.appendChild(tr);
  });

  document.getElementById('prev-subtotal').textContent = `₹${adminState.billingSubtotal || 0}`;
  document.getElementById('prev-discount').textContent = `₹${document.getElementById('bill-discount-input').value || 0}`;
  document.getElementById('prev-total').textContent = `₹${adminState.billingTotal || 0}`;
  document.getElementById('prev-advance').textContent = `₹${document.getElementById('bill-advance-input').value || 0}`;
  document.getElementById('prev-balance').textContent = `₹${adminState.billingBalance || 0}`;
}

// ================= 4. ORDERS LEDGER =================
async function fetchInvoices() {
  try {
    const res = await fetch('/api/invoices');
    adminState.invoices = await res.json();
    renderOrdersTable();
  } catch (err) {
    console.error('Error fetching invoices:', err);
  }
}

function renderOrdersTable() {
  const tbody = document.getElementById('admin-orders-tbody');
  tbody.innerHTML = '';

  if (adminState.invoices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--admin-muted); padding: 30px;">No orders found.</td></tr>`;
    return;
  }

  adminState.invoices.forEach(inv => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${inv.invoiceNo}</strong></td>
      <td><strong>${inv.customerName}</strong></td>
      <td>${inv.phone ? `<a href="tel:${inv.phone}" style="color: var(--admin-dark); text-decoration: none;">📞 ${inv.phone}</a>` : '—'}</td>
      <td>${inv.deliveryDate || '—'}</td>
      <td>₹${Number(inv.totalAmount).toLocaleString('en-IN')}</td>
      <td style="color: var(--admin-green);">₹${Number(inv.advancePaid).toLocaleString('en-IN')}</td>
      <td style="color: ${inv.balanceDue > 0 ? '#dc2626' : 'var(--admin-green)'}; font-weight: 700;">₹${Number(inv.balanceDue).toLocaleString('en-IN')}</td>
      <td>
        <select class="form-input" style="padding: 2px 6px; font-size: 0.78rem;" onchange="updateOrderStatus('${inv.id}', this.value)">
          <option value="In Stitching" ${inv.status === 'In Stitching' ? 'selected' : ''}>In Stitching</option>
          <option value="Ready for Trial" ${inv.status === 'Ready for Trial' ? 'selected' : ''}>Ready for Trial</option>
          <option value="Delivered" ${inv.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
      <td style="text-align: right;">
        <button type="button" class="btn btn-outline btn-sm" onclick="pingOrderWhatsApp('${inv.id}')" title="WhatsApp Customer" style="color: #25d366;">
          <i class="fa-brands fa-whatsapp"></i> WhatsApp
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.updateOrderStatus = async function(id, status) {
  try {
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      showAdminToast(`Order status updated: ${status}`);
      fetchInvoices();
    }
  } catch (e) {
    alert('Error updating status');
  }
};

window.pingOrderWhatsApp = function(id) {
  const inv = adminState.invoices.find(i => i.id === id);
  if (!inv) return;
  const phone = (inv.phone || '').replace(/[^0-9]/g, '');
  const msg = `Namaste ${inv.customerName} Ji! 🙏 Your order (${inv.invoiceNo}) at Nishi's Creations is currently: *${inv.status}*. Expected delivery date: ${inv.deliveryDate}. Main Road Rangwasa, Rau, Indore.`;
  const full = phone.length === 10 ? '91' + phone : phone;
  window.open(`https://wa.me/${full}?text=${encodeURIComponent(msg)}`, '_blank');
};

// ================= 5. SETTINGS =================
async function fetchSettings() {
  try {
    const res = await fetch('/api/settings');
    adminState.settings = await res.json();
    document.getElementById('set-name').value = adminState.settings.boutiqueName || '';
    document.getElementById('set-tagline').value = adminState.settings.tagline || '';
    document.getElementById('set-phone').value = adminState.settings.phone || '';
    if (document.getElementById('set-whatsapp')) {
      document.getElementById('set-whatsapp').value = adminState.settings.whatsapp || '9516482651';
    }
    document.getElementById('set-instagram').value = adminState.settings.instagram || '';
    document.getElementById('set-address').value = adminState.settings.address || '';
  } catch (err) {
    console.error('Error fetching settings:', err);
  }
}

function setupSettings() {
  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const updated = {
      boutiqueName: document.getElementById('set-name').value.trim(),
      tagline: document.getElementById('set-tagline').value.trim(),
      phone: document.getElementById('set-phone').value.trim(),
      whatsapp: document.getElementById('set-whatsapp') ? document.getElementById('set-whatsapp').value.trim() : '9516482651',
      instagram: document.getElementById('set-instagram').value.trim(),
      address: document.getElementById('set-address').value.trim()
    };
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        showAdminToast('✨ Settings saved!');
      }
    } catch (err) {
      alert('Error saving settings');
    }
  });
}

// ================= 6. MOBILE QR MODAL =================
function setupMobileModal() {
  const modal = document.getElementById('admin-mobile-modal');
  const openBtn = document.getElementById('btn-admin-mobile-qr');
  const closeBtn = document.getElementById('close-admin-mobile-modal');
  const linkInput = document.getElementById('admin-qr-link');
  const qrImg = document.getElementById('admin-qr-img');
  const copyBtn = document.getElementById('btn-copy-qr-link');

  openBtn.addEventListener('click', async () => {
    let url = 'https://div-hourly-converter-poor.trycloudflare.com';
    try {
      const res = await fetch('/api/network-info');
      if (res.ok) {
        const info = await res.json();
        url = info.cloudflareUrl || info.mobileUrl || url;
      }
    } catch (e) {}

    linkInput.value = url;
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
    modal.classList.add('active');
  });

  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  copyBtn.addEventListener('click', () => {
    linkInput.select();
    navigator.clipboard.writeText(linkInput.value);
    showAdminToast('Link copied to clipboard!');
  });
}
