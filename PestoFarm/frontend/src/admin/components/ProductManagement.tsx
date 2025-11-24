import React, { useState, useEffect, useCallback } from 'react';
import { adminService, AdminProduct } from '../../services/adminService';
import { productService } from '../../services/productService';
import { ProductDetail } from '../../customer/data/productData';
import { transformBackendProductToAdmin } from '../../services/adminService';

// Types
interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  imageUrl: string;
  sizeOptions: string[];
  description: string;
  category: string;
  status: 'In Stock' | 'Out of Stock';
  sellerId: string;
  sellerName: string;
  addedAt: string;
  updatedAt: string;
}

interface AuditLog {
  id: string;
  productId: number;
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  sellerName: string;
  timestamp: string;
  details: string;
}

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

interface DeleteConfirmationModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Edit Product Modal Component
const EditProductModal: React.FC<EditProductModalProps> = ({ product, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Product | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'originalPrice' || name === 'discount'
        ? parseFloat(value) || 0
        : value,
    });
  };

  const handleSizeOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const sizes = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    setFormData({
      ...formData,
      sizeOptions: sizes,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave({ ...formData, updatedAt: new Date().toISOString() });
      onClose();
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="text-2xl font-bold text-gray-800">Edit Product</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-light leading-none">&times;</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Vegetable Seeds">Vegetable Seeds</option>
                  <option value="Fruit Seeds">Fruit Seeds</option>
                  <option value="Flower Seeds">Flower Seeds</option>
                  <option value="Insecticides">Insecticides</option>
                  <option value="Fungicides">Fungicides</option>
                  <option value="Fertilizers">Fertilizers</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size Options (comma-separated)</label>
              <input
                type="text"
                value={formData.sizeOptions.join(', ')}
                onChange={handleSizeOptionsChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 10g, 25g, 50g"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 resize-none"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-150"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ product, isOpen, onClose, onConfirm }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-full mr-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Delete Product</h3>
          </div>

          <p className="text-gray-600 mb-4">
            Are you sure you want to delete <strong>{product.name}</strong>?
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This will mark the product as "Out of Stock" rather than permanently deleting it from the database.
              Customers will no longer see this product in the frontend.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150"
            >
              Mark as Out of Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Product Management Component
const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
    loadAuditLogs();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, selectedStatus, searchTerm]);

  const loadProducts = async () => {
    try {
      const apiProducts = await adminService.getAllProducts();
      setProducts(apiProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
      // Fallback to mock data if API fails
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'Tomato Seeds - Hybrid F1',
          brand: 'Pesto Seeds',
          price: 120,
          originalPrice: 185,
          discount: 35,
          imageUrl: '/images/Tomato Seeds - Hybrid F1.png',
          sizeOptions: ['10g', '25g', '50g'],
          description: 'High-yielding hybrid tomato seeds suitable for all climates.',
          category: 'Vegetable Seeds',
          status: 'In Stock',
          sellerId: 'seller-1',
          sellerName: 'Green Farms Ltd.',
          addedAt: '2025-01-10T10:30:00Z',
          updatedAt: '2025-01-10T10:30:00Z',
        },
        {
          id: 2,
          name: 'Organic Insecticide - Neem Oil',
          brand: 'AgriSafe',
          price: 450,
          originalPrice: 500,
          discount: 10,
          imageUrl: '/images/Insecticides.png',
          sizeOptions: ['100ml', '250ml', '500ml'],
          description: 'Natural neem-based insecticide for pest control.',
          category: 'Insecticides',
          status: 'In Stock',
          sellerId: 'seller-2',
          sellerName: 'Organic Solutions',
          addedAt: '2025-01-08T14:20:00Z',
          updatedAt: '2025-01-08T14:20:00Z',
        },
        {
          id: 3,
          name: 'Marigold Seed Packet',
          brand: 'Flower Power',
          price: 85,
          originalPrice: 100,
          discount: 15,
          imageUrl: '/images/Marigold Seed Packet - Orange Burst.png',
          sizeOptions: ['5g', '10g'],
          description: 'Beautiful orange marigold seeds for garden decoration.',
          category: 'Flower Seeds',
          status: 'Out of Stock',
          sellerId: 'seller-3',
          sellerName: 'Bloom Gardens',
          addedAt: '2025-01-05T09:15:00Z',
          updatedAt: '2025-01-12T16:45:00Z',
        },
      ];
      setProducts(mockProducts);
    }
  };

  const loadAuditLogs = () => {
    // Mock audit logs
    const mockLogs: AuditLog[] = [
      {
        id: '1',
        productId: 1,
        action: 'created',
        sellerName: 'Green Farms Ltd.',
        timestamp: '2025-01-10T10:30:00Z',
        details: 'Product "Tomato Seeds - Hybrid F1" was added to the platform',
      },
      {
        id: '2',
        productId: 2,
        action: 'created',
        sellerName: 'Organic Solutions',
        timestamp: '2025-01-08T14:20:00Z',
        details: 'Product "Organic Insecticide - Neem Oil" was added to the platform',
      },
      {
        id: '3',
        productId: 3,
        action: 'status_changed',
        sellerName: 'Admin',
        timestamp: '2025-01-12T16:45:00Z',
        details: 'Product status changed from "In Stock" to "Out of Stock"',
      },
    ];

    setAuditLogs(mockLogs);
  };

  const filterProducts = useCallback(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedStatus, searchTerm]);

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleSaveProduct = async (updatedProduct: Product) => {
    try {
      // Transform admin product format to backend format
      const updateData = {
        title: updatedProduct.name,
        description: updatedProduct.description,
        mrpPrice: updatedProduct.originalPrice,
        sellingPrice: updatedProduct.price,
        discountPercent: updatedProduct.discount,
        sizes: updatedProduct.sizeOptions.join(','),
        // Note: Category mapping might need adjustment based on backend expectations
      };

      // Use adminService to update product (assuming backend has admin update endpoint)
      await adminService.updateProduct(updatedProduct.id, updateData);

      const updatedProducts = products.map(product =>
        product.id === updatedProduct.id ? updatedProduct : product
      );
      setProducts(updatedProducts);

      // Add audit log
      const newLog: AuditLog = {
        id: Date.now().toString(),
        productId: updatedProduct.id,
        action: 'updated',
        sellerName: 'Admin',
        timestamp: new Date().toISOString(),
        details: `Product "${updatedProduct.name}" was updated`,
      };
      setAuditLogs(prev => [newLog, ...prev]);

      console.log('Product updated successfully:', updatedProduct);
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const confirmDeleteProduct = () => {
    if (selectedProduct) {
      const updatedProduct = { ...selectedProduct, status: 'Out of Stock' as const, updatedAt: new Date().toISOString() };
      const updatedProducts = products.map(product =>
        product.id === updatedProduct.id ? updatedProduct : product
      );
      setProducts(updatedProducts);

      // Add audit log
      const newLog: AuditLog = {
        id: Date.now().toString(),
        productId: updatedProduct.id,
        action: 'status_changed',
        sellerName: 'Admin',
        timestamp: new Date().toISOString(),
        details: `Product "${updatedProduct.name}" status changed to "Out of Stock"`,
      };
      setAuditLogs(prev => [newLog, ...prev]);

      // In real app: API call to update product status
      console.log('Product marked as out of stock:', updatedProduct);
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'In Stock'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Product Management</h1>
        <p className="text-gray-600">Manage all products listed by sellers on the platform</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
            <input
              type="text"
              placeholder="Search by name, brand, or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Categories</option>
              <option value="Vegetable Seeds">Vegetable Seeds</option>
              <option value="Fruit Seeds">Fruit Seeds</option>
              <option value="Flower Seeds">Flower Seeds</option>
              <option value="Insecticides">Insecticides</option>
              <option value="Fungicides">Fungicides</option>
              <option value="Fertilizers">Fertilizers</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="w-full p-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Products ({filteredProducts.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={product.imageUrl}
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://placehold.co/48x48/2a5a2a/ffffff?text=IMG";
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sellerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{product.price}
                    {product.discount > 0 && (
                      <span className="text-green-600 ml-1">({product.discount}% off)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(product.addedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Edit Product"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H10v-1.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Mark as Out of Stock"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No products have been added to the platform yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Audit Logs</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log.id} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg">
              <div className="flex-shrink-0">
                <div className={`p-2 rounded-full ${
                  log.action === 'created' ? 'bg-green-100' :
                  log.action === 'updated' ? 'bg-blue-100' :
                  log.action === 'deleted' ? 'bg-red-100' : 'bg-yellow-100'
                }`}>
                  {log.action === 'created' && <span className="text-green-600">➕</span>}
                  {log.action === 'updated' && <span className="text-blue-600">✎</span>}
                  {log.action === 'deleted' && <span className="text-red-600">🗑️</span>}
                  {log.action === 'status_changed' && <span className="text-yellow-600">🔄</span>}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{log.details}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-xs text-gray-500">By: {log.sellerName}</p>
                  <p className="text-xs text-gray-500">{formatDate(log.timestamp)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <EditProductModal
        product={selectedProduct}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveProduct}
      />

      <DeleteConfirmationModal
        product={selectedProduct}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteProduct}
      />
    </div>
  );
};

export default ProductManagement;
