import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Product } from '../types';
import { useTelegram } from '../contexts/TelegramContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/Providers';

const Store: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { haptic, showMainButton, hideMainButton, user } = useTelegram();
    const { currency } = { currency: '$' }; // TODO: Get from context/settings
    const { t } = useLanguage();

    const [cart, setCart] = useState<{ [id: string]: number }>({});
    const [buying, setBuying] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    // Main Button Logic
    useEffect(() => {
        const totalItems = Object.values(cart).reduce((a: number, b: number) => a + b, 0) as number;

        if (totalItems > 0) {
            const totalPrice = products.reduce((sum, p) => {
                const qty = cart[p.id] || 0;
                return sum + (p.price * qty);
            }, 0);

            showMainButton(`${t('complete_order')} - ${currency}${totalPrice.toFixed(2)}`, handleCheckout);
        } else {
            hideMainButton();
        }

        return () => hideMainButton();
    }, [cart, products]);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .gt('quantity', 0); // Only available items

            if (error) throw error;

            if (data) {
                // Map DB 'quantity' to 'stock'
                const mapped: Product[] = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    stock: p.quantity, // MAP quantity -> stock
                    quantity: p.quantity,
                    imageUrl: p.image_url,
                    category: 'General', // Default if missing
                    sku: p.id.slice(0, 8), // Default fake SKU
                    cost: 0,
                    minStock: 0,
                    unit: 'pcs'
                }));
                setProducts(mapped);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product: Product) => {
        haptic('light');
        setCart(prev => ({
            ...prev,
            [product.id]: (prev[product.id] || 0) + 1
        }));
    };

    const handleRemoveOne = (product: Product) => {
        haptic('light');
        setCart(prev => {
            const current = prev[product.id] || 0;
            if (current <= 1) {
                const newCart = { ...prev };
                delete newCart[product.id];
                return newCart;
            }
            return { ...prev, [product.id]: current - 1 };
        });
    };

    const handleCheckout = async () => {
        if (!user) {
            haptic('error');
            alert("Please open in Telegram to buy.");
            return;
        }

        setBuying(true);
        haptic('heavy');

        try {
            // Simplified Checkout: Create one order
            // In a real app, we'd verify stock again on server side

            const totalAmount = products.reduce((sum, p) => sum + (p.price * (cart[p.id] || 0)), 0);

            const itemsJson = Object.entries(cart).map(([pid, qty]) => {
                const p = products.find(x => x.id === pid);
                return {
                    product_id: pid,
                    quantity: qty,
                    price: p?.price || 0,
                    name: p?.name
                };
            });

            const { error } = await supabase
                .from('orders')
                .insert({
                    user_id: user?.id, // Supabase ID associated with TG ID
                    // staff_id: null, self-service
                    total_amount: totalAmount,
                    status: 'pending',
                    items: itemsJson
                });

            if (error) throw error;

            haptic('success');
            alert("Order placed successfully!");
            setCart({});
            hideMainButton();

        } catch (e: any) {
            haptic('error');
            console.error(e);
            alert("Checkout failed: " + e.message);
        } finally {
            setBuying(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="animate-spin text-blue-500" />
        </div>
    );

    return (
        <div className="p-4 pb-24 space-y-4 animate-in fade-in">
            <h1 className="text-2xl font-bold mb-4 dark:text-white">Store</h1>

            <div className="grid grid-cols-2 gap-4">
                {products.map(product => {
                    const qtyInCart = cart[product.id] || 0;

                    return (
                        <div key={product.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
                            <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="p-3 flex-1 flex flex-col">
                                <h3 className="font-medium text-slate-900 dark:text-white line-clamp-1">{product.name}</h3>
                                {product.description && <p className="text-xs text-slate-500 line-clamp-2 mt-1">{product.description}</p>}
                                <div className="mt-auto pt-2 flex items-center justify-between">
                                    <span className="font-bold text-slate-900 dark:text-white">{currency}{product.price}</span>

                                    {qtyInCart === 0 ? (
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium active:scale-95 transition-transform"
                                        >
                                            Add
                                        </button>
                                    ) : (
                                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                                            <button
                                                onClick={() => handleRemoveOne(product)}
                                                className="px-2 py-1 text-slate-600 dark:text-slate-300 active:bg-slate-200 dark:active:bg-slate-700 rounded-l-lg"
                                            >-</button>
                                            <span className="px-2 font-medium text-sm dark:text-white">{qtyInCart}</span>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="px-2 py-1 text-slate-600 dark:text-slate-300 active:bg-slate-200 dark:active:bg-slate-700 rounded-r-lg"
                                            >+</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {products.length === 0 && (
                <div className="text-center text-slate-500 mt-10">
                    <AlertCircle className="mx-auto mb-2" />
                    No products available.
                </div>
            )}
        </div>
    );
};

export default Store;
