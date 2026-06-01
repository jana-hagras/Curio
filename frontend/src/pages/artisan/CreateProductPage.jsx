import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { marketItemService } from '../../services/marketItemService';
import { uploadService } from '../../services/uploadService';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function CreateProductPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ item: '', description: '', price: '', availQuantity: '', category: CATEGORIES[0], image: '' });
  const [imageFile, setImageFile] = useState(null);
  const { t } = useTranslation(['dashboard', 'common']);

  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item || !form.price || !form.availQuantity) return toast.error(t('dashboard:products.fillRequired', 'Fill required fields'));
    if (Number(form.price) < 0) return toast.error(t('dashboard:products.negativePrice', 'Price cannot be negative'));
    if (Number(form.availQuantity) < 0) return toast.error(t('dashboard:products.negativeQty', 'Quantity cannot be negative'));
    setLoading(true);
    try {
      let finalImageUrl = form.image;
      
      if (imageFile) {
        const uploadRes = await uploadService.uploadImage(imageFile);
        if (uploadRes.ok && uploadRes.imageUrl) {
          finalImageUrl = uploadRes.imageUrl;
        } else {
          throw new Error("Upload failed");
        }
      }

      await marketItemService.create({ 
        ...form, 
        images: finalImageUrl ? [finalImageUrl] : [], 
        artisan_id: user.id 
      });
      toast.success(t('dashboard:products.productListed', 'Product listed!'));
      navigate('/dashboard/products');
    } catch (err) { toast.error(t('dashboard:products.failedCreate', 'Failed to create product')); }
    finally { setLoading(false); }
  };

  const categoryOptions = CATEGORIES.map(c => ({
    value: c,
    label: t('common:categories.' + c, c)
  }));

  return (
    <div style={{ width: '100%', background: 'var(--surface-primary)', padding: 32, borderRadius: 'var(--radius-lg)' }}>
      <h1 style={{ marginBottom: 24 }}>{t('dashboard:products.addNewProduct', 'Add New Product')}</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input label={t('dashboard:products.itemName', 'Item Name *')} value={form.item} onChange={e => setForm({...form, item: e.target.value})} required />
        <Select label={t('dashboard:products.category', 'Category *')} options={categoryOptions} value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
        <TextArea label={t('dashboard:products.description', 'Description *')} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
        <div style={{ display: 'flex', gap: 16 }}>
          <Input type="number" label={t('dashboard:products.price', 'Price (USD) *')} min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
          <Input type="number" label={t('dashboard:products.quantity', 'Quantity *')} min="0" step="1" value={form.availQuantity} onChange={e => setForm({...form, availQuantity: e.target.value})} required />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{t('dashboard:products.productImage', 'Product Image')}</label>
          <input type="file" accept="image/*" onChange={handleImageFileChange} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('dashboard:products.imagePlaceholder', 'Or provide an image URL below (e.g. Unsplash URL)')}</p>
          <Input placeholder="https://images.unsplash.com/photo-..." value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
          {(imageFile || form.image) && (
             <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--green-600)', fontWeight: 600 }}>{t('dashboard:products.imageSelected', 'Image selected!')}</p>
             </div>
          )}
        </div>

        <Button type="submit" loading={loading} size="lg">{t('dashboard:products.listProduct', 'List Product')}</Button>
      </form>
    </div>
  );
}
