import { supabase } from '../supabase';
import { getStoreId } from './queries';
import type { Product } from './types';
import { createActivity } from '../activity';

export async function uploadProductImage(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from('products').getPublicUrl(filePath);

  return publicUrl;
}

export async function createProduct(
  product: Omit<Product, 'id' | 'created_at' | 'store_id' | 'user_id'>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const storeId = await getStoreId();

  const productData = {
    ...product,
    store_id: storeId,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw new Error('Erro ao criar produto');
  }

  await createActivity({
    store_id: storeId,
    user_id: user.id,
    user_name: user.email as string,
    action_type: 'create',
    resource_type: 'product',
    description: `Produto "${product.name}" foi criado`,
  });

  return data;
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const storeId = await getStoreId();

  const productData = {
    ...product,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .eq('store_id', storeId)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw new Error('Erro ao atualizar produto');
  }

  await createActivity({
    store_id: storeId,
    user_id: user.id,
    user_name: user.email as string,
    action_type: 'update',
    resource_type: 'product',
    description: `Produto "${product.name}" foi atualizado`,
  });

  return data;
}

export async function deleteProduct(id: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const storeId = await getStoreId();

  const { data: product } = await supabase
    .from('products')
    .select('name')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('store_id', storeId);

  if (error) {
    console.error('Error deleting product:', error);
    throw new Error('Erro ao deletar produto');
  }

  await createActivity({
    store_id: storeId,
    user_id: user.id,
    user_name: user.email as string,
    action_type: 'delete',
    resource_type: 'product',
    description: `Produto "${product?.name}" foi removido`,
  });
}
