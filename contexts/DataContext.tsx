import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Product, Client, Order, CartItem, StockMovement, AppSettings } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
    products: Product[];
    clients: Client[];
    orders: Order[];
    stockMovements: StockMovement[];
    loading: boolean;
    settings: AppSettings;
    updateSettings: (settings: AppSettings) => void;
    refreshData: () => Promise<void>;

    // Actions
    updateStock: (productId: string, newStock: number) => Promise<void>;
    addProduct: (product: Product) => Promise<void>;
    editProduct: (product: Product) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
    addClient: (client: Client) => Promise<void>;
    clientPayment: (clientId: string, amount: number) => Promise<void>;
    checkout: (clientId: string, items: CartItem[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    const [products, setProducts] = useState<Product[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(false);

    // App Global Settings
    const [settings, setSettings] = useState<AppSettings>({
        companyName: 'Nexus B2B',
        currency: '$',
        taxRate: 0,
        defaultMinStock: 5
    });

    const fetchData = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        try {
            // 1. Products
            const { data: productsData } = await supabase.from('products').select('*');
            if (productsData) {
                setProducts(productsData.map((p: any) => ({
                    id: p.id,
                    sku: p.sku,
                    name: p.name,
                    category: p.category,
                    price: p.price,
                    cost: p.cost,
                    stock: p.stock,
                    minStock: p.min_stock,
                    unit: p.unit,
                    imageUrl: p.image_url
                })));
            }

            // 2. Clients
            const { data: clientsData } = await supabase.from('clients').select('*');
            if (clientsData) {
                setClients(clientsData.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    companyName: c.company_name,
                    email: c.email,
                    phone: c.phone,
                    balance: c.balance,
                    status: c.status
                })));
            }

            // 3. Orders (with Joins)
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
          *,
          clients (company_name),
          order_items (
            *,
            products (name, sku, unit, image_url)
          )
        `)
                .order('date', { ascending: false })
                .limit(100);

            if (ordersError) {
                console.error('Error fetching orders:', ordersError);
            } else if (ordersData) {
                setOrders(ordersData.map((o: any) => {
                    const mappedItems: CartItem[] = o.order_items ? o.order_items.map((item: any) => ({
                        id: item.product_id,
                        quantity: item.quantity,
                        price: item.price_at_sale,
                        name: item.products?.name || 'Unknown Product',
                        sku: item.products?.sku || '',
                        unit: item.products?.unit || 'pcs',
                        imageUrl: item.products?.image_url,
                        category: 'Sold',
                        cost: 0,
                        stock: 0,
                        minStock: 0
                    })) : [];

                    return {
                        id: o.id,
                        clientId: o.client_id,
                        clientName: o.clients?.company_name || 'Unknown Client',
                        staffId: o.staff_id,
                        items: mappedItems,
                        totalAmount: o.total_amount,
                        date: o.date,
                        status: o.status
                    };
                }));
            }

            // 4. Stock Movements
            const { data: movementsData } = await supabase
                .from('stock_movements')
                .select('*, products(name)')
                .order('created_at', { ascending: false })
                .limit(50);

            if (movementsData) {
                setStockMovements(movementsData.map((m: any) => ({
                    id: m.id,
                    productId: m.product_id,
                    productName: m.products?.name || 'Unknown',
                    type: m.type,
                    quantity: m.quantity,
                    date: m.date || m.created_at,
                    note: m.note
                })));
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, fetchData]);

    // Helper: Log Movement
    const logStockMovement = async (
        productId: string,
        type: StockMovement['type'],
        quantity: number,
        note?: string
    ) => {
        await supabase.from('stock_movements').insert({
            product_id: productId,
            type,
            quantity,
            note,
            created_at: new Date().toISOString()
        });
    };

    // --- Handlers ---

    const updateStock = async (productId: string, newStock: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const diff = newStock - product.stock;
        if (diff === 0) return;

        try {
            await supabase.from('products').update({ stock: newStock }).eq('id', productId);
            await logStockMovement(productId, diff > 0 ? 'restock' : 'adjustment', diff, 'Manual update');
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    const addProduct = async (product: Product) => {
        try {
            const dbProduct = {
                sku: product.sku,
                name: product.name,
                category: product.category,
                price: product.price,
                cost: product.cost,
                stock: product.stock,
                min_stock: product.minStock,
                unit: product.unit,
                image_url: product.imageUrl
            };

            const { data, error } = await supabase.from('products').insert(dbProduct).select();
            if (error) throw error;

            if (data && data[0]) {
                await logStockMovement(data[0].id, 'restock', product.stock, 'Initial entry');
            }
            fetchData();
        } catch (e) { console.error(e); }
    };

    const editProduct = async (updatedProduct: Product) => {
        try {
            const product = products.find(p => p.id === updatedProduct.id);
            const diff = product ? updatedProduct.stock - product.stock : 0;

            await supabase.from('products').update({
                sku: updatedProduct.sku,
                name: updatedProduct.name,
                category: updatedProduct.category,
                price: updatedProduct.price,
                cost: updatedProduct.cost,
                stock: updatedProduct.stock,
                min_stock: updatedProduct.minStock,
                unit: updatedProduct.unit,
                image_url: updatedProduct.imageUrl
            }).eq('id', updatedProduct.id);

            if (diff !== 0) {
                await logStockMovement(updatedProduct.id, diff > 0 ? 'restock' : 'adjustment', diff, 'Product edit');
            }
            fetchData();
        } catch (e) { console.error(e); }
    };

    const deleteProduct = async (productId: string) => {
        try {
            await supabase.from('products').delete().eq('id', productId);
            fetchData();
        } catch (e) { console.error(e); }
    };

    const addClient = async (client: Client) => {
        try {
            await supabase.from('clients').insert({
                name: client.name,
                company_name: client.companyName,
                email: client.email,
                phone: client.phone,
                balance: client.balance,
                status: client.status
            });
            fetchData();
        } catch (e) { console.error(e); }
    };

    const clientPayment = async (clientId: string, amount: number) => {
        const client = clients.find(c => c.id === clientId);
        if (!client) return;

        try {
            await supabase.from('clients').update({
                balance: client.balance + amount
            }).eq('id', clientId);
            fetchData();
        } catch (e) { console.error(e); }
    };

    const checkout = async (clientId: string, items: CartItem[]) => {
        if (!user) {
            alert("Error: You must be logged in to process orders.");
            return;
        }

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxAmount = subtotal * (settings.taxRate / 100);
        const totalAmount = subtotal + taxAmount;

        try {
            // 1. Create Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    client_id: clientId,
                    staff_id: user.id,
                    total_amount: totalAmount,
                    status: 'completed',
                    date: new Date().toISOString()
                })
                .select()
                .single();

            if (orderError) throw orderError;
            const orderId = orderData.id;

            // 2. Insert Order Items
            const orderItemsToInsert = items.map(item => ({
                order_id: orderId,
                product_id: item.id,
                quantity: item.quantity,
                price_at_sale: item.price
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
            if (itemsError) throw itemsError;

            // 3. Update Client Balance (Subtract total)
            const client = clients.find(c => c.id === clientId);
            if (client) {
                await supabase.from('clients').update({
                    balance: client.balance - totalAmount
                }).eq('id', clientId);
            }

            // 4. Update Stock & Log Movement
            for (const item of items) {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    const newStock = product.stock - item.quantity;
                    await supabase.from('products').update({ stock: newStock }).eq('id', item.id);

                    await logStockMovement(
                        item.id,
                        'sale',
                        -item.quantity,
                        `Order #${orderId.slice(0, 8)}`
                    );
                }
            }

            alert('Order successfully processed!');
            fetchData();
        } catch (e: any) {
            console.error("Checkout failed", e);
            alert(`Checkout failed: ${e.message || e}`);
        }
    };

    return (
        <DataContext.Provider value={{
            products,
            clients,
            orders,
            stockMovements,
            loading,
            settings,
            updateSettings: setSettings,
            refreshData: fetchData,
            updateStock,
            addProduct,
            editProduct,
            deleteProduct,
            addClient,
            clientPayment,
            checkout
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
