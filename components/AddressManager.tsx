"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2, Edit2, Home, Check, X } from "lucide-react";
import { UserAddress } from "@/types";

interface AddressManagerProps {
  addresses: UserAddress[];
  onAddAddress: (address: Omit<UserAddress, "id">) => Promise<void>;
  onUpdateAddress: (addressId: string, address: Partial<UserAddress>) => Promise<void>;
  onDeleteAddress: (addressId: string) => Promise<void>;
  onSetDefault: (addressId: string) => Promise<void>;
}

export default function AddressManager({
  addresses,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefault,
}: AddressManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<UserAddress, "id">>({
    name: "",
    street: "",
    city: "",
    region: "",
    zipCode: "",
    isDefault: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      street: "",
      city: "",
      region: "",
      zipCode: "",
      isDefault: false,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await onUpdateAddress(editingId, formData);
      } else {
        await onAddAddress(formData);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleEdit = (address: UserAddress) => {
    setFormData({
      name: address.name,
      street: address.street,
      city: address.city,
      region: address.region,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setIsAdding(true);
  };

  const handleDelete = async (addressId: string) => {
    if (confirm("¿Estás seguro de eliminar esta dirección?")) {
      await onDeleteAddress(addressId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header con botón agregar */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-black text-slate-900">
          <MapPin className="h-5 w-5 text-primary-600" />
          Mis Direcciones
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 rounded-lg border-2 border-black bg-primary-500 px-3 py-2 text-sm font-bold text-white transition-all hover:bg-primary-600 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        )}
      </div>

      {/* Formulario de agregar/editar */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border-4 border-black bg-blue-50 p-4">
          <h4 className="text-sm font-black text-slate-900">
            {editingId ? "Editar Dirección" : "Nueva Dirección"}
          </h4>
          
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Nombre de la dirección *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Casa, Oficina, etc."
              className="w-full rounded border-2 border-black bg-white px-3 py-2 text-sm font-semibold focus:border-primary-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Calle y número *
            </label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="Ej: Av. Principal 123, Depto 45"
              className="w-full rounded border-2 border-black bg-white px-3 py-2 text-sm font-semibold focus:border-primary-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Ciudad *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Santiago"
                className="w-full rounded border-2 border-black bg-white px-3 py-2 text-sm font-semibold focus:border-primary-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Región *
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="Metropolitana"
                className="w-full rounded border-2 border-black bg-white px-3 py-2 text-sm font-semibold focus:border-primary-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Código Postal
            </label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              placeholder="8320000"
              className="w-full rounded border-2 border-black bg-white px-3 py-2 text-sm font-semibold focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="h-4 w-4 accent-primary-500"
            />
            <label htmlFor="isDefault" className="text-xs font-bold text-slate-700">
              Establecer como dirección predeterminada
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-black bg-primary-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-primary-600"
            >
              <Check className="h-4 w-4" />
              {editingId ? "Actualizar" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 py-2 text-sm font-bold text-slate-900 transition-all hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de direcciones */}
      <div className="space-y-3">
        {addresses.length === 0 ? (
          <div className="rounded-lg border-4 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <MapPin className="mx-auto mb-2 h-8 w-8 text-slate-400" />
            <p className="text-sm font-bold text-slate-600">
              No tienes direcciones guardadas
            </p>
            <p className="text-xs text-slate-500">
              Agrega una dirección para hacer tus compras más rápidas
            </p>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className={`rounded-lg border-4 p-4 transition-all ${
                address.isDefault
                  ? "border-primary-500 bg-primary-50"
                  : "border-black bg-white"
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Home className={`h-5 w-5 ${address.isDefault ? "text-primary-600" : "text-slate-600"}`} />
                  <div>
                    <h4 className="font-black text-slate-900">{address.name}</h4>
                    {address.isDefault && (
                      <span className="inline-block rounded border border-primary-600 bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700">
                        Predeterminada
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {!address.isDefault && (
                    <button
                      onClick={() => onSetDefault(address.id)}
                      className="rounded border-2 border-primary-500 bg-white p-1.5 text-primary-600 transition-all hover:bg-primary-50"
                      title="Marcar como predeterminada"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address)}
                    className="rounded border-2 border-black bg-white p-1.5 text-slate-700 transition-all hover:bg-slate-50"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="rounded border-2 border-red-500 bg-white p-1.5 text-red-600 transition-all hover:bg-red-50"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-slate-700">
                <p className="font-semibold">{address.street}</p>
                <p>
                  {address.city}, {address.region}
                </p>
                {address.zipCode && <p>CP: {address.zipCode}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
