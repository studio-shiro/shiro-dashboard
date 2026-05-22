"use client";

import { useState, useMemo } from "react";
import type { BrandTableRow } from "@/types/database";
import {
  FeedbackBanner,
  type FeedbackBannerState,
} from "@/components/shared/FeedbackBanner";
import { BrandsPageHeader } from "./BrandsPageHeader";
import { BrandsTable } from "./BrandsTable";
import { BrandFormModal } from "./BrandFormModal";

interface BrandsViewProps {
  brands: BrandTableRow[];
}

export function BrandsView({ brands }: BrandsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [banner, setBanner] = useState<FeedbackBannerState>(null);
  const [modalState, setModalState] = useState<{
    open: boolean;
    brand: BrandTableRow | null;
  }>({ open: false, brand: null });

  const filteredBrands = useMemo(() => {
    if (!searchTerm.trim()) return brands;
    const term = searchTerm.toLowerCase();
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        (b.description?.toLowerCase().includes(term) ?? false),
    );
  }, [brands, searchTerm]);

  const isEmpty = brands.length === 0;

  const showSuccessBanner = (message: string) =>
    setBanner({ type: "success", message });
  const showErrorBanner = (message: string) =>
    setBanner({ type: "error", message });

  function openCreateModal() {
    setModalState({ open: true, brand: null });
  }

  function openEditModal(brand: BrandTableRow) {
    setModalState({ open: true, brand });
  }

  function closeModal() {
    setModalState({ open: false, brand: null });
  }

  return (
    <div className="flex flex-col gap-6">
      <BrandsPageHeader
        brandCount={brands.length}
        isEmpty={isEmpty}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAdd={openCreateModal}
      />

      {banner && (
        <FeedbackBanner banner={banner} onClose={() => setBanner(null)} />
      )}

      <BrandsTable
        brands={filteredBrands}
        originalCount={brands.length}
        onEdit={openEditModal}
        onAdd={openCreateModal}
        onActionError={showErrorBanner}
        onActionSuccess={showSuccessBanner}
      />

      {modalState.open && (
        <BrandFormModal
          brand={modalState.brand}
          onClose={closeModal}
          onSuccess={(message) => {
            showSuccessBanner(message);
            closeModal();
          }}
          onError={showErrorBanner}
        />
      )}
    </div>
  );
}
