import React, { useState, useRef, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, BarChart, Bar } from 'recharts';
import Footer from '../Footer';
import { sellerProductService, CreateProductRequest } from '../services/sellerProductService';

// --- INTERFACE DEFINITIONS ---
interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  imageUrl: string; // Base64 string or image URL
  sizeOptions: string[];
  description: string;
}

interface Order {
  id: string;
  customerName: string;
  customerDetails: { email: string, phone: string, address: string }; // Extended for modal
  productId: number; // Link to Product
  productName: string;
  productImage: string; // The URL/Base64
  price: number; // Price per unit at time of order
  quantity: number;
  totalCost: number; // Calculated cost
  status: string;
  date: string; // Date and time
}

// Status options for the new dropdown
const STATUS_OPTIONS = ['Order Placed', 'Out for Delivery', 'Delivered', 'Cancelled'];


// --- ACTION ITEM DATA (UNCHANGED) ---
const actionItems = [
  {
    title: 'Add New Product',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-green-50',
    hover: 'hover:bg-green-100',
    action: 'addProduct'
  },
  {
    title: 'Update Existing Product',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H10v-1.828l8.586-8.586z" />
      </svg>
    ),
    color: 'bg-green-50',
    hover: 'hover:bg-green-100',
    action: 'updateProduct'
  },
  {
    title: 'View Orders',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5h6" />
      </svg>
    ),
    color: 'bg-green-50',
    hover: 'hover:bg-green-100',
    action: 'viewOrders'
  },
  {
    title: 'Analyze Sales Data',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-green-50',
    hover: 'hover:bg-green-100',
    action: 'analyzeSales'
  },
];

interface ActionCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  hover: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, icon, color, hover, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-start p-6 ${color} ${hover} rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-[1.02] border-2 border-transparent hover:border-green-300 w-full text-left`}
  >
    <div className="flex items-center space-x-3 mb-2">
      <div className="p-3 bg-white rounded-full shadow-md">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
  </button>
);

// --- STYLES (Inline CSS for demonstration) ---
const styles: Record<string, any> = {
  // Form Styles (used by Add/Update Product)
  formContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '5px', fontWeight: 'bold' },
  input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '90%' },
  textarea: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical', minHeight: '80px', width: '90%' },
  submitButton: { padding: '10px 20px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '200px', marginTop: '10px' },
  // General Styles for View Orders (mostly replaced by Tailwind)
  // ...
};

// Mock alert function to prevent browser dialogs
const customAlert = (message: string) => {
  console.log('ALERT:', message);
  // In a real app, this would be a custom modal or toast
};



// --- 1. Add New Product Component ---
const AddNewProduct = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '', description: '', mrpPrice: '', sellingPrice: '',
    images: [] as string[], sizes: '', category: '', category2: '', location: '', quantity: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, images: [base64String] }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, images: [] }));
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.jwt) {
      customAlert('You must be logged in to add products.');
      return;
    }

    if (formData.images.length === 0) {
      customAlert('Please select an image file before saving the product.');
      return;
    }

    if (!formData.category) {
      customAlert('Please select a category.');
      return;
    }

    setIsSubmitting(true);

    try {
      const productRequest: CreateProductRequest = {
        title: formData.title,
        description: formData.description,
        mrpPrice: parseInt(formData.mrpPrice) || 0,
        sellingPrice: parseInt(formData.sellingPrice) || 0,
        images: formData.images,
        sizes: formData.sizes,
        category: formData.category,
        category2: formData.category2 || undefined,
        location: formData.location,
        quantity: parseInt(formData.quantity) || 0
      };

      await sellerProductService.createProduct(productRequest, user.jwt);
      // Display the exact success message requested
      customAlert('New product added successfully');

      // Reset form
      setFormData({
        title: '', description: '', mrpPrice: '', sellingPrice: '',
        images: [], sizes: '', category: '', category2: '', location: '', quantity: ''
      });
      setImagePreview(null);
    } catch (error: any) {
      console.error('Error creating product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create product. Please try again.';
      customAlert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const productFields = [
    { label: "Product Title", stateKey: "title", type: "text", placeholder: "e.g., Marigold Seed Packet", required: true },
    { label: "MRP Price (₹)", stateKey: "mrpPrice", type: "number", placeholder: "e.g., 185", required: true },
    { label: "Selling Price (₹)", stateKey: "sellingPrice", type: "number", placeholder: "e.g., 120", required: true },
    { label: "Quantity", stateKey: "quantity", type: "number", placeholder: "e.g., 100", required: true },
    { label: "Size Options (comma-separated)", stateKey: "sizes", type: "text", placeholder: "e.g., 10 gms, 25 gms, 50 gms", required: false },
    { label: "Description", stateKey: "description", type: "textarea", placeholder: "Detailed product description", required: true },
  ];

  const categories = [
    'Flower Seeds',
    'Vegetable Seeds',
    'Herb Seeds',
    'Fruit Seeds',
    'Grain Seeds',
    'Other'
  ];

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">➕ Add New Product</h2>
      <form onSubmit={handleSubmit} style={styles.formContainer}>
        
        {/* --- Image File Input Section (AT TOP) --- */}
        <div style={styles.formGroup} className="p-4 border border-dashed border-green-300 rounded-lg bg-green-50">
            <label className="text-gray-700" style={styles.label}>Product Image (Local File):</label>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-green-600 file:text-white
                hover:file:bg-green-700 cursor-pointer"
            />
            {imagePreview && (
                <div className="mt-4 p-2 border border-gray-200 rounded-lg bg-white">
                    <p className="text-sm font-semibold mb-2">Image Preview:</p>
                    <img src={imagePreview} alt="Product Preview" className="max-w-full max-h-40 rounded-lg shadow-md object-contain" />
                </div>
            )}
        </div>
        {/* --- End Image File Input Section --- */}

        {productFields.map((field) => (
          <div key={field.stateKey} style={styles.formGroup}>
            <label className="text-gray-700" style={styles.label}>{field.label}:</label>
            {field.type === "textarea" ? (
              <textarea
                name={field.stateKey}
                value={formData[field.stateKey as keyof typeof formData]}
                onChange={handleChange}
                style={styles.textarea}
                className="focus:ring-green-500 focus:border-green-500"
                placeholder={field.placeholder}
              />
            ) : (
              <input
                type={field.type}
                name={field.stateKey}
                value={formData[field.stateKey as keyof typeof formData]}
                onChange={handleChange}
                style={styles.input}
                className="focus:ring-green-500 focus:border-green-500"
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}

        {/* Category Selection */}
        <div style={styles.formGroup}>
          <label className="text-gray-700" style={styles.label}>Category:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={styles.input}
            className="focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Location Selection */}
        <div style={styles.formGroup}>
          <label className="text-gray-700" style={styles.label}>Location:</label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            style={styles.input}
            className="focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select a location</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Mysore">Mysore</option>
            <option value="Tumkur">Tumkur</option>
            <option value="Hassan">Hassan</option>
            <option value="Mangalore">Mangalore</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ ...styles.submitButton, backgroundColor: '#2a5a2a' }}
        >
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
};

// --- 2. Update Existing Product Component (UNCHANGED) ---
const UpdateExistingProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', brand: '', price: '', originalPrice: '', discount: '',
    imageUrl: '', // This holds the current saved Base64 or URL
    sizeOptions: '', description: ''
  });

  useEffect(() => {
    // Mimic fetching from a database (using localStorage)
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]') as Product[];
    setProducts(storedProducts);
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toString().includes(searchTerm)
  );

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name, brand: product.brand, price: product.price.toString(),
      originalPrice: product.originalPrice.toString(), discount: product.discount.toString(),
      imageUrl: product.imageUrl, // Set current Base64/URL
      description: product.description,
      sizeOptions: product.sizeOptions.join(', ') // Convert array to comma-separated string
    });
    // Set initial preview if an image exists
    setImagePreview(product.imageUrl);
  };

  const handleDelete = async (product: Product) => {
    // Try backend delete when jwt present
    try {
      const jwt = (window.localStorage.getItem('jwt')) || undefined;
      if (jwt) {
        await sellerProductService.deleteProduct(product.id, jwt as any);
        // Refresh list from localStorage or remove locally
        const updated = products.filter(p => p.id !== product.id);
        setProducts(updated);
        localStorage.setItem('products', JSON.stringify(updated));
        customAlert('Product deleted successfully');
        return;
      }
    } catch (err) {
      console.warn('Backend delete failed, falling back to local deletion', err);
    }

    // Fallback: remove from localStorage-managed products
    const updatedProducts = products.filter(p => p.id !== product.id);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    customAlert('Product deleted successfully (local)');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // The image is replaced by the new file
        setFormData(prev => ({ ...prev, imageUrl: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      // If user clears the file input, we keep the original image unless they explicitly clear it later
      // For simplicity, we assume clearing means they want to remove it for now.
      setFormData(prev => ({ ...prev, imageUrl: '' }));
      setImagePreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const updatedProducts = products.map(product =>
      product.id === selectedProduct.id
        ? {
          ...product,
          ...formData,
          price: parseFloat(formData.price || '0'),
          originalPrice: parseFloat(formData.originalPrice || '0'),
          discount: parseFloat(formData.discount || '0'),
          sizeOptions: formData.sizeOptions.split(',').map(s => s.trim()).filter(s => s.length > 0),
        }
        : product
    );
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    customAlert('Product updated successfully!');
    setSelectedProduct(null); // Close the form
    setImagePreview(null);
  };
  
  const productFields = [
    { label: "Product Name", stateKey: "name", type: "text" },
    { label: "Brand", stateKey: "brand", type: "text" },
    { label: "Price (₹)", stateKey: "price", type: "number" },
    { label: "Original Price (₹)", stateKey: "originalPrice", type: "number" },
    { label: "Discount (%)", stateKey: "discount", type: "number" },
    // Image URL field is removed from structured loop
    { label: "Size Options (comma-separated)", stateKey: "sizeOptions", type: "text" },
    { label: "Description", stateKey: "description", type: "textarea" },
  ];


  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">✎ Update Existing Product</h2>
      
      <p className="text-lg font-semibold text-gray-700 mb-2">1. **Search/Filter Product**</p>
      <input
        type="text"
        placeholder="Search by Product Name or ID"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ ...styles.input, width: '100%' }}
        className="mb-4 focus:ring-green-500 focus:border-green-500"
      />

      <p className="text-lg font-semibold text-gray-700 mb-2">2. **Product List ({filteredProducts.length} items)**</p>
      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
        {filteredProducts.length > 0 ? filteredProducts.map((product) => (
          <div key={product.id} className="p-3 border-b border-gray-100 last:border-b-0 flex justify-between items-center hover:bg-gray-50 transition duration-100">
            <div className="flex items-center space-x-3">
              {/* Display image preview in the list */}
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-8 h-8 object-cover rounded shadow-sm" 
                  onError={(e) => {e.currentTarget.onerror = null; e.currentTarget.src='https://placehold.co/32x32/ccc/000?text=IMG'}}
                />
              )}
              <span className="text-gray-800">{product.name} (ID: {product.id})</span>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleEdit(product)} className="text-sm px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500 transition duration-150">Edit</button>
              <button onClick={() => handleDelete(product)} className="text-sm px-3 py-1 bg-red-400 text-white rounded hover:bg-red-500 transition duration-150">Delete</button>
            </div>
          </div>
        )) : <p className="text-gray-500 p-3">No products found. Try adding one!</p>}
      </div>

      {selectedProduct && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Editing: {selectedProduct.name}</h3>
          <form onSubmit={handleSubmit} style={styles.formContainer}>
            
            {/* Image File Input Section for Update (AT TOP) */}
            <div style={styles.formGroup} className="p-4 border border-dashed border-blue-300 rounded-lg bg-blue-50">
                <label className="text-gray-700" style={styles.label}>Update Product Image (Leave blank to keep existing):</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-500 file:text-white
                    hover:file:bg-blue-600 cursor-pointer"
                />
                {imagePreview && (
                    <div className="mt-4 p-2 border border-gray-200 rounded-lg bg-white">
                        <p className="text-sm font-semibold mb-2">Current Image Preview:</p>
                        <img src={imagePreview} alt="Product Preview" className="max-w-full max-h-40 rounded-lg shadow-md object-contain" />
                    </div>
                )}
            </div>
            {/* End Image File Input Section for Update */}
            
            {productFields.map((field) => (
              <div key={field.stateKey} style={styles.formGroup}>
                <label className="text-gray-700" style={styles.label}>{field.label}:</label>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.stateKey}
                    value={formData[field.stateKey as keyof typeof formData]}
                    onChange={handleChange}
                    style={styles.textarea}
                    className="w-full focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.stateKey}
                    value={formData[field.stateKey as keyof typeof formData]}
                    onChange={handleChange}
                    style={styles.input}
                    className="w-full focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            ))}

            <button type="submit" className="transition duration-150 ease-in-out" style={{ ...styles.submitButton, backgroundColor: '#007bff' }}>
              Apply Updates
            </button>
          </form>
        </div>
      )}
    </div>
  );
};


// --- ORDER DETAILS MODAL COMPONENT ---
const OrderDetailsModal: React.FC<{ order: Order, onClose: () => void, productDetails: Product | null }> = ({ order, onClose, productDetails }) => {

  const handleShare = () => {
    const shareText = `Order ID: ${order.id}\nProduct: ${order.productName}\nQuantity: ${order.quantity}\nTotal: ₹${order.totalCost.toFixed(2)}\nCustomer: ${order.customerName}\nEmail: ${order.customerDetails?.email || 'N/A'}`;

    // Simulate copying to clipboard as navigator.clipboard might fail in iFrame
    const tempInput = document.createElement('textarea');
    tempInput.value = shareText;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    customAlert('Order details copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="text-2xl font-bold text-gray-800">Order Details: #{order.id}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-light leading-none">&times;</button>
          </div>

          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-green-700">Order Summary</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-medium">Status: <span className={`font-bold ${order.status === 'Delivered' ? 'text-green-600' : order.status === 'Cancelled' ? 'text-red-600' : 'text-orange-500'}`}>{order.status}</span></p>
                <p className="font-medium">Date/Time: <span className="font-normal">{order.date}</span></p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-medium">Quantity: <span className="font-normal">{order.quantity}</span></p>
                <p className="font-medium">Total Cost: <span className="font-normal text-xl text-green-800">₹{order.totalCost.toFixed(2)}</span></p>
              </div>
            </div>

            <h4 className="text-xl font-semibold text-green-700 mt-6">Customer Information</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping Address</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.customerDetails?.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.customerDetails?.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-600 max-w-xs">{order.customerDetails?.address || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-xl font-semibold text-green-700 mt-6">Product Details (At Time of Order)</h4>
            <div className="overflow-x-auto">
              {productDetails ? (
                <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price (Ordered)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{productDetails.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{productDetails.brand}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{order.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-normal text-sm text-gray-600 max-w-md">{productDetails.description.substring(0, 100)}...</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-red-500 p-4 border rounded-lg">Product details could not be found in the current inventory data.</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-8 space-x-3">
            <button 
              onClick={handleShare}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out flex items-center shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.883 13.142 9 12.87 9 12.5a2.5 2.5 0 015 0c0 .37-.117.63-.316.842L15 16h3.916A1.084 1.084 0 0020 14.916V5.084A1.084 1.084 0 0018.916 4H5.084A1.084 1.084 0 004 5.084v9.832A1.084 1.084 0 005.084 16H9l-1.316-2.658zM12.5 7a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /></svg>
              Share Order Details
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 ease-in-out shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- 3. View Orders Component (COMPLETELY REWORKED) ---
const ViewOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Helper function to create rich mock order data linked to products
  const getMockOrders = (availableProducts: Product[]): Order[] => {
    if (availableProducts.length === 0) return [];

    const p1 = availableProducts[0];
    const p2 = availableProducts.length > 1 ? availableProducts[1] : p1;

    // Define the mock orders using the available product data
    const mockOrders: Order[] = [
        {
            id: 'O1001',
            customerName: 'Riya Sharma',
            customerDetails: { email: 'riya@example.com', phone: '9876543210', address: '123 Garden Lane, Pune, 411001' },
            productId: p1.id,
            productName: p1.name,
            productImage: p1.imageUrl,
            price: p1.price,
            quantity: 2,
            totalCost: p1.price * 2,
            status: 'Delivered',
            date: '2025-10-29 10:30 AM',
        },
        {
            id: 'O1002',
            customerName: 'Amit Singh',
            customerDetails: { email: 'amit@example.com', phone: '8765432109', address: '45 Green Road, Bangalore, 560001' },
            productId: p2.id,
            productName: p2.name,
            productImage: p2.imageUrl,
            price: p2.price,
            quantity: 1,
            totalCost: p2.price,
            status: 'Out for Delivery',
            date: '2025-10-30 03:45 PM',
        },
        {
            id: 'O1003',
            customerName: 'Priya Verma',
            customerDetails: { email: 'priya@example.com', phone: '7654321098', address: '78 Farm View, Chennai, 600001' },
            productId: p1.id,
            productName: p1.name,
            productImage: p1.imageUrl,
            price: p1.price,
            quantity: 3,
            totalCost: p1.price * 3,
            status: 'Order Placed',
            date: '2025-10-31 09:15 AM',
        },
    ];

    return mockOrders;
  };

  useEffect(() => {
    // 1. Fetch Products first (to link with orders)
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]') as Product[];
    setProducts(storedProducts);

    // 2. Load or Initialize Orders
    let storedOrders = JSON.parse(localStorage.getItem('orders') || '[]') as Order[];

    // Only initialize mock data if no products or orders exist
    if (storedOrders.length === 0 && storedProducts.length > 0) {
      storedOrders = getMockOrders(storedProducts);
      try {
        localStorage.setItem('orders', JSON.stringify(storedOrders));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          customAlert('Storage quota exceeded. Please remove some products or clear browser data.');
        } else {
          customAlert('An error occurred while saving orders.');
        }
      }
    } else if (storedProducts.length > 0 && storedOrders.length > 0) {
        // Optional: Ensure loaded orders have a valid image from current inventory and update price/totalCost
        storedOrders = storedOrders.map(order => {
            const product = storedProducts.find(p => p.id === order.productId);
            if (product) {
                return { ...order, productName: product.name, productImage: product.imageUrl, price: product.price, totalCost: product.price * order.quantity };
            }
            // If product not found, set default price and totalCost to avoid undefined errors
            return { ...order, price: 0, totalCost: 0 };
        });
    }

    setOrders(storedOrders);
  }, []);


  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Order Placed': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'Out for Delivery': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'Delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'Cancelled': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };
  
  const showOrderDetails = (order: Order) => {
    setSelectedOrderDetails(order);
    setShowDetailsModal(true);
  };
  
  const getProductDetailsForModal = (order: Order): Product | null => {
      return products.find(p => p.id === order.productId) || null;
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">📋 View Orders ({orders.length} Total)</h2>
      
      {orders.length === 0 ? (
          <p className="p-4 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              No orders found. Please add products first and then restart to load mock orders.
          </p>
      ) : (
          <div className="space-y-6">
              {orders.map((order) => (
                  <div 
                      key={order.id} 
                      className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition duration-300"
                  >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                          
                          {/* 1. Left Corner: Product Image & Details */}
                          <div className="flex items-start space-x-4 w-full md:w-3/5">
                              {/* Image */}
                              <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-300">
                                  <img 
                                      src={order.productImage} 
                                      alt={order.productName} 
                                      className="w-full h-full object-cover" 
                                      onError={(e) => {
                                          e.currentTarget.onerror = null; 
                                          e.currentTarget.src = "https://placehold.co/80x80/2a5a2a/ffffff?text=IMG"; // Fallback placeholder
                                      }}
                                  />
                              </div>
                              
                              {/* Product Details */}
                              <div className="flex-grow">
                                  <p className="text-lg font-bold text-gray-800 leading-tight">{order.productName}</p>
                                  <div className="mt-1 text-sm text-gray-700 space-y-0.5">
                                      <p>Price: ₹{order.price.toFixed(2)} | Qty: <span className="font-semibold">{order.quantity}</span></p>
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                                      <p>Order ID: <span className="font-mono text-gray-600">{order.id}</span></p>
                                      <p>Date/Time: <span className="font-normal">{order.date}</span></p>
                                  </div>
                              </div>
                          </div>
                          
                          {/* 2. Right Side: Customer, Status & Actions */}
                          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-0 w-full md:w-2/5">
                              
                              {/* Customer Name */}
                              <p className="text-md font-medium text-gray-700 w-full md:text-right">
                                  Customer: <span className="font-semibold text-gray-900">{order.customerName}</span>
                              </p>

                              {/* Status Dropdown and Details Button */}
                              <div className="flex items-center space-x-3 mt-2 w-full justify-between sm:justify-end">
                                  {/* Status Dropdown */}
                                  <div className={`p-1 rounded-lg border flex items-center ${getStatusColor(order.status)}`}>
                                      <select
                                          value={order.status}
                                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                          className={`appearance-none bg-transparent text-sm font-semibold cursor-pointer focus:outline-none ${getStatusColor(order.status)}`}
                                      >
                                          {STATUS_OPTIONS.map(status => (
                                              <option key={status} value={status} className="text-gray-900 bg-white">{status}</option>
                                          ))}
                                      </select>
                                      <KeyboardArrowDownIcon className="h-4 w-4 ml-1" />
                                  </div>
                                  
                                  {/* Details Button */}
                                  <button 
                                      onClick={() => showOrderDetails(order)}
                                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-150 ease-in-out shadow-md"
                                  >
                                      Details
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
      
      {/* Order Details Modal */}
      {showDetailsModal && selectedOrderDetails && (
          <OrderDetailsModal 
              order={selectedOrderDetails} 
              onClose={() => setShowDetailsModal(false)}
              productDetails={getProductDetailsForModal(selectedOrderDetails)}
          />
      )}
    </div>
  );
};


// --- 4. Analyze Sales Data Component (EXTENDED) ---
const AnalyzeSalesData = () => {
  // State management: selectedTimeframe controls which data view is active (week, month, year)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'Week' | 'Month' | 'Year'>('Month');

  // Data structure: Placeholder sales data arrays for each timeframe
  // Each object has a 'period' (label) and 'revenue' (value in rupees)
  // Week: 7 days, Month: 30 days (simplified to 4 weeks for chart), Year: 12 months
  const salesData = {
    Week: [
      { period: 'Mon', revenue: 5000 },
      { period: 'Tue', revenue: 7000 },
      { period: 'Wed', revenue: 6000 },
      { period: 'Thu', revenue: 8000 },
      { period: 'Fri', revenue: 9000 },
      { period: 'Sat', revenue: 11000 },
      { period: 'Sun', revenue: 10000 },
    ],
    Month: [
      { period: 'Week 1', revenue: 25000 },
      { period: 'Week 2', revenue: 30000 },
      { period: 'Week 3', revenue: 28000 },
      { period: 'Week 4', revenue: 35000 },
    ],
    Year: [
      { period: 'Jan', revenue: 120000 },
      { period: 'Feb', revenue: 135000 },
      { period: 'Mar', revenue: 150000 },
      { period: 'Apr', revenue: 140000 },
      { period: 'May', revenue: 160000 },
      { period: 'Jun', revenue: 180000 },
      { period: 'Jul', revenue: 170000 },
      { period: 'Aug', revenue: 190000 },
      { period: 'Sep', revenue: 200000 },
      { period: 'Oct', revenue: 210000 },
      { period: 'Nov', revenue: 220000 },
      { period: 'Dec', revenue: 230000 },
    ],
  };

  // UI logic: Calculate dynamic metrics based on selected timeframe
  const currentData = salesData[selectedTimeframe];
  const totalRevenue = currentData.reduce((sum, item) => sum + item.revenue, 0);
  const totalSales = Math.floor(totalRevenue / 100); // Placeholder: assume avg sale ~₹100
  const growth = selectedTimeframe === 'Week' ? '+8%' : selectedTimeframe === 'Month' ? '+12%' : '+15%'; // Placeholder growth rates

  // UI logic: Tab options for timeframe selection
  const timeframes: ('Week' | 'Month' | 'Year')[] = ['Week', 'Month', 'Year'];

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">📈 Analyze Sales Data</h2>

      {/* Timeframe Selection: Interactive tabs for switching views */}
      <div className="mb-6">
        <p className="text-lg font-semibold text-gray-700 mb-3">Select Timeframe:</p>
        <div className="flex gap-2" role="tablist" aria-label="Sales data timeframe">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-6 py-3 border rounded-lg font-semibold transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 ${
                selectedTimeframe === timeframe
                  ? 'bg-green-600 text-white border-green-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-green-400'
              }`}
              role="tab"
              aria-selected={selectedTimeframe === timeframe}
              aria-controls={`chart-${timeframe.toLowerCase()}`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics: Dynamic values based on selected timeframe */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-5 bg-white rounded-xl shadow-md border-l-4 border-green-600">
          <h3 className="text-lg font-medium text-gray-500">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2 text-gray-800">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500">for the selected {selectedTimeframe.toLowerCase()}</p>
        </div>
        <div className="p-5 bg-white rounded-xl shadow-md border-l-4 border-green-600">
          <h3 className="text-lg font-medium text-gray-500">Total Sales</h3>
          <p className="text-3xl font-bold mt-2 text-gray-800">{totalSales.toLocaleString()}</p>
          <p className="text-sm text-gray-500">items sold</p>
        </div>
        <div className="p-5 bg-white rounded-xl shadow-md border-l-4 border-green-600">
          <h3 className="text-lg font-medium text-gray-500">Sales Growth</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{growth}</p>
          <p className="text-sm text-gray-500">compared to previous {selectedTimeframe.toLowerCase()}</p>
        </div>
      </div>

      {/* Sales Chart: Dynamic Recharts LineChart that updates based on selectedTimeframe */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
          Revenue Trend ({selectedTimeframe})
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={currentData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              aria-label={`Revenue trend chart for ${selectedTimeframe.toLowerCase()}`}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="period"
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#16a34a', strokeWidth: 2, fill: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Interactive chart showing revenue trends. Hover over points for details.
        </p>
      </div>
    </div>
  );
};


// --- MAIN COMBINED COMPONENT (UNCHANGED) ---
const App = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const profileDropdownRef = useRef<HTMLDivElement>(null);

    const getSellerFullName = () => {
      if (user?.email) {
          const storedUserData = localStorage.getItem(`user_${user.email}`);
          if (storedUserData) {
              const parsedUser = JSON.parse(storedUserData);
              return parsedUser.fullName || 'Seller';
          }
      }
      return 'Seller';
    };

    const handleActionClick = (action: string) => {
      setActiveView(action);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleViewProfile = () => {
        navigate('/seller-profile');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        };

        if (isProfileDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileDropdownOpen]);

    // --- VIEW RENDERING LOGIC ---
    const renderContent = () => {
      switch (activeView) {
        case 'addProduct':
          return <AddNewProduct />;
        case 'updateProduct':
          return <UpdateExistingProduct />;
        case 'viewOrders':
          return <ViewOrders />; // The updated component
        case 'analyzeSales':
          return <AnalyzeSalesData />;
        case 'dashboard':
        default:
          // Sample data for mini dashboard chart
          const dashboardData = [
            { name: 'Revenue', value: 125000, color: '#16a34a' },
            { name: 'Sales', value: 1250, color: '#3b82f6' },
            { name: 'Growth', value: 12, color: '#f59e0b' },
          ];

          return (
            <>
              <h2 className="text-5xl font-bold text-gray-800 text-center mb-6 border-b pb-2">
                Seller Dashboard
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {actionItems.map((item) => (
                  <ActionCard
                    key={item.title}
                    title={item.title}
                    icon={item.icon}
                    color={item.color}
                    hover={item.hover}
                    onClick={() => handleActionClick(item.action)}
                  />
                ))}
              </div>


            </>
          );
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Custom Navbar for Seller (From SellerHome.tsx) */}
        <nav className="bg-white shadow-md font-sans">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/seller-home" onClick={() => setActiveView('dashboard')}> 
                  <div className="flex items-center ml-2">
                    <img
                      src="/PestoFarm-logo.png"
                      alt="PestoFarm Logo"
                      className="w-10 h-10 rounded-full border-2 border-green-600 mr-2 object-cover shadow-sm"
                      onError={(e) => {
                        e.currentTarget.onerror = null; 
                        e.currentTarget.src = "https://placehold.co/40x40/2a5a2a/ffffff?text=PF";
                      }}
                    />
                    <h1 className="text-3xl font-bold text-green-600 cursor-pointer">PestoFarm</h1>
                  </div>
                </Link>
              </div>

              {/* Profile Icon */}
              <div className="flex items-center space-x-4">
                {user ? (
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-green-600 p-2 rounded-full hover:bg-gray-100 transition duration-150 ease-in-out"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="py-2">
                          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <div>
                                <p className="text-base font-semibold text-gray-900">{getSellerFullName()}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={handleViewProfile}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-green-600 transition duration-100"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition duration-100"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/seller-auth">
                    <button className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium shadow-md transition duration-150 ease-in-out">
                      LOGIN
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Banner Image below menu bar */}
        {activeView === 'dashboard' && (
          <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden mb-0 p-4 sm:p-6">
            <img
              src="/Seller front-page-image.png"
              alt="Seller Dashboard Banner"
              className="w-full h-auto max-h-[1250px] object-cover rounded-2xl shadow-xl"
            />
          </div>
        )}

        {/* Main Content Area Container */}
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">

          {/* Inner Content Area */}
          <div className="mt-4">
            {/* Back button for internal views */}
            {activeView !== 'dashboard' && (
              <button
                onClick={() => setActiveView('dashboard')}
                className="mb-6 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-150 ease-in-out flex items-center"
              >
                <span className="mr-2">&larr;</span> Back to Dashboard
              </button>
            )}

            {/* Render the appropriate component or the home grid */}
            {renderContent()}
          </div>
        </div>

        {activeView === 'dashboard' && <Footer />}
      </div>
    );
};

export default App;
