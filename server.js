const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Default Settings
const defaultSettings = {
  boutiqueName: "Nishi's Creations",
  tagline: "DESIGNER WEAR",
  phone: "6260808658",
  instagram: "@NISHIS_CREATIONS",
  address: "Main Road Rangwasa, Rau, Indore",
  upiId: "6260808658@upi",
  terms: [
    "50% advance required at the time of order confirmation.",
    "Please bring original invoice or digital bill copy during delivery.",
    "Free fitting trials & minor alterations valid within 7 days of delivery.",
    "Custom stitched outfits are crafted with care as per provided measurements."
  ]
};

// Helper functions for JSON database
function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Seed initial data if empty
function initializeData() {
  if (!fs.existsSync(SETTINGS_FILE)) {
    writeJson(SETTINGS_FILE, defaultSettings);
  }

  const existingProducts = readJson(PRODUCTS_FILE, []);
  if (existingProducts.length === 0) {
    const sampleProducts = [
      {
        id: "prod-1",
        title: "Royal Peacock Bridal Blouse",
        category: "Blouses",
        price: 2400,
        fabric: "Pure Raw Silk with Zardozi & Maggam Work",
        description: "Intricate hand embroidery with peacock motifs, golden beads, and padded finish with designer back cut.",
        mediaType: "image",
        mediaUrl: "/assets/logo-dark.jpg",
        tags: ["Bridal", "Aari Work", "Silk", "Designer Blouse"],
        createdAt: new Date().toISOString()
      },
      {
        id: "prod-2",
        title: "Festive Crimson Silk Lehenga",
        category: "Lehenga",
        price: 8500,
        fabric: "Banarasi Georgette with Gotta Patti Border",
        description: "16-kali full flare lehenga paired with customized designer choli and scalloped dupatta.",
        mediaType: "image",
        mediaUrl: "/assets/logo-light.jpg",
        tags: ["Lehenga", "Wedding", "Full Flare", "Banarasi"],
        createdAt: new Date().toISOString()
      },
      {
        id: "prod-3",
        title: "Little Princess Birthday Gown",
        category: "Child Dresses",
        price: 1800,
        fabric: "Soft Organza with Cotton Inner Lining",
        description: "Fluffy layered party dress with handcrafted floral bow and itch-free soft lining for kids.",
        mediaType: "image",
        mediaUrl: "/assets/logo-light.jpg",
        tags: ["Kids Wear", "Frock", "Organza", "Birthday"],
        createdAt: new Date().toISOString()
      },
      {
        id: "prod-4",
        title: "Laddu Gopal Ji Velvet Poshak",
        category: "Bhagwan Poshak",
        price: 950,
        fabric: "Heavy Velvet with Stone & Moti Border",
        description: "Handmade divine dress set for Laddu Gopal Ji including Pagdi, Patka, and designer mukut matching work.",
        mediaType: "image",
        mediaUrl: "/assets/logo-dark.jpg",
        tags: ["Bhagwan Poshak", "Laddu Gopal", "Velvet", "Pooja Vastra"],
        createdAt: new Date().toISOString()
      }
    ];
    writeJson(PRODUCTS_FILE, sampleProducts);
  }

  const existingInvoices = readJson(INVOICES_FILE, []);
  if (existingInvoices.length === 0) {
    const sampleInvoices = [
      {
        id: "inv-101",
        invoiceNo: "NC-2026-101",
        customerName: "Pooja Sharma",
        phone: "9826012345",
        address: "Silicon City, Rau, Indore",
        orderDate: "2026-10-25",
        deliveryDate: "2026-11-04",
        measurements: "Blouse: Chest 36, Waist 30, Length 14.5, Front Deep 6.5, Back Deep 9.5, Sleeve 10",
        items: [
          { description: "Designer Bridal Blouse Stitching (Padded)", qty: 1, rate: 1200, total: 1200 },
          { description: "Maggam Hand Embroidery & Latkan", qty: 1, rate: 1500, total: 1500 },
          { description: "Saree Fall & Pico Finishing", qty: 2, rate: 120, total: 240 }
        ],
        subtotal: 2940,
        discount: 140,
        totalAmount: 2800,
        advancePaid: 1500,
        balanceDue: 1300,
        paymentMode: "UPI / GPay",
        status: "In Stitching",
        notes: "Trial on 2nd Nov before final hook & latkan fixing.",
        createdAt: new Date().toISOString()
      }
    ];
    writeJson(INVOICES_FILE, sampleInvoices);
  }
}

initializeData();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'nishi-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250MB for video files
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif|mp4|webm|mov|mkv|avi|heic/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
    if (mimetype || extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and videos are supported!'));
  }
});

// ================= API ROUTES =================

// Settings
app.get('/api/settings', (req, res) => {
  const settings = readJson(SETTINGS_FILE, defaultSettings);
  res.json(settings);
});

app.post('/api/settings', (req, res) => {
  const current = readJson(SETTINGS_FILE, defaultSettings);
  const updated = { ...current, ...req.body };
  writeJson(SETTINGS_FILE, updated);
  res.json({ success: true, settings: updated });
});

// Admin Portal Page
app.get('/admin', (req, res) => {
  res.redirect('/admin.html');
});

// Products: Get All (supports ?publishedOnly=true)
app.get('/api/products', (req, res) => {
  const products = readJson(PRODUCTS_FILE, []);
  if (req.query.publishedOnly === 'true') {
    return res.json(products.filter(p => p.isPublished !== false));
  }
  res.json(products);
});

// Products: Add Product with Uploaded Media
app.post('/api/products', upload.array('media', 10), (req, res) => {
  try {
    const products = readJson(PRODUCTS_FILE, []);
    const { title, category, price, fabric, description, tags, isPublished } = req.body;

    const files = req.files || [];
    let mediaItems = [];

    if (files.length > 0) {
      mediaItems = files.map(file => {
        const isVideo = file.mimetype.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.originalname);
        return {
          filename: file.filename,
          url: `/uploads/${file.filename}`,
          type: isVideo ? 'video' : 'image',
          originalName: file.originalname,
          size: file.size
        };
      });
    }

    const newProduct = {
      id: 'prod-' + Date.now(),
      title: title || 'New Boutique Stitching',
      category: category || 'Blouses',
      price: Number(price) || 0,
      fabric: fabric || '',
      description: description || '',
      tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : (tags || []),
      media: mediaItems,
      mediaType: mediaItems.length > 0 ? mediaItems[0].type : 'image',
      mediaUrl: mediaItems.length > 0 ? mediaItems[0].url : (req.body.mediaUrl || '/assets/blouse-sample.jpg'),
      isPublished: isPublished === 'false' ? false : true,
      createdAt: new Date().toISOString()
    };

    products.unshift(newProduct);
    writeJson(PRODUCTS_FILE, products);

    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Products: Update / Edit Product
app.put('/api/products/:id', upload.array('media', 10), (req, res) => {
  try {
    const products = readJson(PRODUCTS_FILE, []);
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existing = products[index];
    const { title, category, price, fabric, description, tags, isPublished, mediaUrl } = req.body;

    let mediaItems = existing.media || [];
    let mediaType = existing.mediaType || 'image';
    let finalMediaUrl = mediaUrl || existing.mediaUrl;

    const files = req.files || [];
    if (files.length > 0) {
      const newMedia = files.map(file => {
        const isVideo = file.mimetype.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.originalname);
        return {
          filename: file.filename,
          url: `/uploads/${file.filename}`,
          type: isVideo ? 'video' : 'image',
          originalName: file.originalname,
          size: file.size
        };
      });
      mediaItems = [...newMedia, ...mediaItems];
      mediaType = newMedia[0].type;
      finalMediaUrl = newMedia[0].url;
    }

    products[index] = {
      ...existing,
      title: title !== undefined ? title : existing.title,
      category: category !== undefined ? category : existing.category,
      price: price !== undefined ? Number(price) : existing.price,
      fabric: fabric !== undefined ? fabric : existing.fabric,
      description: description !== undefined ? description : existing.description,
      tags: tags !== undefined ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags) : existing.tags,
      isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : existing.isPublished,
      media: mediaItems,
      mediaType: mediaType,
      mediaUrl: finalMediaUrl,
      updatedAt: new Date().toISOString()
    };

    writeJson(PRODUCTS_FILE, products);
    res.json({ success: true, product: products[index] });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Products: Delete
app.delete('/api/products/:id', (req, res) => {
  const products = readJson(PRODUCTS_FILE, []);
  const productIndex = products.findIndex(p => p.id === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const [removed] = products.splice(productIndex, 1);

  // Clean up uploaded files if present
  if (removed.media && Array.isArray(removed.media)) {
    removed.media.forEach(m => {
      const diskPath = path.join(__dirname, 'public', m.url);
      if (fs.existsSync(diskPath) && m.url.startsWith('/uploads/')) {
        try { fs.unlinkSync(diskPath); } catch (e) { /* ignore */ }
      }
    });
  }

  writeJson(PRODUCTS_FILE, products);
  res.json({ success: true, removed });
});

// Invoices: Get All
app.get('/api/invoices', (req, res) => {
  const invoices = readJson(INVOICES_FILE, []);
  res.json(invoices);
});

// Invoices: Create
app.post('/api/invoices', (req, res) => {
  try {
    const invoices = readJson(INVOICES_FILE, []);
    const data = req.body;

    // Generate Invoice Number if not provided
    const nextNum = invoices.length + 101;
    const invoiceNo = data.invoiceNo || `NC-${new Date().getFullYear()}-${nextNum}`;

    const newInvoice = {
      id: 'inv-' + Date.now(),
      invoiceNo: invoiceNo,
      customerName: data.customerName || 'Customer',
      phone: data.phone || '',
      address: data.address || '',
      orderDate: data.orderDate || new Date().toISOString().split('T')[0],
      deliveryDate: data.deliveryDate || '',
      measurements: data.measurements || '',
      items: Array.isArray(data.items) ? data.items : [],
      subtotal: Number(data.subtotal) || 0,
      discount: Number(data.discount) || 0,
      totalAmount: Number(data.totalAmount) || 0,
      advancePaid: Number(data.advancePaid) || 0,
      balanceDue: Number(data.balanceDue) || 0,
      paymentMode: data.paymentMode || 'Cash',
      status: data.status || 'Pending',
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };

    invoices.unshift(newInvoice);
    writeJson(INVOICES_FILE, invoices);

    res.status(201).json({ success: true, invoice: newInvoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Invoices: Update
app.put('/api/invoices/:id', (req, res) => {
  const invoices = readJson(INVOICES_FILE, []);
  const index = invoices.findIndex(i => i.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  invoices[index] = { ...invoices[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJson(INVOICES_FILE, invoices);

  res.json({ success: true, invoice: invoices[index] });
});

// Invoices: Delete
app.delete('/api/invoices/:id', (req, res) => {
  const invoices = readJson(INVOICES_FILE, []);
  const index = invoices.findIndex(i => i.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const [removed] = invoices.splice(index, 1);
  writeJson(INVOICES_FILE, invoices);

  res.json({ success: true, removed });
});

// Stats summary
app.get('/api/stats', (req, res) => {
  const products = readJson(PRODUCTS_FILE, []);
  const invoices = readJson(INVOICES_FILE, []);

  const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalAdvance = invoices.reduce((sum, inv) => sum + (Number(inv.advancePaid) || 0), 0);
  const totalBalanceDue = invoices.reduce((sum, inv) => sum + (Number(inv.balanceDue) || 0), 0);
  const pendingOrders = invoices.filter(inv => inv.status !== 'Delivered').length;

  res.json({
    totalProducts: products.length,
    totalOrders: invoices.length,
    pendingOrders,
    totalRevenue,
    totalAdvance,
    totalBalanceDue
  });
});

// Network Info Route (for mobile connection)
const os = require('os');
function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Cloudflare Tunnel URL
const CLOUDFLARE_TUNNEL_URL = 'https://div-hourly-converter-poor.trycloudflare.com';

app.get('/api/network-info', (req, res) => {
  const localIp = getLocalNetworkIp();
  res.json({
    localIp,
    port: PORT,
    cloudflareUrl: CLOUDFLARE_TUNNEL_URL,
    mobileUrl: CLOUDFLARE_TUNNEL_URL || `http://${localIp}:${PORT}`,
    localWifiUrl: `http://${localIp}:${PORT}`,
    desktopUrl: `http://localhost:${PORT}`
  });
});

// Start Server explicitly listening on 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalNetworkIp();
  console.log(`====================================================`);
  console.log(`🌸 Nishi's Creations - Boutique Management System 🌸`);
  console.log(`💻 Desktop Access: http://localhost:${PORT}`);
  console.log(`📱 Mobile Access:  http://${localIp}:${PORT}`);
  console.log(`====================================================`);
});

