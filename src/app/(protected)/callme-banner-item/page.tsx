"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCallmeBanner } from '@/src/hook/banner/useCallmeBanner';
import { CallmeBannerItem } from '@/src/models/BannerModels';
import { Button } from '@/src/components/multipage/Button';
import { PageHeader } from '@/src/components/multipage/PageHeader';
import { FormSection } from '@/src/components/multipage/FormSection';
import { Table, Column, ActionButton } from '@/src/components/multipage/Table';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function CallMeBannerItemPage() {
  const router = useRouter();
  const { 
    items, 
    loading, 
    deleteItem, 
    refreshBanner 
  } = useCallmeBanner();
  
  const handleDelete = async (item: CallmeBannerItem) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      try {
        await deleteItem(item.id);
        await refreshBanner();
      } catch (err) {
        console.error('Error deleting item:', err);
        alert('Terjadi kesalahan saat menghapus data');
      }
    }
  };

  const handleEdit = (item: CallmeBannerItem) => {
    router.push(`/callme-banner-item/${item.id}/edit`);
  };

  const columns: Column<CallmeBannerItem>[] = [
    {
      header: 'ID',
      accessor: 'id',
      sortable: true
    },
    {
      header: 'Judul (ID)',
      accessor: (item) => item.title?.id || '-',
      sortable: true
    },
    {
      header: 'Judul (EN)',
      accessor: (item) => item.title?.en || '-',
      sortable: true
    },
    {
      header: 'Subtitle (ID)',
      accessor: (item) => item.subtitle?.id || '-'
    },
    {
      header: 'Subtitle (EN)',
      accessor: (item) => item.subtitle?.en || '-'
    }
  ];

  const actions: ActionButton<CallmeBannerItem>[] = [
    {
      label: 'Edit',
      icon: <Pencil size={14} />,
      onClick: handleEdit,
      variant: 'secondary'
    },
    {
      label: 'Hapus',
      icon: <Trash2 size={14} />,
      onClick: handleDelete,
      variant: 'destructive'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Call Me Banner Items"
        description="Kelola item yang ditampilkan pada banner call me"
        actions={
          <Button 
            icon={<Plus size={16} />}
            onClick={() => router.push('/callme-banner-item/new')}
          >
            Tambah Item Baru
          </Button>
        }
      />

      <FormSection title="Daftar Item" description="Item yang tersedia pada banner call me">
        <Table
          data={items}
          columns={columns}
          actions={actions}
          keyField="id"
          isLoading={loading}
          emptyMessage="Belum ada item banner"
        />
      </FormSection>
    </div>
  );
}